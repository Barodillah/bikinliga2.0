
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bikinliga_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

async function runSpecificMigration() {
    const migrationFile = '016_create_achievements_tables.sql';
    const filePath = path.join(__dirname, migrationFile);
    let connection;

    try {
        connection = await mysql.createConnection(dbConfig);
        console.log(`Connected to database: ${dbConfig.database}`);
        console.log(`Reading migration file: ${migrationFile}`);

        const sql = fs.readFileSync(filePath, 'utf8');

        // Split by semicolon and filter empty statements
        const statements = sql
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);

        console.log(`Found ${statements.length} statements to execute.`);

        for (const statement of statements) {
            try {
                await connection.query(statement);
                console.log('✅ Statement executed successfully');
            } catch (err) {
                // Ignore "Table already exists" or "Duplicate entry" errors if safe
                if (err.code === 'ER_TABLE_EXISTS_ERROR') {
                    console.log('⚠️ Table already exists, skipping creation');
                } else if (err.code === 'ER_DUP_ENTRY') {
                    console.log('⚠️ Duplicate entry, skipping insertion');
                } else {
                    throw err;
                }
            }
        }

        console.log(`✅ Migration ${migrationFile} completed successfully`);
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error(`❌ Migration failed:`, error);
        if (connection) await connection.end();
        process.exit(1);
    }
}

runSpecificMigration();
