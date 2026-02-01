CREATE TABLE IF NOT EXISTS match_events (
    id VARCHAR(36) PRIMARY KEY,
    tournament_id VARCHAR(36) NOT NULL,
    match_id VARCHAR(36) NOT NULL,
    participant_id VARCHAR(36) NULL,
    type ENUM('goal', 'penalty_goal', 'own_goal', 'yellow_card', 'red_card', 'substitution', 'penalty_missed', 'kickoff', 'halftime', 'fulltime') NOT NULL,
    player_name VARCHAR(255) NULL,
    minute INT NOT NULL,
    half INT NULL,
    team_side ENUM('home', 'away') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE SET NULL
);
