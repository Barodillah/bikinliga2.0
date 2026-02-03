-- Drop tables if they exist to reset season/schema
DROP TABLE IF EXISTS user_ranking_history; -- Drop old name if exists
DROP TABLE IF EXISTS user_statistics_history;
DROP TABLE IF EXISTS user_statistics;

-- User Statistics Table (Live Ranking)
CREATE TABLE user_statistics (
    user_id VARCHAR(36) PRIMARY KEY,
    total_points INT DEFAULT 0,
    total_matches INT DEFAULT 0,
    total_wins INT DEFAULT 0,
    total_losses INT DEFAULT 0,
    total_draws INT DEFAULT 0,
    goals_for INT DEFAULT 0,
    goals_against INT DEFAULT 0,
    goal_difference INT DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0.00,
    previous_points_daily INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_points (total_points),
    INDEX idx_ranking (total_points DESC, win_rate DESC, goal_difference DESC, goals_for DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Statistics History Table (Realtime History)
CREATE TABLE user_statistics_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    points INT DEFAULT 0,
    rank_position INT DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0.00,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, recorded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
