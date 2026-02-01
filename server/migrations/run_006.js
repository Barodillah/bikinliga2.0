import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runMigration006() {
    console.log('🚀 Starting specific migration 006...\n');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true
    });

    try {
        const file = '006_add_last_registration_date.sql';
        console.log(`📄 Running migration: ${file}`);
        const filePath = path.join(__dirname, file);
        const sql = fs.readFileSync(filePath, 'utf8');

        await connection.query(sql);
        console.log(`✅ Completed: ${file}\n`);

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

runMigration006().catch(err => {
    console.error(err);
    process.exit(1);
});
