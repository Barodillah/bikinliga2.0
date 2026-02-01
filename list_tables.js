
import 'dotenv/config';
import db from './server/config/db.js';

async function listTables() {
    try {
        const results = await db.query(`SHOW TABLES`);
        console.table(results);
    } catch (error) {
        console.error(`Error listing tables:`, error.message);
    }
    process.exit();
}

listTables();
