
import 'dotenv/config';
import db from './server/config/db.js';

async function runMigration() {
    console.log('Starting migration...');
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        console.log('Creating players table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS players (
                id CHAR(36) PRIMARY KEY,
                participant_id CHAR(36) NOT NULL,
                tournament_id CHAR(36) NOT NULL,
                user_id CHAR(36) NULL,
                name VARCHAR(255) NOT NULL,
                jersey_number INT NULL,
                team_name VARCHAR(255) NULL,
                position ENUM('GK', 'DF', 'MF', 'FW', 'SUB') NULL,
                avatar_url VARCHAR(255) NULL,
                stats JSON NULL,
                payment_status ENUM('pending', 'paid', 'waived') DEFAULT 'pending',
                status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                KEY participant_idx (participant_id),
                KEY tournament_idx (tournament_id),
                CONSTRAINT fk_players_participant FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
                CONSTRAINT fk_players_tournament FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
            )
        `);

        console.log('Creating tournament_prizes table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS tournament_prizes (
                id CHAR(36) PRIMARY KEY,
                tournament_id CHAR(36) NOT NULL,
                is_enabled BOOLEAN DEFAULT FALSE,
                total_pool DECIMAL(15, 2) DEFAULT 0,
                sources JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                KEY tournament_idx (tournament_id),
                CONSTRAINT fk_prizes_tournament FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
            )
        `);

        console.log('Creating prize_recipients table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS prize_recipients (
                id CHAR(36) PRIMARY KEY,
                tournament_prize_id CHAR(36) NOT NULL,
                title VARCHAR(255) NOT NULL,
                percentage DECIMAL(5, 2) DEFAULT 0,
                amount DECIMAL(15, 2) DEFAULT 0,
                is_manual BOOLEAN DEFAULT FALSE,
                participant_id CHAR(36) NULL,
                player_id CHAR(36) NULL,
                order_index INT DEFAULT 0,
                KEY prize_idx (tournament_prize_id),
                CONSTRAINT fk_recipients_prize FOREIGN KEY (tournament_prize_id) REFERENCES tournament_prizes(id) ON DELETE CASCADE,
                CONSTRAINT fk_recipients_participant FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE SET NULL,
                CONSTRAINT fk_recipients_player FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE SET NULL
            )
        `);

        await connection.commit();
        console.log('Migration successful!');
    } catch (error) {
        await connection.rollback();
        console.error('Migration failed:', error);
    } finally {
        connection.release();
        process.exit();
    }
}

runMigration();
