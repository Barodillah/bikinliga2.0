import 'dotenv/config';
import mysql from 'mysql2/promise';

async function check() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const [stats] = await connection.query('SELECT * FROM user_statistics');
    console.log('User Statistics Count:', stats.length);
    console.log('Sample:', stats.slice(0, 2));

    await connection.end();
}

check().catch(console.error);
