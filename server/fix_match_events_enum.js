import 'dotenv/config';
import db from './config/db.js';

const fixEnum = async () => {
    try {
        const connection = await db.getConnection();
        console.log("Connected to database...");

        console.log("Altering match_events table...");
        await connection.query(`
            ALTER TABLE match_events 
            MODIFY COLUMN type ENUM('goal', 'penalty_goal', 'own_goal', 'yellow_card', 'red_card', 'substitution', 'penalty_missed', 'kickoff', 'halftime', 'fulltime') NOT NULL
        `);

        console.log("✅ match_events table updated successfully!");
        connection.release();
        process.exit(0);
    } catch (error) {
        console.error("❌ Error updating table:", error);
        process.exit(1);
    }
};

fixEnum();
