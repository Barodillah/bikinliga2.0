ALTER TABLE matches DROP COLUMN IF EXISTS home_penalty_score;
ALTER TABLE matches DROP COLUMN IF EXISTS away_penalty_score;

ALTER TABLE matches 
ADD COLUMN home_penalty_score INTEGER DEFAULT NULL AFTER details,
ADD COLUMN away_penalty_score INTEGER DEFAULT NULL AFTER home_penalty_score;
