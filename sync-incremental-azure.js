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

const SCHEMA = 'FSM_SOLE';

const SC_FIELDS = [
    'sc.id', 'sc.businessPartner', 'sc.chargeableEfforts', 'sc.chargeableExpenses',
    'sc.chargeableMaterials', 'sc.chargeableMileages', 'sc.code', 'sc.createDateTime',
    'sc.dueDateTime', 'sc.durationInMinutes', 'sc.endDateTime', 'sc.equipments',
    'sc.externalId', 'sc.inactive', 'sc.lastChanged', 'sc.lastChangedBy',
    'sc.originCode', 'sc.originName', 'sc.priority', 'sc.remarks',
    'sc.responsibles', 'sc.startDateTime', 'sc.statusCode', 'sc.statusName',
    'sc.subject', 'sc.syncStatus', 'sc.typeCode', 'sc.typeName', 'sc.udfValues'
];

const AC_FIELDS = [
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

const stringify = (val) => {
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'object' && val !== null) return JSON.stringify(val);
    return val;
};

async function ensureSchemaAndMigration(pool) {
    console.log(`Ensuring schema [${SCHEMA}] exists...`);
    await pool.request().query(`IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = '${SCHEMA}') EXEC('CREATE SCHEMA [${SCHEMA}]')`);

    const tablesToMigrate = ['ServiceCallsFSM', 'ActivitiesFSM'];
    for (const table of tablesToMigrate) {
        const checkTable = await pool.request().query(`
            IF EXISTS (SELECT * FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id WHERE s.name = 'dbo' AND t.name = '${table}')
            AND NOT EXISTS (SELECT * FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id WHERE s.name = '${SCHEMA}' AND t.name = '${table}')
            SELECT 1 as needsMigration ELSE SELECT 0 as needsMigration
        `);

        if (checkTable.recordset[0].needsMigration) {
            console.log(`Migrating table dbo.${table} to ${SCHEMA}.${table}...`);
            await pool.request().query(`ALTER SCHEMA [${SCHEMA}] TRANSFER [dbo].[${table}]`);
        }
    }
}

async function syncServiceCalls(pool, token) {
    console.log('--- Checking ServiceCall Deltas ---');
    const result = await pool.request().query(`SELECT MAX(lastChanged) as maxTs FROM [${SCHEMA}].[ServiceCallsFSM]`);
    const lastTs = result.recordset[0].maxTs || 0;
    console.log(`Last ServiceCall Sync Timestamp: ${lastTs}`);

    let currentPage = 1;
    let totalPages = 1;

    do {
        console.log(`Fetching SC Page ${currentPage}...`);
        const queryUrl = `${process.env.FSM_QUERY_URL}?account=${process.env.FSM_ACCOUNT}&company=${process.env.FSM_COMPANY}&dtos=ServiceCall.27&page=${currentPage}&pageSize=500`;
        const query = { query: `SELECT ${SC_FIELDS.join(', ')} FROM ServiceCall sc WHERE sc.lastChanged > ${lastTs} ORDER BY sc.lastChanged ASC` };

        const response = await fetch(queryUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-Client-ID': 'FSM-Azure-Sync-Incremental',
                'X-Client-Version': '1.1.0'
            },
            body: JSON.stringify(query)
        });

        if (!response.ok) throw new Error(`SC Query failed: ${await response.text()}`);
        const pageData = await response.json();

        if (currentPage === 1) totalPages = pageData.lastPage || 1;

        if (pageData.data && pageData.data.length > 0) {
            for (const record of pageData.data) {
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
                request.input('equipment0', mssql.NVarChar, sc.equipments && sc.equipments.length > 0 ? stringify(sc.equipments[0]) : null);
                request.input('responsible0', mssql.NVarChar, sc.responsibles && sc.responsibles.length > 0 ? stringify(sc.responsibles[0]) : null);

                const baseCols = ['businessPartner', 'chargeableEfforts', 'chargeableExpenses', 'chargeableMaterials', 'chargeableMileages', 'code', 'createDateTime', 'dueDateTime', 'durationInMinutes', 'endDateTime', 'externalId', 'inactive', 'lastChanged', 'lastChangedBy', 'originCode', 'originName', 'priority', 'remarks', 'startDateTime', 'statusCode', 'statusName', 'subject', 'syncStatus', 'typeCode', 'typeName', 'equipment0', 'responsible0'];
                for (let i = 0; i <= 18; i++) {
                    const udf = sc.udfValues && sc.udfValues[i] ? sc.udfValues[i] : { meta: null, value: null };
                    request.input(`udf${i}_meta`, mssql.NVarChar, udf.meta);
                    request.input(`udf${i}_value`, mssql.NVarChar, udf.value);
                    baseCols.push(`udf${i}_meta`, `udf${i}_value`);
                }

                const updateSet = baseCols.map(col => `${col} = @${col}`).join(', ') + ', lastSync = GETDATE()';
                await request.query(`MERGE INTO [${SCHEMA}].[ServiceCallsFSM] AS target USING (SELECT @id AS id) AS source ON (target.id = source.id) WHEN MATCHED THEN UPDATE SET ${updateSet} WHEN NOT MATCHED THEN INSERT (id, ${baseCols.join(', ')}) VALUES (@id, ${baseCols.map(c => `@${c}`).join(', ')});`);
            }
            console.log(`Synced ${pageData.data.length} ServiceCalls.`);
        }
        currentPage++;
    } while (currentPage <= totalPages);
}

async function syncActivities(pool, token) {
    console.log('--- Checking Activity Deltas ---');
    const result = await pool.request().query(`SELECT MAX(lastChanged) as maxTs FROM [${SCHEMA}].[ActivitiesFSM]`);
    const lastTs = result.recordset[0].maxTs || 0;
    console.log(`Last Activity Sync Timestamp: ${lastTs}`);

    let currentPage = 1;
    let totalPages = 1;

    do {
        console.log(`Fetching AC Page ${currentPage}...`);
        const queryUrl = `${process.env.FSM_QUERY_URL}?account=${process.env.FSM_ACCOUNT}&company=${process.env.FSM_COMPANY}&dtos=Activity.43&page=${currentPage}&pageSize=500`;
        const query = { query: `SELECT ${AC_FIELDS.join(', ')} FROM Activity ac WHERE ac.lastChanged > ${lastTs} ORDER BY ac.lastChanged ASC` };

        const response = await fetch(queryUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-Client-ID': 'FSM-Azure-Sync-Incremental',
                'X-Client-Version': '1.1.0'
            },
            body: JSON.stringify(query)
        });

        if (!response.ok) throw new Error(`AC Query failed: ${await response.text()}`);
        const pageData = await response.json();

        if (currentPage === 1) totalPages = pageData.lastPage || 1;

        if (pageData.data && pageData.data.length > 0) {
            for (const record of pageData.data) {
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

                const baseCols = ['address', 'businessPartner', 'checkedOut', 'code', 'createDateTime', 'createPerson', 'dueDateTime', 'durationInMinutes', 'earliestStartDateTime', 'endDateTime', 'equipment', 'executionStage', 'externalId', 'inactive', 'lastChanged', 'lastChangedBy', 'milestone', 'objectId', 'objectType', 'personal', 'plannedDurationInMinutes', 'plannedDurationType', 'projectOrdinal', 'region', 'remarks', 'startDateTime', 'status', 'statusChangeReason', 'subject', 'syncStatus', 'travelTimeFromInMinutes', 'travelTimeToInMinutes', 'type', 'useAllEquipments', 'responsible0'];
                for (let i = 0; i <= 13; i++) {
                    const udf = ac.udfValues && ac.udfValues[i] ? ac.udfValues[i] : { meta: null, value: null };
                    request.input(`udf${i}_meta`, mssql.NVarChar, udf.meta);
                    request.input(`udf${i}_value`, mssql.NVarChar, udf.value);
                    baseCols.push(`udf${i}_meta`, `udf${i}_value`);
                }

                const updateSet = baseCols.map(col => `${col} = @${col}`).join(', ') + ', lastSync = GETDATE()';
                await request.query(`MERGE INTO [${SCHEMA}].[ActivitiesFSM] AS target USING (SELECT @id AS id) AS source ON (target.id = source.id) WHEN MATCHED THEN UPDATE SET ${updateSet} WHEN NOT MATCHED THEN INSERT (id, ${baseCols.join(', ')}) VALUES (@id, ${baseCols.map(c => `@${c}`).join(', ')});`);
            }
            console.log(`Synced ${pageData.data.length} Activities.`);
        }
        currentPage++;
    } while (currentPage <= totalPages);
}

async function main() {
    console.log('--- STARTING CONTINUOUS INCREMENTAL SYNC WITH SCHEMA SUPPORT ---');

    // Debug Environment Variables (sanitized)
    console.log('Verifying Config:');
    console.log(`- DB_SERVER: ${process.env.DB_SERVER ? 'OK' : 'MISSING'}`);
    console.log(`- DB_NAME: ${process.env.DB_NAME ? 'OK' : 'MISSING'}`);
    console.log(`- DB_USER: ${process.env.DB_USER ? 'OK' : 'MISSING'}`);
    console.log(`- FSM_CLIENT_ID: ${process.env.FSM_CLIENT_ID ? 'OK' : 'MISSING'}`);

    if (!process.env.DB_SERVER) {
        console.error('FATAL ERROR: DB_SERVER is not defined in environment variables.');
        process.exit(1);
    }

    let pool;
    try {
        pool = await mssql.connect(config);

        // One-time schema check and migration
        await ensureSchemaAndMigration(pool);

        while (true) {
            try {
                const token = await getFSMToken();
                console.log(`\nNew Sync Cycle Started at ${new Date().toLocaleString()}`);

                await syncServiceCalls(pool, token);
                await syncActivities(pool, token);

                console.log('Cycle Complete. Waiting 2 minutes...');
            } catch (cycleError) {
                console.error('Cycle Error:', cycleError.message);
            }
            await new Promise(resolve => setTimeout(resolve, 120000));
        }
    } catch (fatalError) {
        console.error('FATAL ERROR:', fatalError.message);
    } finally {
        if (pool) await pool.close();
    }
}

main();
