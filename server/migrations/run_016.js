import { db } from '../config/db.js';

async function run() {
    try {
        console.log('Migrating 016_create_achievements_tables...');
        const sql = await import('fs').then(fs => fs.readFileSync(new URL('./016_create_achievements_tables.sql', import.meta.url), 'utf8'));

        // Split by semicolon to handle multiple statements, filtering out empty ones
        const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);

        for (const statement of statements) {
            await db.execute(statement);
        }

        console.log('✅ Migration 016 completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration 016 failed:', error);
        process.exit(1);
    }
}

run();
