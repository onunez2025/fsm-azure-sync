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
        console.log('--- FSM Connection Test ---');
        
        // 1. Get OAuth2 Token
        console.log(`Fetching token from: ${processEnv.FSM_TOKEN_URL}`);
        const auth = Buffer.from(`${processEnv.FSM_CLIENT_ID}:${processEnv.FSM_CLIENT_SECRET}`).toString('base64');
        
        const tokenResponse = await fetch(processEnv.FSM_TOKEN_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            throw new Error(`Token fetch failed: ${tokenResponse.status} - ${errorText}`);
        }

        const tokenData = await tokenResponse.json();
        const bearerToken = tokenData.access_token;
        console.log('Token obtained successfully.');

        // 2. Query ServiceCall
        // Note: Documentation says POST is standard for Query API
        const queryUrl = `${processEnv.FSM_QUERY_URL}?account=${processEnv.FSM_ACCOUNT}&company=${processEnv.FSM_COMPANY}&dtos=ServiceCall.27`;
        console.log(`Querying: ${queryUrl}`);

        const query = {
            query: "SELECT sc.id, sc.subject, sc.statusName FROM ServiceCall sc LIMIT 5"
        };

        const queryResponse = await fetch(queryUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'Content-Type': 'application/json',
                'X-Client-ID': 'Antigravity-Test',
                'X-Client-Version': '1.0.0'
            },
            body: JSON.stringify(query)
        });

        if (!queryResponse.ok) {
            const errorText = await queryResponse.text();
            throw new Error(`Query failed: ${queryResponse.status} - ${errorText}`);
        }

        const queryData = await queryResponse.json();
        console.log('Query result:');
        console.log(JSON.stringify(queryData, null, 2));

    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

runTest();
