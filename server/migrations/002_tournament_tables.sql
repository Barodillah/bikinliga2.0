
CREATE TABLE IF NOT EXISTS tournaments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    organizer_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo_url VARCHAR(255),
    type ENUM('league', 'knockout', 'group_knockout') NOT NULL,
    visibility ENUM('public', 'private') DEFAULT 'public',
    status ENUM('draft', 'open', 'active', 'completed', 'archived') DEFAULT 'draft',
    max_participants INT NOT NULL,
    current_participants INT DEFAULT 0,
    point_system VARCHAR(50) DEFAULT '3-1-0',
    match_format ENUM('home_away', 'single') DEFAULT 'single',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS participants (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tournament_id CHAR(36) NOT NULL,
    user_id CHAR(36),
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(255),
    status ENUM('pending', 'approved', 'rejected', 'disqualified') DEFAULT 'pending',
    wins INT DEFAULT 0,
    draws INT DEFAULT 0,
    losses INT DEFAULT 0,
    goals_for INT DEFAULT 0,
    goals_against INT DEFAULT 0,
    goal_difference INT DEFAULT 0,
    points INT DEFAULT 0,
    stats JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
