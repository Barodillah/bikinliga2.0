CREATE TABLE IF NOT EXISTS user_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    action VARCHAR(255) NOT NULL,
    description TEXT,
    reference_id VARCHAR(36),
    reference_type VARCHAR(50), -- 'tournament', 'community', 'match', etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
