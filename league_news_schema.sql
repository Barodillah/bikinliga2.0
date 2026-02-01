CREATE TABLE IF NOT EXISTS league_news (
    id CHAR(36) PRIMARY KEY,
    tournament_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    contact_info VARCHAR(255),
    group_link VARCHAR(255),
    is_welcome BOOLEAN DEFAULT FALSE,
    open_thread BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY tournament_idx (tournament_id),
    CONSTRAINT fk_news_tournament FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS news_comments (
    id CHAR(36) PRIMARY KEY,
    news_id CHAR(36) NOT NULL,
    user_id CHAR(36),
    participant_id CHAR(36),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY news_idx (news_id),
    CONSTRAINT fk_comments_news FOREIGN KEY (news_id) REFERENCES league_news(id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_comments_participant FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE SET NULL
);
