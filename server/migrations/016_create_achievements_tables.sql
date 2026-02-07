-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50) NOT NULL,
    category ENUM('tournament', 'match', 'social', 'economy', 'membership', 'special', 'season') NOT NULL,
    xp_value INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    achievement_id VARCHAR(50) NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_showcased BOOLEAN DEFAULT FALSE,
    metadata JSON,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_achievement (user_id, achievement_id),
    INDEX idx_user_achievements_user (user_id),
    INDEX idx_user_achievements_showcased (is_showcased)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed initial achievements
INSERT IGNORE INTO achievements (id, name, description, icon, category, xp_value) VALUES
-- Tournament Achievements
('tour_champ', 'Champion', 'Menangkan juara 1 di turnamen apapun', 'Trophy', 'tournament', 100),
('tour_runner_up', 'Finalist', 'Meraih juara 2 di turnamen', 'Medal', 'tournament', 75),
('tour_3rd_place', 'Podium Finisher', 'Meraih juara 3 di turnamen', 'Medal', 'tournament', 50),
('tour_top_scorer', 'Golden Boot', 'Menjadi Top Scorer di turnamen', 'Target', 'tournament', 50),

-- Membership Achievements
('sub_captain', 'Captain', 'Berlangganan paket Captain', 'Crown', 'membership', 50),
('sub_pro', 'Pro Player', 'Berlangganan paket Pro League', 'Star', 'membership', 100),

-- Economy Achievements
('eco_first_topup', 'First Blood', 'Melakukan Top Up koin pertama kali', 'Coins', 'economy', 30),
('eco_wealthy', 'High Roller', 'Memiliki saldo 1000 koin', 'Gem', 'economy', 80),

-- Social Achievements
('social_verified', 'Verified', 'Akun terverifikasi', 'CheckCircle', 'social', 20),
('comm_founder', 'Community Founder', 'Membuat komunitas baru', 'Users', 'social', 50),
('comm_member', 'Team Player', 'Bergabung ke dalam komunitas', 'UserPlus', 'social', 20),

-- Special Achievements
('early_adopter', 'Early Adopter', 'Bergabung sebelum 1 April 2026', 'Rocket', 'special', 100),

-- Season Achievements
('rank_1', 'Rank 1', 'Menjadi rank 1 di season tertentu', 'Crown', 'season', 200),
('rank_2', 'Rank 2', 'Menjadi rank 2 di season tertentu', 'Medal', 'season', 150),
('rank_3', 'Rank 3', 'Menjadi rank 3 di season tertentu', 'Medal', 'season', 100);
