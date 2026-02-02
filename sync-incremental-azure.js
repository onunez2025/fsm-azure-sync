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

const BP_FIELDS = [
    'bp.city', 'bp.code', 'bp.country', 'bp.createDateTime', 'bp.crowdType',
    'bp.emailAddress', 'bp.externalId', 'bp.fax', 'bp.id', 'bp.inactive',
    'bp.language', 'bp.lastChanged', 'bp.mobilePhone', 'bp.name',
    'bp.officePhone', 'bp.remarks', 'bp.syncStatus', 'bp.type', 'bp.udfValues'
];
const EP_FIELDS = ['eq.businessPartner', 'eq.code', 'eq.createDateTime', 'eq.externalId', 'eq.globalUniqueId', 'eq.id', 'eq.inactive', 'eq.item', 'eq.lastChanged', 'eq.name', 'eq.syncStatus', 'eq.tool', 'eq.udfValues'];
const MA_FIELDS = [
    'mt.chargeOption', 'mt.createDateTime', 'mt.createPerson', 'mt.date',
    'mt.equipment', 'mt.id', 'mt.inactive', 'mt.item', 'mt.lastChanged',
    'mt.lastChangedBy', 'mt.object', 'mt.quantity', 'mt.remarks',
    'mt.reservedMaterials', 'mt.syncStatus', 'mt.udfValues', 'mt.warehouse'
];
const IT_FIELDS = [
    'it.code', 'it.createDateTime', 'it.externalId', 'it.groupCode', 'it.id',
    'it.inactive', 'it.inventoryItem', 'it.lastChanged', 'it.lastChangedBy',
    'it.name', 'it.nameTranslations', 'it.purchaseItem', 'it.salesItem',
    'it.serialNumberItem', 'it.syncStatus', 'it.tool', 'it.typeCode',
    'it.typeName', 'it.unitOfMeasure'
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

    const tables = [
        { name: 'ServiceCallsFSM', sql: `CREATE TABLE [${SCHEMA}].[ServiceCallsFSM] (id NVARCHAR(100) PRIMARY KEY, lastChanged BIGINT, lastSync DATETIME)` },
        { name: 'ActivitiesFSM', sql: `CREATE TABLE [${SCHEMA}].[ActivitiesFSM] (id NVARCHAR(100) PRIMARY KEY, lastChanged BIGINT, lastSync DATETIME)` },
        { name: 'BusinessPartnersFSM', sql: `CREATE TABLE [${SCHEMA}].[BusinessPartnersFSM] (id NVARCHAR(100) PRIMARY KEY, lastChanged BIGINT, lastSync DATETIME)` },
        { name: 'EquipmentsFSM', sql: `CREATE TABLE [${SCHEMA}].[EquipmentsFSM] (id NVARCHAR(100) PRIMARY KEY, lastChanged BIGINT, lastSync DATETIME)` },
        { name: 'MaterialsFSM', sql: `CREATE TABLE [${SCHEMA}].[MaterialsFSM] (id NVARCHAR(100) PRIMARY KEY, lastChanged BIGINT, lastSync DATETIME)` },
        { name: 'ItemsFSM', sql: `CREATE TABLE [${SCHEMA}].[ItemsFSM] (id NVARCHAR(100) PRIMARY KEY, lastChanged BIGINT, lastSync DATETIME)` }
    ];

    for (const table of tables) {
        const checkMigration = await pool.request().query(`
            IF EXISTS (SELECT * FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id WHERE s.name = 'dbo' AND t.name = '${table.name}')
            AND NOT EXISTS (SELECT * FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id WHERE s.name = '${SCHEMA}' AND t.name = '${table.name}')
            SELECT 1 as needsMigration ELSE SELECT 0 as needsMigration
        `);

        if (checkMigration.recordset[0].needsMigration) {
            console.log(`Migrating table dbo.${table.name} to ${SCHEMA}.${table.name}...`);
            await pool.request().query(`ALTER SCHEMA [${SCHEMA}] TRANSFER [dbo].[${table.name}]`);
        }

        await pool.request().query(`IF NOT EXISTS (SELECT * FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id WHERE s.name = '${SCHEMA}' AND t.name = '${table.name}') ${table.sql}`);
    }
}

const checkedColumns = new Set();

async function genericSync(pool, token, entityName, dtoVersion, fields, lastSyncTable, recordKey) {
    console.log(`--- Starting Deep Sync for ${entityName} ---`);

    // Get the maximum lastChanged and the ID associated with it to build a unique cursor
    const cursorResult = await pool.request().query(`
        SELECT TOP 1 lastChanged, id FROM [${SCHEMA}].[${lastSyncTable}] 
        ORDER BY lastChanged DESC, id DESC
    `);

    let cursorTs = 0;
    let cursorId = null;

    if (cursorResult.recordset.length > 0) {
        cursorTs = cursorResult.recordset[0].lastChanged;
        cursorId = cursorResult.recordset[0].id;
    }

    console.log(`Cursor for ${entityName}: lastChanged=${cursorTs}, lastId=${cursorId || 'NONE'}`);

    let hasMore = true;
    let totalSynced = 0;

    while (hasMore) {
        // Build the where clause for Deep Pagination
        // (lastChanged = :lastTs AND id > :lastId) OR (lastChanged > :lastTs)
        const whereClause = cursorId
            ? `((${recordKey}.lastChanged = ${cursorTs} AND ${recordKey}.id > '${cursorId}') OR (${recordKey}.lastChanged > ${cursorTs}))`
            : `${recordKey}.lastChanged >= ${cursorTs}`;

        const queryUrl = `${process.env.FSM_QUERY_URL}?account=${process.env.FSM_ACCOUNT}&company=${process.env.FSM_COMPANY}&dtos=${entityName}.${dtoVersion}&page=1&pageSize=500`;
        const query = { query: `SELECT ${fields.join(', ')} FROM ${entityName} ${recordKey} WHERE ${whereClause} ORDER BY ${recordKey}.lastChanged ASC, ${recordKey}.id ASC` };

        const response = await fetch(queryUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-Client-ID': 'FSM-Azure-Sync-DeepPagination',
                'X-Client-Version': '1.2.0'
            },
            body: JSON.stringify(query)
        });

        if (!response.ok) throw new Error(`${entityName} Query failed: ${await response.text()}`);
        const pageData = await response.json();

        if (pageData.data && pageData.data.length > 0) {
            for (const record of pageData.data) {
                const data = record[recordKey];
                const request = pool.request();
                const columns = [];

                for (const key in data) {
                    if (key === 'udfValues' || key === 'id') continue;
                    let val = data[key];

                    if (key === 'nameTranslations' && val && typeof val === 'object') {
                        for (const lang in val) {
                            const colName = `nameTranslations_${lang}`;
                            request.input(colName, stringify(val[lang]));
                            columns.push(colName);
                        }
                        continue;
                    }

                    if (key === 'object' && val && typeof val === 'object') {
                        request.input('objectId', stringify(val.objectId));
                        request.input('objectType', stringify(val.objectType));
                        columns.push('objectId', 'objectType');
                        continue;
                    }

                    if (key === 'reservedMaterials' && Array.isArray(val)) {
                        for (let i = 0; i <= 1; i++) {
                            const colName = `reservedMaterial${i}`;
                            request.input(colName, val[i] ? stringify(val[i]) : null);
                            columns.push(colName);
                        }
                        continue;
                    }

                    if (typeof val === 'object' && val !== null && val.objectId) val = val.objectId;
                    else val = stringify(val);

                    request.input(key, val);
                    columns.push(key);
                }

                if (data.udfValues) {
                    const udfCounts = { 'BusinessPartner': 3, 'Activity': 13, 'Equipment': 8, 'ServiceCall': 18, 'Material': 7 };
                    const maxUdf = udfCounts[entityName] !== undefined ? udfCounts[entityName] : 10;
                    for (let i = 0; i <= maxUdf; i++) {
                        const udf = data.udfValues[i] || { meta: null, value: null };
                        request.input(`udf${i}_meta`, udf.meta);
                        request.input(`udf${i}_value`, udf.value);
                        columns.push(`udf${i}_meta`, `udf${i}_value`);
                    }
                }

                for (const col of columns) {
                    const cacheKey = `${lastSyncTable}.${col}`;
                    if (!checkedColumns.has(cacheKey)) {
                        await pool.request().query(`
                            IF NOT EXISTS (SELECT * FROM sys.columns c JOIN sys.tables t ON c.object_id = t.object_id JOIN sys.schemas s ON t.schema_id = s.schema_id WHERE s.name = '${SCHEMA}' AND t.name = '${lastSyncTable}' AND c.name = '${col}')
                            ALTER TABLE [${SCHEMA}].[${lastSyncTable}] ADD [${col}] NVARCHAR(MAX)
                        `);
                        checkedColumns.add(cacheKey);
                    }
                }

                if (!checkedColumns.has(`${lastSyncTable}.lastSync`)) {
                    await pool.request().query(`IF NOT EXISTS (SELECT * FROM sys.columns c JOIN sys.tables t ON c.object_id = t.object_id JOIN sys.schemas s ON t.schema_id = s.schema_id WHERE s.name = '${SCHEMA}' AND t.name = '${lastSyncTable}' AND c.name = 'lastSync') ALTER TABLE [${SCHEMA}].[${lastSyncTable}] ADD lastSync DATETIME`);
                    checkedColumns.add(`${lastSyncTable}.lastSync`);
                }

                const updateSet = columns.map(col => `[${col}] = @${col}`).join(', ') + ', lastSync = GETDATE()';
                request.input('id_pk', data.id);
                await request.query(`MERGE INTO [${SCHEMA}].[${lastSyncTable}] AS target USING (SELECT @id_pk AS id) AS source ON (target.id = source.id) WHEN MATCHED THEN UPDATE SET ${updateSet} WHEN NOT MATCHED THEN INSERT (id, ${columns.join(', ')}) VALUES (@id_pk, ${columns.map(c => `@${c}`).join(', ')});`);

                // Update local cursor to the current record
                cursorTs = data.lastChanged;
                cursorId = data.id;
            }
            totalSynced += pageData.data.length;
            console.log(`Batch processed: ${pageData.data.length} records. Total synced for ${entityName}: ${totalSynced}`);
        } else {
            hasMore = false;
        }
    }
    console.log(`--- Finished Deep Sync for ${entityName} ---`);
}

async function main() {
    console.log('--- STARTING DEP-PAGINATION CONTINUOUS SYNC ---');
    if (!process.env.DB_SERVER) { console.error('FATAL ERROR: DB_SERVER is not defined.'); process.exit(1); }

    let pool;
    try {
        pool = await mssql.connect(config);
        await ensureSchemaAndMigration(pool);

        while (true) {
            try {
                const token = await getFSMToken();
                console.log(`\nNew Sync Cycle Started at ${new Date().toLocaleString()}`);

                await genericSync(pool, token, 'ServiceCall', '27', SC_FIELDS, 'ServiceCallsFSM', 'sc');
                await genericSync(pool, token, 'Activity', '43', AC_FIELDS, 'ActivitiesFSM', 'ac');
                await genericSync(pool, token, 'BusinessPartner', '25', BP_FIELDS, 'BusinessPartnersFSM', 'bp');
                await genericSync(pool, token, 'Equipment', '24', EP_FIELDS, 'EquipmentsFSM', 'eq');
                await genericSync(pool, token, 'Material', '21', MA_FIELDS, 'MaterialsFSM', 'mt');
                await genericSync(pool, token, 'Item', '17', IT_FIELDS, 'ItemsFSM', 'it');

                console.log('\nCycle Complete. Waiting 1 minute...');
            } catch (cycleError) {
                console.error('Cycle Error:', cycleError.message);
            }
            await new Promise(resolve => setTimeout(resolve, 60000));
        }
    } catch (fatalError) {
        console.error('FATAL ERROR:', fatalError.message);
    } finally {
        if (pool) await pool.close();
    }
}

main();
