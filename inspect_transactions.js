
import 'dotenv/config';
import db from './server/config/db.js';

async function getColumns() {
    const tables = ['transactions', 'wallets', 'users'];
    for (const table of tables) {
        try {
            console.log(`\n--- Columns for ${table} ---`);
            const [results] = await db.query(`SHOW COLUMNS FROM ${table}`);
            results.forEach(col => {
                console.log(`${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'Null' : 'Not Null'}, Key: ${col.Key})`);
            });
        } catch (error) {
            console.error(`Error showing columns for ${table}:`, error.message);
        }
    }
    process.exit();
}

getColumns();
