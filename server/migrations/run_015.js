import 'dotenv/config';
import { query } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
    try {
        console.log('Running migration 015_add_session_id_to_complaints...');

        const sqlPath = path.join(__dirname, '015_add_session_id_to_complaints.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split by semicolon via regex but handle common cases safely
        // For simple ALTER TABLE, we can execute directly usually
        await query(sql);

        console.log('✅ Migration 015 completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
