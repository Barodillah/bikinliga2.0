import 'dotenv/config';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true
    });

    try {
        console.log('🔄 Running migration 014_create_chat_tables.sql...');

        const sqlPath = join(__dirname, '014_create_chat_tables.sql');
        const sql = readFileSync(sqlPath, 'utf8');

        await connection.query(sql);

        console.log('✅ Migration completed successfully!');
        console.log('📋 Created tables: chat_sessions, chat_messages, complaints');
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

runMigration().catch(console.error);
