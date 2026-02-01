CREATE TABLE IF NOT EXISTS matches (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tournament_id CHAR(36) NOT NULL,
    home_participant_id CHAR(36),
    away_participant_id CHAR(36),
    round INT NOT NULL,
    start_time TIMESTAMP NULL,
    status ENUM('scheduled', 'live', 'completed', 'postponed') DEFAULT 'scheduled',
    home_score INT DEFAULT NULL,
    away_score INT DEFAULT NULL,
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (home_participant_id) REFERENCES participants(id) ON DELETE SET NULL,
    FOREIGN KEY (away_participant_id) REFERENCES participants(id) ON DELETE SET NULL
);
