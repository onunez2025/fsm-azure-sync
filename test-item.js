import fs from 'fs';
import path from 'path';

// Manual env loading to avoid dependencies for the test
const envPath = path.resolve('.env');
const envLines = fs.readFileSync(envPath, 'utf8').split('\n');
const processEnv = {};
envLines.forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key) processEnv[key.trim()] = valueParts.join('=').trim();
});

async function runTest() {
    try {
        console.log('--- FSM Item Entity Test ---');

        const auth = Buffer.from(`${processEnv.FSM_CLIENT_ID}:${processEnv.FSM_CLIENT_SECRET}`).toString('base64');
        const tokenResponse = await fetch(processEnv.FSM_TOKEN_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        });

        const tokenData = await tokenResponse.json();
        const bearerToken = tokenData.access_token;

        const queryUrl = `${processEnv.FSM_QUERY_URL}?account=${processEnv.FSM_ACCOUNT}&company=${processEnv.FSM_COMPANY}&dtos=Item.17&page=1&pageSize=5`;

        const IT_FIELDS = [
            'it.id', 'it.unitOfMeasure', 'it.syncStatus', 'it.groupCode', 'it.typeCode', 'it.typeName'
        ];

        const query = {
            query: `SELECT ${IT_FIELDS.join(', ')} FROM Item it`
        };

        const queryResponse = await fetch(queryUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'Content-Type': 'application/json',
                'X-Client-ID': 'Item-Test',
                'X-Client-Version': '1.0.0'
            },
            body: JSON.stringify(query)
        });

        if (!queryResponse.ok) {
            const errorText = await queryResponse.text();
            console.error(`Query failed: ${queryResponse.status} - ${errorText}`);
            return;
        }

        const queryData = await queryResponse.json();
        console.log('Item query result:');
        console.log(JSON.stringify(queryData, null, 2));

    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

runTest();
