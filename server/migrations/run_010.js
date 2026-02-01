import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runMigration() {
    console.log('🚀 Starting single migration...\n');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true
    });

    try {
        const file = '010_add_penalty_scores_to_matches.sql';
        console.log(`📄 Running migration: ${file}`);
        const filePath = path.join(__dirname, file);
        const sql = fs.readFileSync(filePath, 'utf8');

        await connection.query(sql);
        console.log(`✅ Completed: ${file}\n`);

        console.log('🎉 Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

runMigration().catch(err => {
    console.error(err);
    process.exit(1);
});
