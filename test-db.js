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
    }
};

async function testConnection() {
    try {
        console.log('Testing Azure SQL Login...');
        console.log('User:', config.user);
        console.log('Server:', config.server);

        const pool = await mssql.connect(config);
        console.log('Login Successful!');

        const result = await pool.request().query('SELECT @@VERSION as version');
        console.log('SQL Version:', result.recordset[0].version);

        await pool.close();
    } catch (err) {
        console.error('Login Failed Detailed Error:');
        console.error(err);
    }
}

testConnection();
