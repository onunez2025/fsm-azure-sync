import mssql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true,
        trustServerCertificate: false
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

const FIELDS = [
    'sc.id', 'sc.businessPartner', 'sc.chargeableEfforts', 'sc.chargeableExpenses',
    'sc.chargeableMaterials', 'sc.chargeableMileages', 'sc.code', 'sc.createDateTime',
    'sc.dueDateTime', 'sc.durationInMinutes', 'sc.endDateTime', 'sc.equipments',
    'sc.externalId', 'sc.inactive', 'sc.lastChanged', 'sc.lastChangedBy',
    'sc.originCode', 'sc.originName', 'sc.priority', 'sc.remarks',
    'sc.responsibles', 'sc.startDateTime', 'sc.statusCode', 'sc.statusName',
    'sc.subject', 'sc.syncStatus', 'sc.typeCode', 'sc.typeName', 'sc.udfValues'
];

async function getFSMToken() {
    const auth = Buffer.from(`${process.env.FSM_CLIENT_ID}:${process.env.FSM_CLIENT_SECRET}`).toString('base64');
    const response = await fetch(process.env.FSM_TOKEN_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });
    if (!response.ok) throw new Error(`Token failed: ${await response.text()}`);
    const data = await response.json();
    return data.access_token;
}

async function fetchFSMPage(token, page = 1) {
    const pageSize = 1000;
    const queryUrl = `${process.env.FSM_QUERY_URL}?account=${process.env.FSM_ACCOUNT}&company=${process.env.FSM_COMPANY}&dtos=ServiceCall.27&page=${page}&pageSize=${pageSize}`;

    const query = {
        query: `SELECT ${FIELDS.join(', ')} FROM ServiceCall sc`
    };

    const response = await fetch(queryUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-Client-ID': 'FSM-Azure-Sync-Paginated',
            'X-Client-Version': '1.2.0'
        },
        body: JSON.stringify(query)
    });

    if (!response.ok) throw new Error(`Query failed: ${await response.text()}`);
    return await response.json();
}

async function ensureTableAndColumns(pool) {
    console.log('Ensuring table and columns exist...');
    await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ServiceCallsFSM')
        CREATE TABLE ServiceCallsFSM (
            id NVARCHAR(50) PRIMARY KEY,
            businessPartner NVARCHAR(100),
            chargeableEfforts BIT,
            chargeableExpenses BIT,
            chargeableMaterials BIT,
            chargeableMileages BIT,
            code NVARCHAR(100),
            createDateTime DATETIMEOFFSET,
            dueDateTime DATETIMEOFFSET,
            durationInMinutes INT,
            endDateTime DATETIMEOFFSET,
            externalId NVARCHAR(100),
            inactive BIT,
            lastChanged BIGINT,
            lastChangedBy NVARCHAR(100),
            originCode NVARCHAR(100),
            originName NVARCHAR(100),
            priority NVARCHAR(50),
            remarks NVARCHAR(MAX),
            startDateTime DATETIMEOFFSET,
            statusCode NVARCHAR(100),
            statusName NVARCHAR(100),
            subject NVARCHAR(500),
            syncStatus NVARCHAR(50),
            typeCode NVARCHAR(100),
            typeName NVARCHAR(100),
            equipment0 NVARCHAR(MAX),
            responsible0 NVARCHAR(MAX),
            lastSync DATETIME DEFAULT GETDATE()
        )
    `);

    const tableMetadata = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'ServiceCallsFSM'");
    const existingColumns = tableMetadata.recordset.map(r => r.COLUMN_NAME.toLowerCase());

    const expectedColumns = [
        ['businessPartner', 'NVARCHAR(100)'], ['chargeableEfforts', 'BIT'], ['chargeableExpenses', 'BIT'],
        ['chargeableMaterials', 'BIT'], ['chargeableMileages', 'BIT'], ['code', 'NVARCHAR(100)'],
        ['createDateTime', 'DATETIMEOFFSET'], ['dueDateTime', 'DATETIMEOFFSET'], ['durationInMinutes', 'INT'],
        ['endDateTime', 'DATETIMEOFFSET'], ['externalId', 'NVARCHAR(100)'], ['inactive', 'BIT'],
        ['lastChanged', 'BIGINT'], ['lastChangedBy', 'NVARCHAR(100)'], ['originCode', 'NVARCHAR(100)'],
        ['originName', 'NVARCHAR(100)'], ['priority', 'NVARCHAR(50)'], ['remarks', 'NVARCHAR(MAX)'],
        ['startDateTime', 'DATETIMEOFFSET'], ['statusCode', 'NVARCHAR(100)'], ['statusName', 'NVARCHAR(100)'],
        ['subject', 'NVARCHAR(500)'], ['syncStatus', 'NVARCHAR(50)'], ['typeCode', 'NVARCHAR(100)'],
        ['typeName', 'NVARCHAR(100)'], ['equipment0', 'NVARCHAR(MAX)'], ['responsible0', 'NVARCHAR(MAX)']
    ];

    // Add UDF columns
    for (let i = 0; i <= 18; i++) {
        expectedColumns.push([`udf${i}_meta`, 'NVARCHAR(MAX)']);
        expectedColumns.push([`udf${i}_value`, 'NVARCHAR(MAX)']);
    }

    for (const [col, type] of expectedColumns) {
        if (!existingColumns.includes(col.toLowerCase())) {
            console.log(`Adding missing column: ${col}...`);
            await pool.request().query(`ALTER TABLE ServiceCallsFSM ADD ${col} ${type}`);
        }
    }
}

async function syncBatch(pool, batch) {
    const stringify = (val) => {
        if (Array.isArray(val)) return val.join(', ');
        if (typeof val === 'object' && val !== null) return JSON.stringify(val);
        return val;
    };

    for (const record of batch) {
        const sc = record.sc;
        const request = pool.request();

        request.input('id', mssql.NVarChar, sc.id);
        request.input('businessPartner', mssql.NVarChar, stringify(sc.businessPartner));
        request.input('chargeableEfforts', mssql.Bit, sc.chargeableEfforts);
        request.input('chargeableExpenses', mssql.Bit, sc.chargeableExpenses);
        request.input('chargeableMaterials', mssql.Bit, sc.chargeableMaterials);
        request.input('chargeableMileages', mssql.Bit, sc.chargeableMileages);
        request.input('code', mssql.NVarChar, sc.code);
        request.input('createDateTime', mssql.DateTimeOffset, sc.createDateTime);
        request.input('dueDateTime', mssql.DateTimeOffset, sc.dueDateTime);
        request.input('durationInMinutes', mssql.Int, sc.durationInMinutes);
        request.input('endDateTime', mssql.DateTimeOffset, sc.endDateTime);
        request.input('externalId', mssql.NVarChar, sc.externalId);
        request.input('inactive', mssql.Bit, sc.inactive);
        request.input('lastChanged', mssql.BigInt, sc.lastChanged);
        request.input('lastChangedBy', mssql.NVarChar, sc.lastChangedBy);
        request.input('originCode', mssql.NVarChar, sc.originCode);
        request.input('originName', mssql.NVarChar, sc.originName);
        request.input('priority', mssql.NVarChar, sc.priority);
        request.input('remarks', mssql.NVarChar, sc.remarks);
        request.input('startDateTime', mssql.DateTimeOffset, sc.startDateTime);
        request.input('statusCode', mssql.NVarChar, sc.statusCode);
        request.input('statusName', mssql.NVarChar, sc.statusName);
        request.input('subject', mssql.NVarChar, sc.subject);
        request.input('syncStatus', mssql.NVarChar, sc.syncStatus);
        request.input('typeCode', mssql.NVarChar, sc.typeCode);
        request.input('typeName', mssql.NVarChar, sc.typeName);

        // Handle array[0] fields
        request.input('equipment0', mssql.NVarChar, sc.equipments && sc.equipments.length > 0 ? stringify(sc.equipments[0]) : null);
        request.input('responsible0', mssql.NVarChar, sc.responsibles && sc.responsibles.length > 0 ? stringify(sc.responsibles[0]) : null);

        // Map columns for MERGE query
        const baseCols = [
            'businessPartner', 'chargeableEfforts', 'chargeableExpenses', 'chargeableMaterials',
            'chargeableMileages', 'code', 'createDateTime', 'dueDateTime', 'durationInMinutes',
            'endDateTime', 'externalId', 'inactive', 'lastChanged', 'lastChangedBy',
            'originCode', 'originName', 'priority', 'remarks', 'startDateTime',
            'statusCode', 'statusName', 'subject', 'syncStatus', 'typeCode', 'typeName',
            'equipment0', 'responsible0'
        ];

        // Handle UDFs (0-18)
        const udfCols = [];
        for (let i = 0; i <= 18; i++) {
            const udf = sc.udfValues && sc.udfValues[i] ? sc.udfValues[i] : { meta: null, value: null };
            const metaCol = `udf${i}_meta`;
            const valueCol = `udf${i}_value`;
            request.input(metaCol, mssql.NVarChar, udf.meta);
            request.input(valueCol, mssql.NVarChar, udf.value);
            udfCols.push(metaCol, valueCol);
        }

        const allCols = [...baseCols, ...udfCols];
        const updateSet = allCols.map(col => `${col} = @${col}`).join(', ') + ', lastSync = GETDATE()';
        const insertCols = ['id', ...allCols].join(', ');
        const insertVals = ['@id', ...allCols.map(col => `@${col}`)].join(', ');

        await request.query(`
            MERGE INTO ServiceCallsFSM AS target
            USING (SELECT @id AS id) AS source
            ON (target.id = source.id)
            WHEN MATCHED THEN
                UPDATE SET ${updateSet}
            WHEN NOT MATCHED THEN
                INSERT (${insertCols})
                VALUES (${insertVals});
        `);
    }
}

async function main() {
    let pool;
    try {
        console.log('--- FSM to Azure SQL Sync (Paginated) ---');
        const token = await getFSMToken();

        pool = await mssql.connect(config);
        await ensureTableAndColumns(pool);

        let currentPage = 1;
        let lastPage = 1;

        do {
            console.log(`Processing Page ${currentPage} of ${lastPage}...`);
            const pageData = await fetchFSMPage(token, currentPage);

            if (currentPage === 1) {
                lastPage = pageData.lastPage;
                console.log(`Total Objects: ${pageData.totalObjectCount}`);
                console.log(`Total Pages: ${lastPage}`);
            }

            if (pageData.data && pageData.data.length > 0) {
                await syncBatch(pool, pageData.data);
                console.log(`Page ${currentPage} synced (${pageData.data.length} records).`);
            }

            currentPage++;
        } while (currentPage <= lastPage);

        console.log('--- ALL DATA SYNCED SUCCESSFULLY ---');

    } catch (error) {
        console.error('FATAL ERROR:', error.message);
    } finally {
        if (pool) await pool.close();
    }
}

main();
