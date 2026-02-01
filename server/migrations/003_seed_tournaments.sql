-- Create a dummy user for seeding (if not exists)
INSERT IGNORE INTO users (id, username, email, password, name, role, auth_provider, is_verified) 
VALUES ('seed-user-001', 'organizer', 'organizer@bikinliga.com', '$2a$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'Tournament Organizer', 'user', 'email', TRUE);

-- Helper to safely delete existing seed tournaments to avoid duplicates before re-inserting
-- We delete by slug because previous runs might have used random IDs
DELETE FROM participants WHERE tournament_id IN (SELECT id FROM tournaments WHERE slug IN ('premier-league-2024', 'champions-cup', 'world-tournament'));
DELETE FROM tournaments WHERE slug IN ('premier-league-2024', 'champions-cup', 'world-tournament');

INSERT INTO tournaments (id, organizer_id, name, slug, description, logo_url, type, visibility, status, max_participants, current_participants, point_system, match_format)
VALUES 
('seed-tourn-001', 'seed-user-001', 'Premier League 2024', 'premier-league-2024', 'Kompetisi liga sengit antar tim terbaik.', 'https://media.api-sports.io/football/leagues/39.png', 'league', 'public', 'active', 6, 6, '3-1-0', 'home_away'),
('seed-tourn-002', 'seed-user-001', 'Champions Cup', 'champions-cup', 'Sistem gugur, kalah langsung pulang!', 'https://media.api-sports.io/football/leagues/2.png', 'knockout', 'public', 'open', 8, 4, '3-1-0', 'single'),
('seed-tourn-003', 'seed-user-001', 'World Tournament', 'world-tournament', 'Fase grup dilanjutkan fase gugur.', 'https://media.api-sports.io/football/leagues/4.png', 'group_knockout', 'public', 'draft', 12, 0, '3-1-0', 'single');

-- Participants for League (6 teams)
INSERT INTO participants (id, tournament_id, name, logo_url, status, points) VALUES
(UUID(), 'seed-tourn-001', 'Arsenal', 'https://media.api-sports.io/football/teams/42.png', 'approved', 12),
(UUID(), 'seed-tourn-001', 'Aston Villa', 'https://media.api-sports.io/football/teams/66.png', 'approved', 9),
(UUID(), 'seed-tourn-001', 'Chelsea', 'https://media.api-sports.io/football/teams/49.png', 'approved', 7),
(UUID(), 'seed-tourn-001', 'Everton', 'https://media.api-sports.io/football/teams/45.png', 'approved', 6),
(UUID(), 'seed-tourn-001', 'Liverpool', 'https://media.api-sports.io/football/teams/40.png', 'approved', 15),
(UUID(), 'seed-tourn-001', 'Man City', 'https://media.api-sports.io/football/teams/50.png', 'approved', 14);

-- Participants for Knockout (4 teams joined)
INSERT INTO participants (id, tournament_id, name, logo_url, status) VALUES
(UUID(), 'seed-tourn-002', 'Real Madrid', 'https://media.api-sports.io/football/teams/541.png', 'approved'),
(UUID(), 'seed-tourn-002', 'Barcelona', 'https://media.api-sports.io/football/teams/529.png', 'approved'),
(UUID(), 'seed-tourn-002', 'Bayern Munich', 'https://media.api-sports.io/football/teams/157.png', 'approved'),
(UUID(), 'seed-tourn-002', 'Dortmund', 'https://media.api-sports.io/football/teams/165.png', 'approved');
