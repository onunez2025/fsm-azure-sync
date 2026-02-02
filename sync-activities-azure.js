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
    'ac.address', 'ac.businessPartner', 'ac.checkedOut', 'ac.code', 'ac.createDateTime',
    'ac.createPerson', 'ac.dueDateTime', 'ac.durationInMinutes', 'ac.earliestStartDateTime',
    'ac.endDateTime', 'ac.equipment', 'ac.executionStage', 'ac.externalId', 'ac.id',
    'ac.inactive', 'ac.lastChanged', 'ac.lastChangedBy', 'ac.milestone', 'ac.object',
    'ac.personal', 'ac.plannedDurationInMinutes', 'ac.plannedDurationType',
    'ac.projectOrdinal', 'ac.region', 'ac.remarks', 'ac.responsibles',
    'ac.startDateTime', 'ac.status', 'ac.statusChangeReason', 'ac.subject',
    'ac.syncStatus', 'ac.travelTimeFromInMinutes', 'ac.travelTimeToInMinutes',
    'ac.type', 'ac.udfValues', 'ac.useAllEquipments'
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
    const queryUrl = `${process.env.FSM_QUERY_URL}?account=${process.env.FSM_ACCOUNT}&company=${process.env.FSM_COMPANY}&dtos=Activity.43&page=${page}&pageSize=${pageSize}`;

    const query = {
        query: `SELECT ${FIELDS.join(', ')} FROM Activity ac`
    };

    const response = await fetch(queryUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-Client-ID': 'FSM-Azure-Sync-Activities',
            'X-Client-Version': '1.0.0'
        },
        body: JSON.stringify(query)
    });

    if (!response.ok) throw new Error(`Query failed: ${await response.text()}`);
    return await response.json();
}

async function ensureTableAndColumns(pool) {
    console.log('Ensuring ActivitiesFSM table and columns exist...');
    await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ActivitiesFSM')
        CREATE TABLE ActivitiesFSM (
            id NVARCHAR(50) PRIMARY KEY,
            address NVARCHAR(MAX),
            businessPartner NVARCHAR(100),
            checkedOut BIT,
            code NVARCHAR(100),
            createDateTime DATETIMEOFFSET,
            createPerson NVARCHAR(100),
            dueDateTime DATETIMEOFFSET,
            durationInMinutes INT,
            earliestStartDateTime DATETIMEOFFSET,
            endDateTime DATETIMEOFFSET,
            equipment NVARCHAR(100),
            executionStage NVARCHAR(100),
            externalId NVARCHAR(100),
            inactive BIT,
            lastChanged BIGINT,
            lastChangedBy NVARCHAR(100),
            milestone BIT,
            objectId NVARCHAR(100),
            objectType NVARCHAR(100),
            personal BIT,
            plannedDurationInMinutes INT,
            plannedDurationType NVARCHAR(50),
            projectOrdinal INT,
            region NVARCHAR(100),
            remarks NVARCHAR(MAX),
            startDateTime DATETIMEOFFSET,
            status NVARCHAR(100),
            statusChangeReason NVARCHAR(MAX),
            subject NVARCHAR(500),
            syncStatus NVARCHAR(50),
            travelTimeFromInMinutes INT,
            travelTimeToInMinutes INT,
            type NVARCHAR(100),
            useAllEquipments BIT,
            responsible0 NVARCHAR(MAX),
            lastSync DATETIME DEFAULT GETDATE()
        )
    `);

    const tableMetadata = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'ActivitiesFSM'");
    const existingColumns = tableMetadata.recordset.map(r => r.COLUMN_NAME.toLowerCase());

    const expectedColumns = [
        ['address', 'NVARCHAR(MAX)'], ['businessPartner', 'NVARCHAR(100)'], ['checkedOut', 'BIT'],
        ['code', 'NVARCHAR(100)'], ['createDateTime', 'DATETIMEOFFSET'], ['createPerson', 'NVARCHAR(100)'],
        ['dueDateTime', 'DATETIMEOFFSET'], ['durationInMinutes', 'INT'], ['earliestStartDateTime', 'DATETIMEOFFSET'],
        ['endDateTime', 'DATETIMEOFFSET'], ['equipment', 'NVARCHAR(100)'], ['executionStage', 'NVARCHAR(100)'],
        ['externalId', 'NVARCHAR(100)'], ['inactive', 'BIT'], ['lastChanged', 'BIGINT'],
        ['lastChangedBy', 'NVARCHAR(100)'], ['milestone', 'BIT'], ['objectId', 'NVARCHAR(100)'],
        ['objectType', 'NVARCHAR(100)'], ['personal', 'BIT'], ['plannedDurationInMinutes', 'INT'],
        ['plannedDurationType', 'NVARCHAR(50)'], ['projectOrdinal', 'INT'], ['region', 'NVARCHAR(100)'],
        ['remarks', 'NVARCHAR(MAX)'], ['startDateTime', 'DATETIMEOFFSET'], ['status', 'NVARCHAR(100)'],
        ['statusChangeReason', 'NVARCHAR(MAX)'], ['subject', 'NVARCHAR(500)'], ['syncStatus', 'NVARCHAR(50)'],
        ['travelTimeFromInMinutes', 'INT'], ['travelTimeToInMinutes', 'INT'], ['type', 'NVARCHAR(100)'],
        ['useAllEquipments', 'BIT'], ['responsible0', 'NVARCHAR(MAX)']
    ];

    // Add UDF columns (0-13)
    for (let i = 0; i <= 13; i++) {
        expectedColumns.push([`udf${i}_meta`, 'NVARCHAR(MAX)']);
        expectedColumns.push([`udf${i}_value`, 'NVARCHAR(MAX)']);
    }

    for (const [col, type] of expectedColumns) {
        if (!existingColumns.includes(col.toLowerCase())) {
            console.log(`Adding missing column: ${col}...`);
            await pool.request().query(`ALTER TABLE ActivitiesFSM ADD ${col} ${type}`);
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
        const ac = record.ac;
        const request = pool.request();

        request.input('id', mssql.NVarChar, ac.id);
        request.input('address', mssql.NVarChar, stringify(ac.address));
        request.input('businessPartner', mssql.NVarChar, stringify(ac.businessPartner));
        request.input('checkedOut', mssql.Bit, ac.checkedOut);
        request.input('code', mssql.NVarChar, ac.code);
        request.input('createDateTime', mssql.DateTimeOffset, ac.createDateTime);
        request.input('createPerson', mssql.NVarChar, stringify(ac.createPerson));
        request.input('dueDateTime', mssql.DateTimeOffset, ac.dueDateTime);
        request.input('durationInMinutes', mssql.Int, ac.durationInMinutes);
        request.input('earliestStartDateTime', mssql.DateTimeOffset, ac.earliestStartDateTime);
        request.input('endDateTime', mssql.DateTimeOffset, ac.endDateTime);
        request.input('equipment', mssql.NVarChar, stringify(ac.equipment));
        request.input('executionStage', mssql.NVarChar, ac.executionStage);
        request.input('externalId', mssql.NVarChar, ac.externalId);
        request.input('inactive', mssql.Bit, ac.inactive);
        request.input('lastChanged', mssql.BigInt, ac.lastChanged);
        request.input('lastChangedBy', mssql.NVarChar, ac.lastChangedBy);
        request.input('milestone', mssql.Bit, ac.milestone);
        request.input('objectId', mssql.NVarChar, ac.object ? ac.object.objectId : null);
        request.input('objectType', mssql.NVarChar, ac.object ? ac.object.objectType : null);
        request.input('personal', mssql.Bit, ac.personal);
        request.input('plannedDurationInMinutes', mssql.Int, ac.plannedDurationInMinutes);
        request.input('plannedDurationType', mssql.NVarChar, ac.plannedDurationType);
        request.input('projectOrdinal', mssql.Int, ac.projectOrdinal);
        request.input('region', mssql.NVarChar, stringify(ac.region));
        request.input('remarks', mssql.NVarChar, ac.remarks);
        request.input('startDateTime', mssql.DateTimeOffset, ac.startDateTime);
        request.input('status', mssql.NVarChar, ac.status);
        request.input('statusChangeReason', mssql.NVarChar, ac.statusChangeReason);
        request.input('subject', mssql.NVarChar, ac.subject);
        request.input('syncStatus', mssql.NVarChar, ac.syncStatus);
        request.input('travelTimeFromInMinutes', mssql.Int, ac.travelTimeFromInMinutes);
        request.input('travelTimeToInMinutes', mssql.Int, ac.travelTimeToInMinutes);
        request.input('type', mssql.NVarChar, ac.type);
        request.input('useAllEquipments', mssql.Bit, ac.useAllEquipments);

        request.input('responsible0', mssql.NVarChar, ac.responsibles && ac.responsibles.length > 0 ? stringify(ac.responsibles[0]) : null);

        const baseCols = [
            'address', 'businessPartner', 'checkedOut', 'code', 'createDateTime', 'createPerson',
            'dueDateTime', 'durationInMinutes', 'earliestStartDateTime', 'endDateTime', 'equipment',
            'executionStage', 'externalId', 'inactive', 'lastChanged', 'lastChangedBy', 'milestone',
            'objectId', 'objectType', 'personal', 'plannedDurationInMinutes', 'plannedDurationType',
            'projectOrdinal', 'region', 'remarks', 'startDateTime', 'status', 'statusChangeReason',
            'subject', 'syncStatus', 'travelTimeFromInMinutes', 'travelTimeToInMinutes', 'type',
            'useAllEquipments', 'responsible0'
        ];

        const udfCols = [];
        for (let i = 0; i <= 13; i++) {
            const udf = ac.udfValues && ac.udfValues[i] ? ac.udfValues[i] : { meta: null, value: null };
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
            MERGE INTO ActivitiesFSM AS target
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
        console.log('--- FSM to Azure SQL Sync (Activities - DTO 43) ---');
        const token = await getFSMToken();

        pool = await mssql.connect(config);
        await ensureTableAndColumns(pool);

        let currentPage = 1;
        let lastPage = 1;

        do {
            console.log(`Processing Activities Page ${currentPage} of ${lastPage}...`);
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

        console.log('--- ALL ACTIVITIES SYNCED SUCCESSFULLY ---');

    } catch (error) {
        console.error('FATAL ERROR:', error.message);
    } finally {
        if (pool) await pool.close();
    }
}

main();
