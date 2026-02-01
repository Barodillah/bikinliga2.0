
import 'dotenv/config';
import db from './server/config/db.js';

async function inspectSchema() {
    const tables = ['tournaments', 'participants', 'players'];
    for (const table of tables) {
        try {
            console.log(`\n--- Schema for ${table} ---`);
            const results = await db.query(`DESCRIBE ${table}`);
            console.table(results);
        } catch (error) {
            console.error(`Error describing ${table}:`, error.message);
        }
    }
    process.exit();
}

inspectSchema();
