import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/db.js';
import { authMiddleware as authenticateToken, optionalAuth } from '../middleware/auth.js';
import { createNotification } from '../utils/notifications.js';
import { logActivity } from '../utils/activity.js';

const router = express.Router();
// const log = (msg) => fs.appendFileSync('debug.txt', `${new Date().toISOString()} - ${msg}\n`);
const log = (msg) => console.log(`[DEBUG] ${new Date().toISOString()} - ${msg}`);

// Get Live Matches (for Stream page)
router.get('/live', optionalAuth, async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT m.*, 
                p1.name as home_player_name, p1.team_name as home_team_name, p1.logo_url as home_team_logo, p1.id as home_team_id,
                p2.name as away_player_name, p2.team_name as away_team_name, p2.logo_url as away_team_logo, p2.id as away_team_id,
                t.name as tournament_name, t.type as tournament_type, t.slug as tournament_slug,
                u.name as creator_name,
                (
                    SELECT COUNT(*) FROM match_chats mc WHERE mc.match_id = m.id
                ) as chat_count,
                (
                    SELECT sp.name 
                    FROM user_subscriptions us 
                    JOIN subscription_plans sp ON us.plan_id = sp.id 
                    WHERE us.user_id = u.id AND us.status = 'active' 
                    ORDER BY sp.price DESC LIMIT 1
                ) as tier_name,
                (
                    SELECT sp.price 
                    FROM user_subscriptions us 
                    JOIN subscription_plans sp ON us.plan_id = sp.id 
                    WHERE us.user_id = u.id AND us.status = 'active' 
                    ORDER BY sp.price DESC LIMIT 1
                ) as tier_price
             FROM matches m
             JOIN tournaments t ON m.tournament_id = t.id
             JOIN users u ON t.organizer_id = u.id
             LEFT JOIN participants p1 ON m.home_participant_id = p1.id
             LEFT JOIN participants p2 ON m.away_participant_id = p2.id
             WHERE m.status IN ('live', '1st_half', '2nd_half', 'halftime', 'fulltime_pending')
             ORDER BY chat_count DESC, tier_price DESC, m.created_at DESC`
        );

        const formattedMatches = rows.map(m => ({
            id: m.id,
            tournamentId: m.tournament_id,
            tournamentName: m.tournament_name,
            tournamentSlug: m.tournament_slug,
            game: 'E-Football', // Default or can be pulled from tournament if field exists
            homeTeam: {
                id: m.home_team_id,
                name: m.home_player_name,
                teamName: m.home_team_name,
                logo: m.home_team_logo,
            },
            awayTeam: {
                id: m.away_team_id,
                name: m.away_player_name,
                teamName: m.away_team_name,
                logo: m.away_team_logo,
            },
            homeScore: m.home_score || 0,
            awayScore: m.away_score || 0,
            status: m.status,
            chatCount: m.chat_count || 0,
            creator: {
                name: m.creator_name,
                tier: (m.tier_name || 'free').toLowerCase().replace(' ', '_')
            },
            matchTime: m.status === 'halftime' ? 'HT' :
                m.status === 'fulltime_pending' ? 'FT' :
                    'LIVE', // Minutes logic omitted for simplicity unless needed
            created_at: m.created_at
        }));

        res.json({ success: true, data: formattedMatches });
    } catch (error) {
        console.error('Fetch live matches error:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data live matches' });
    }
});

// Get Match Detail
// Get Match Detail
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Fetch Match Details
        const [matches] = await db.query(
            `SELECT m.*, 
                p1.name as home_player_name, p1.team_name as home_team_name, p1.logo_url as home_team_logo, p1.id as home_team_id, p1.user_id as home_user_id,
                p2.name as away_player_name, p2.team_name as away_team_name, p2.logo_url as away_team_logo, p2.id as away_team_id, p2.user_id as away_user_id,
                t.type as tournament_type,
                t.organizer_id as organizer_id
             FROM matches m
             LEFT JOIN participants p1 ON m.home_participant_id = p1.id
             LEFT JOIN participants p2 ON m.away_participant_id = p2.id
             LEFT JOIN tournaments t ON m.tournament_id = t.id
             WHERE m.id = ?`,
            [id]
        );


        if (matches.length === 0) {
            return res.status(404).json({ success: false, message: 'Pertandingan tidak ditemukan' });
        }

        const match = matches[0];

        // 2. Fetch Events from Table
        const [dbEvents] = await db.query(
            `SELECT * FROM match_events WHERE match_id = ? ORDER BY minute ASC, created_at ASC`,
            [match.id]
        );

        // Map events to frontend format
        const events = dbEvents.map(e => {
            let type = 'goal';
            if (e.type.includes('card')) type = 'card';
            else if (['kickoff', 'fulltime', 'halftime'].includes(e.type)) type = e.type;

            return {
                id: e.id,
                type: type, // goal, card, kickoff, fulltime
                originalType: e.type, // Validation
                team: e.team_side,
                player: e.player_name,
                time: e.minute.toString(),
                detail: e.type === 'penalty_goal' ? 'Penalty' :
                    e.type === 'own_goal' ? 'Own Goal' :
                        e.type === 'yellow_card' ? 'Yellow Card' :
                            e.type === 'red_card' ? 'Red Card' : 'Open Play'
            };
        });

        // --- ANALYSIS LOGIC ---
        // Determine if we track by User ID (All Time) or Participant ID (Tournament Only)
        // Rule: Both must have user_id for All Time.
        const useUserHistory = match.home_user_id && match.away_user_id;

        let pastMatches = [];
        let historyType = 'tournament';

        if (useUserHistory) {
            historyType = 'all_time';
            // Fetch ALL finished matches between these two USERS across ANY tournament
            // Join participants to get user_ids
            const [history] = await db.query(
                `SELECT m.id, m.home_score, m.away_score, m.created_at, m.updated_at, m.status,
                        t.name as tournament_name,
                        p1.user_id as h_uid, p2.user_id as a_uid,
                        p1.team_name as h_team_name, p2.team_name as a_team_name,
                        p1.name as h_username, p2.name as a_username,
                        m.home_participant_id, m.away_participant_id
                 FROM matches m
                 JOIN participants p1 ON m.home_participant_id = p1.id
                 JOIN participants p2 ON m.away_participant_id = p2.id
                 JOIN tournaments t ON m.tournament_id = t.id
                 WHERE m.status IN ('finished', 'completed')
                 AND m.id != ? -- Exclude current match
                 AND (
                    (p1.user_id = ? AND p2.user_id = ?) OR
                    (p1.user_id = ? AND p2.user_id = ?)
                 )
                 ORDER BY m.updated_at DESC`,
                [match.id, match.home_user_id, match.away_user_id, match.away_user_id, match.home_user_id]
            );
            pastMatches = history;
        } else {
            historyType = 'tournament';
            // Fetch finished matches between these two PARTICIPANTS in THIS tournament
            const [history] = await db.query(
                `SELECT m.id, m.home_score, m.away_score, m.created_at, m.updated_at, m.status,
                        t.name as tournament_name,
                        p1.team_name as h_team_name, p2.team_name as a_team_name,
                        p1.name as h_username, p2.name as a_username,
                        m.home_participant_id, m.away_participant_id
                 FROM matches m
                 JOIN participants p1 ON m.home_participant_id = p1.id
                 JOIN participants p2 ON m.away_participant_id = p2.id
                 JOIN tournaments t ON m.tournament_id = t.id
                 WHERE m.tournament_id = ?
                 AND m.status IN ('finished', 'completed')
                 AND m.id != ? -- Exclude current match
                 AND (
                    (m.home_participant_id = ? AND m.away_participant_id = ?) OR
                    (m.home_participant_id = ? AND m.away_participant_id = ?)
                 )
                 ORDER BY m.updated_at DESC`,
                [match.tournament_id, match.id, match.home_participant_id, match.away_participant_id, match.away_participant_id, match.home_participant_id]
            );
            pastMatches = history;
        }

        // === WIN PROBABILITY CALCULATION (Weighted Formula) ===
        // 1. Head-to-Head Stats from pastMatches
        let h2h = { homeWins: 0, awayWins: 0, draws: 0, total: 0 };
        pastMatches.forEach(m => {
            const currentHomeId = useUserHistory ? match.home_user_id : match.home_participant_id;
            const mHomeId = useUserHistory ? m.h_uid : m.home_participant_id;
            const isCurrentHomeSide = (mHomeId == currentHomeId);
            const hScore = m.home_score || 0;
            const aScore = m.away_score || 0;

            if (hScore > aScore) {
                if (isCurrentHomeSide) h2h.homeWins++; else h2h.awayWins++;
            } else if (aScore > hScore) {
                if (isCurrentHomeSide) h2h.awayWins++; else h2h.homeWins++;
            } else {
                h2h.draws++;
            }
            h2h.total++;
        });

        // 2. Fetch Team Stats (league performance + goals)
        let teamA = { matches: 0, wins: 0, draws: 0, goals_scored: 0, goals_conceded: 0 };
        let teamB = { matches: 0, wins: 0, draws: 0, goals_scored: 0, goals_conceded: 0 };

        if (useUserHistory) {
            // All-time mode: use user_statistics table
            const [statsA] = await db.query(
                'SELECT total_matches, total_wins, total_draws, goals_for, goals_against FROM user_statistics WHERE user_id = ?',
                [match.home_user_id]
            );
            const [statsB] = await db.query(
                'SELECT total_matches, total_wins, total_draws, goals_for, goals_against FROM user_statistics WHERE user_id = ?',
                [match.away_user_id]
            );
            if (statsA.length > 0) {
                teamA = { matches: statsA[0].total_matches || 0, wins: statsA[0].total_wins || 0, draws: statsA[0].total_draws || 0, goals_scored: statsA[0].goals_for || 0, goals_conceded: statsA[0].goals_against || 0 };
            }
            if (statsB.length > 0) {
                teamB = { matches: statsB[0].total_matches || 0, wins: statsB[0].total_wins || 0, draws: statsB[0].total_draws || 0, goals_scored: statsB[0].goals_for || 0, goals_conceded: statsB[0].goals_against || 0 };
            }
        } else {
            // Tournament mode: use standings table
            const [standA] = await db.query(
                'SELECT played, won, drawn, goals_for, goals_against FROM standings WHERE tournament_id = ? AND participant_id = ?',
                [match.tournament_id, match.home_participant_id]
            );
            const [standB] = await db.query(
                'SELECT played, won, drawn, goals_for, goals_against FROM standings WHERE tournament_id = ? AND participant_id = ?',
                [match.tournament_id, match.away_participant_id]
            );
            if (standA.length > 0) {
                teamA = { matches: standA[0].played || 0, wins: standA[0].won || 0, draws: standA[0].drawn || 0, goals_scored: standA[0].goals_for || 0, goals_conceded: standA[0].goals_against || 0 };
            }
            if (standB.length > 0) {
                teamB = { matches: standB[0].played || 0, wins: standB[0].won || 0, draws: standB[0].drawn || 0, goals_scored: standB[0].goals_for || 0, goals_conceded: standB[0].goals_against || 0 };
            }
        }

        // 3. Compute probabilities
        const totalLeagueMatches = (teamA.matches + teamB.matches) / 2;
        const hasH2H = h2h.total > 0;
        const hasLeagueData = totalLeagueMatches > 0;

        let analysis = {
            winProbability: { home: 33, draw: 34, away: 33 }, // Default
            headToHead: [],
            historyType
        };

        if (hasH2H || hasLeagueData) {
            // Weights depend on whether H2H data exists
            const weights = hasH2H
                ? { head_to_head: 0.2, league_performance: 0.5, goal_stats: 0.3 }
                : { head_to_head: 0, league_performance: 0.6, goal_stats: 0.4 };

            // H2H probabilities
            let prob_h2h_home = 0, prob_h2h_away = 0, prob_h2h_draw = 0;
            if (hasH2H) {
                prob_h2h_home = h2h.homeWins / h2h.total;
                prob_h2h_away = h2h.awayWins / h2h.total;
                prob_h2h_draw = h2h.draws / h2h.total;
            }

            // League performance probabilities
            let prob_league_home = 0, prob_league_away = 0, prob_league_draw = 0;
            let prob_goals_home = 0, prob_goals_away = 0;

            if (hasLeagueData) {
                prob_league_home = teamA.wins / totalLeagueMatches;
                prob_league_away = teamB.wins / totalLeagueMatches;
                prob_league_draw = (teamA.draws / totalLeagueMatches + teamB.draws / totalLeagueMatches) / 2;

                // Goal statistics (offense vs defense)
                const teamA_offense = teamA.goals_scored / totalLeagueMatches;
                const teamB_defense = teamB.goals_conceded / totalLeagueMatches;
                const teamB_offense = teamB.goals_scored / totalLeagueMatches;
                const teamA_defense = teamA.goals_conceded / totalLeagueMatches;

                const sumA = teamA_offense + teamB_defense;
                const sumB = teamB_offense + teamA_defense;
                prob_goals_home = sumA > 0 ? teamA_offense / sumA : 0;
                prob_goals_away = sumB > 0 ? teamB_offense / sumB : 0;

                // Guard against NaN
                if (isNaN(prob_goals_home)) prob_goals_home = 0;
                if (isNaN(prob_goals_away)) prob_goals_away = 0;
            }

            // Final weighted probabilities
            const teamA_probability =
                (prob_h2h_home * weights.head_to_head) +
                (prob_league_home * weights.league_performance) +
                (prob_goals_home * weights.goal_stats);

            const teamB_probability =
                (prob_h2h_away * weights.head_to_head) +
                (prob_league_away * weights.league_performance) +
                (prob_goals_away * weights.goal_stats);

            const draw_probability =
                (prob_h2h_draw * weights.head_to_head) +
                (prob_league_draw * weights.league_performance);

            // Normalize to 100%
            const totalProb = teamA_probability + teamB_probability + draw_probability;
            if (totalProb > 0) {
                analysis.winProbability = {
                    home: Math.round((teamA_probability / totalProb) * 100),
                    draw: Math.round((draw_probability / totalProb) * 100),
                    away: Math.round((teamB_probability / totalProb) * 100)
                };

                // Fix rounding to ensure sum = 100
                const sum = analysis.winProbability.home + analysis.winProbability.draw + analysis.winProbability.away;
                if (sum !== 100) {
                    analysis.winProbability.draw += (100 - sum);
                }
            }
        }

        // OVERRIDE: If match is finished/completed, set probability based on actual result
        if (['finished', 'completed'].includes(match.status)) {
            const hScore = match.home_score || 0;
            const aScore = match.away_score || 0;

            if (hScore > aScore) {
                analysis.winProbability = { home: 100, draw: 0, away: 0 };
            } else if (aScore > hScore) {
                analysis.winProbability = { home: 0, draw: 0, away: 100 };
            } else {
                // Draw: User requested "50 50" logic if draw
                analysis.winProbability = { home: 50, draw: 0, away: 50 };
            }
        }

        // Format Head to Head (Limit 3)
        analysis.headToHead = pastMatches.slice(0, 3).map(m => {
            // Check if current Home team was Home or Away in this historical match
            const currentHomeIdentifier = useUserHistory ? match.home_user_id : match.home_participant_id;
            const mHomeIdentifier = useUserHistory ? m.h_uid : m.home_participant_id;
            const isHome = (mHomeIdentifier == currentHomeIdentifier);

            return {
                id: m.id,
                homeTeam: isHome ? (m.h_username || m.h_team_name) : (m.a_username || m.a_team_name),
                awayTeam: isHome ? (m.a_username || m.a_team_name) : (m.h_username || m.h_team_name),
                homeScore: isHome ? m.home_score : m.away_score,
                awayScore: isHome ? m.away_score : m.home_score,
                tournament: m.tournament_name, // Or 'Friendly' etc.
                isHome: isHome, // Helper for frontend to know alignment
                date: m.updated_at || m.created_at
            };
        });

        // --- END ANALYSIS ---

        const responseData = {
            id: match.id,
            tournamentId: match.tournament_id,
            organizerId: match.organizer_id,
            round: match.round, // Added for previous round validation
            homeTeam: {
                id: match.home_team_id,
                name: match.home_player_name,
                teamName: match.home_team_name,
                logo: match.home_team_logo,
                players: []
            },
            tournamentType: match.tournament_type,
            awayTeam: {
                id: match.away_team_id,
                name: match.away_player_name,
                teamName: match.away_team_name,
                logo: match.away_team_logo,
                players: []
            },
            homeScore: match.home_score || 0,
            awayScore: match.away_score || 0,
            homePenaltyScore: match.home_penalty_score,
            awayPenaltyScore: match.away_penalty_score,
            status: match.status,
            details: typeof match.details === 'string' ? JSON.parse(match.details || '{}') : (match.details || {}),
            startTime: match.created_at,
            events: events,
            analysis: analysis // Include Analysis
        };

        res.json({ success: true, data: responseData });

    } catch (error) {
        console.error('Get match error:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data pertandingan' });
    }
});

// Add Event
router.post('/:id/events', authenticateToken, async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { id } = req.params;
        const { type, team, player, time, detail } = req.body; // Frontend format

        await connection.beginTransaction();

        // 1. Get Match Info (for tournament_id and participant_id)
        const [matches] = await connection.query('SELECT tournament_id, home_participant_id, away_participant_id, home_score, away_score FROM matches WHERE id = ? FOR UPDATE', [id]);
        if (matches.length === 0) {
            return res.status(404).json({ success: false, message: 'Match not found' });
        }
        const match = matches[0];

        const participantId = team === 'home' ? match.home_participant_id : match.away_participant_id;

        // 2. Map Frontend Type/Detail to Schema Enum
        let dbType = type;
        if (type === 'goal') {
            if (detail === 'Penalty') dbType = 'penalty_goal';
            else if (detail === 'Own Goal') dbType = 'own_goal';
            else dbType = 'goal';
        } else if (type === 'card') {
            if (detail === 'Red Card') dbType = 'red_card';
            else dbType = 'yellow_card';
        }

        // 3. Update Match Score if Goal (Perform BEFORE Insert Event to match PATCH lock order: Matches -> Events)
        if (['goal', 'penalty_goal', 'own_goal'].includes(dbType)) {
            let newHomeScore = match.home_score || 0;
            let newAwayScore = match.away_score || 0; // Handle NULLs

            if (team === 'home') {
                newHomeScore++;
            } else {
                newAwayScore++;
            }

            await connection.query('UPDATE matches SET home_score = ?, away_score = ? WHERE id = ?', [newHomeScore, newAwayScore, id]);
        }

        // 4. Insert Event
        const eventId = uuidv4();
        await connection.query(
            `INSERT INTO match_events (id, tournament_id, match_id, participant_id, type, player_name, minute, team_side)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [eventId, match.tournament_id, id, participantId, dbType, player, parseInt(time), team]
        );

        await connection.commit();

        // Log Activity
        await logActivity(req.user.id, 'Add Match Event', `User added event: ${type} (${detail || ''})`, id, 'match');

        res.json({ success: true, message: 'Event recorded', eventId });

    } catch (error) {
        await connection.rollback();
        console.error('Add event error:', error);
        res.status(500).json({ success: false, message: 'Gagal menambah event' });
    } finally {
        connection.release();
    }
});

// Rollback Last Event
router.delete('/:id/events/last', authenticateToken, async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { id } = req.params;

        await connection.beginTransaction();

        // 1. Get Last Event
        const [events] = await connection.query(
            'SELECT * FROM match_events WHERE match_id = ? ORDER BY created_at DESC LIMIT 1',
            [id]
        );

        if (events.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'No events to rollback' });
        }
        const lastEvent = events[0];

        // 2. Revert Score if Goal
        // Check "original" db types
        if (['goal', 'penalty_goal', 'own_goal'].includes(lastEvent.type)) {
            const [matches] = await connection.query('SELECT home_score, away_score FROM matches WHERE id = ? FOR UPDATE', [id]);
            const match = matches[0];

            let newHomeScore = match.home_score;
            let newAwayScore = match.away_score;

            if (lastEvent.team_side === 'home') {
                newHomeScore = Math.max(0, newHomeScore - 1);
            } else {
                newAwayScore = Math.max(0, newAwayScore - 1);
            }

            await connection.query('UPDATE matches SET home_score = ?, away_score = ? WHERE id = ?', [newHomeScore, newAwayScore, id]);
        }

        // 3. Delete Event
        await connection.query('DELETE FROM match_events WHERE id = ?', [lastEvent.id]);

        await connection.commit();

        // Log Activity
        await logActivity(req.user.id, 'Rollback Event', `User rolled back event: ${lastEvent.type}`, id, 'match');

        res.json({ success: true, message: 'Event rolled back' });

    } catch (error) {
        await connection.rollback();
        console.error('Rollback event error:', error);
        res.status(500).json({ success: false, message: 'Gagal rollback event' });
    } finally {
        connection.release();
    }
});
router.patch('/:id', authenticateToken, async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { id } = req.params;
        const {
            homeScore,
            awayScore,
            status,
            homePenaltyScore,
            awayPenaltyScore,
            period // New field from frontend (1st_half, etc)
        } = req.body;

        console.log(`[PATCH Match] ID: ${id}, Body: ${JSON.stringify(req.body)}`);

        await connection.beginTransaction();

        // 1. Get current match
        const [currentMatches] = await connection.query('SELECT * FROM matches WHERE id = ? FOR UPDATE', [id]);
        if (currentMatches.length === 0) {
            return res.status(404).json({ success: false, message: 'Match not found' });
        }
        const currentMatch = currentMatches[0];

        // 2. Prepare Updates
        const updateFields = [];
        const updateValues = [];

        if (homeScore !== undefined) {
            updateFields.push('home_score = ?');
            updateValues.push(homeScore);
        }
        if (awayScore !== undefined) {
            updateFields.push('away_score = ?');
            updateValues.push(awayScore);
        }
        if (status !== undefined) {
            updateFields.push('status = ?');
            updateValues.push(status);
        }
        if (homePenaltyScore !== undefined) {
            updateFields.push('home_penalty_score = ?');
            updateValues.push(homePenaltyScore);
        }
        if (awayPenaltyScore !== undefined) {
            updateFields.push('away_penalty_score = ?');
            updateValues.push(awayPenaltyScore);
        }

        // Handle Details (Period)
        let details = {};
        try {
            details = typeof currentMatch.details === 'string'
                ? JSON.parse(currentMatch.details || '{}')
                : (currentMatch.details || {});
        } catch (e) {
            console.error("Error parsing match details:", e);
            details = {};
        }

        if (period !== undefined) {
            details.period = period;
            updateFields.push('details = ?');
            updateValues.push(JSON.stringify(details));
        }

        // Ensure scores are not NULL if we are touching the match (implicit fix) or if explicitly setting
        // If we are updating status to a live state, and scores are NULL, set them to 0
        if ((status === 'live' || status === 'completed' || period) && (currentMatch.home_score === null || currentMatch.away_score === null)) {
            if (homeScore === undefined) {
                updateFields.push('home_score = ?');
                updateValues.push(currentMatch.home_score || 0);
            }
            if (awayScore === undefined) {
                updateFields.push('away_score = ?');
                updateValues.push(currentMatch.away_score || 0);
            }
        }

        if (updateFields.length > 0) {
            updateValues.push(id);
            await connection.query(
                `UPDATE matches SET ${updateFields.join(', ')} WHERE id = ?`,
                updateValues
            );
        }

        // Log Activity
        await logActivity(req.user.id, 'Update Match', `User updated match status/score`, id, 'match');

        // 3. Logic for Auto-Events
        // Transition: Scheduled -> Live (specifically 1st_half) => Kickoff
        if (status === 'live' && currentMatch.status === 'scheduled' && period === '1st_half') {
            const eventId = uuidv4();
            await connection.query(
                `INSERT INTO match_events (id, tournament_id, match_id, type, minute, team_side)
                 VALUES (?, ?, ?, 'kickoff', 0, 'home')`, // home/away doesn't matter for kickoff really, default home
                [eventId, currentMatch.tournament_id, id]
            );

            // NOTIFICATION: Kickoff
            // Fetch participants to get user_ids
            const [users] = await connection.query(
                `SELECT user_id FROM participants WHERE id IN (?, ?) AND user_id IS NOT NULL`,
                [currentMatch.home_participant_id, currentMatch.away_participant_id]
            );

            for (const u of users) {
                await createNotification(
                    u.user_id,
                    'match_scheduled', // Reusing this or use a new 'match_started' type
                    'Pertandingan Dimulai! ⚽',
                    `Pertandingan Anda telah dimulai. Good luck!`,
                    { match_id: id, tournament_id: currentMatch.tournament_id }
                    , connection);
            }
        }

        // Transition: Not Completed -> Fulltime (either via period or status)
        // Check if we are transitioning into fulltime state for the first time
        const isNowFulltime = (status === 'completed') || (period === 'fulltime');
        const wasFulltime = (currentMatch.status === 'completed') || (details.period === 'fulltime');

        if (isNowFulltime) {
            // Check if fulltime event already exists to prevent duplicates (Idempotency)
            const [existingEvents] = await connection.query(
                `SELECT id FROM match_events WHERE match_id = ? AND type = 'fulltime'`,
                [id]
            );

            if (existingEvents.length === 0) {
                const eventId = uuidv4();
                await connection.query(
                    `INSERT INTO match_events (id, tournament_id, match_id, type, minute, team_side)
                     VALUES (?, ?, ?, 'fulltime', 90, 'home')`,
                    [eventId, currentMatch.tournament_id, id]
                );

                // NOTIFICATION: Match Completed
                // Use actual DB scores (req.body may not include them)
                const finalHomeScore = homeScore !== undefined ? Number(homeScore) : (currentMatch.home_score || 0);
                const finalAwayScore = awayScore !== undefined ? Number(awayScore) : (currentMatch.away_score || 0);

                // Fetch participants to get user_ids
                const [users] = await connection.query(
                    `SELECT user_id FROM participants WHERE id IN (?, ?) AND user_id IS NOT NULL`,
                    [currentMatch.home_participant_id, currentMatch.away_participant_id]
                );

                for (const u of users) {
                    // Determine result for this specific user
                    const [pRows] = await connection.query('SELECT id FROM participants WHERE user_id = ? AND id IN (?, ?)', [u.user_id, currentMatch.home_participant_id, currentMatch.away_participant_id]);
                    if (pRows.length > 0) {
                        const pid = pRows[0].id;
                        const isHome = pid === currentMatch.home_participant_id;

                        let myLabel = 'Seri';
                        if (finalHomeScore > finalAwayScore) myLabel = isHome ? 'Menang' : 'Kalah';
                        else if (finalAwayScore > finalHomeScore) myLabel = isHome ? 'Kalah' : 'Menang';

                        const emoji = myLabel === 'Menang' ? '🎉' : (myLabel === 'Kalah' ? '😔' : '🤝');

                        await createNotification(
                            u.user_id,
                            'match_completed',
                            `Pertandingan Selesai - ${myLabel} ${emoji}`,
                            `Skor Akhir: ${finalHomeScore} - ${finalAwayScore}`,
                            { match_id: id, tournament_id: currentMatch.tournament_id }
                            , connection);
                    }
                }

                // --- START: Update User Statistics (Ranking) ---
                try {
                    // Fetch participants to get user_ids
                    const [statsParticipants] = await connection.query(
                        'SELECT id, user_id FROM participants WHERE id IN (?, ?)',
                        [currentMatch.home_participant_id, currentMatch.away_participant_id]
                    );

                    const homePart = statsParticipants.find(p => p.id === currentMatch.home_participant_id);
                    const awayPart = statsParticipants.find(p => p.id === currentMatch.away_participant_id);

                    if (homePart?.user_id || awayPart?.user_id) {
                        const hScore = homeScore !== undefined ? Number(homeScore) : (currentMatch.home_score || 0);
                        const aScore = awayScore !== undefined ? Number(awayScore) : (currentMatch.away_score || 0);

                        let hWin = 0, aWin = 0, hDraw = 0, aDraw = 0, hLoss = 0, aLoss = 0;
                        if (hScore > aScore) { hWin = 1; aLoss = 1; }
                        else if (aScore > hScore) { aWin = 1; hLoss = 1; }
                        else { hDraw = 1; aDraw = 1; }

                        const updateStats = async (userId, isWin, isDraw, isLoss, gf, ga) => {
                            if (!userId) return;

                            // Points Logic: Win +6, Draw +2, Loss -4
                            let points = 0;
                            if (isWin) points = 6;
                            else if (isDraw) points = 2;
                            else if (isLoss) points = -4;

                            const w = isWin ? 1 : 0;
                            const l = isLoss ? 1 : 0;
                            const d = isDraw ? 1 : 0;
                            const gd = gf - ga;

                            // 0. Get current points before update for previous_points_daily
                            const [currentStats] = await connection.query(
                                'SELECT total_points FROM user_statistics WHERE user_id = ? FOR UPDATE',
                                [userId]
                            );
                            const prevPoints = currentStats.length > 0 ? currentStats[0].total_points : 0;

                            // 1. Upsert User Statistics
                            await connection.query(
                                `INSERT INTO user_statistics (user_id, total_points, total_matches, total_wins, total_losses, total_draws, goals_for, goals_against, goal_difference, win_rate, previous_points_daily)
                             VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?)
                             ON DUPLICATE KEY UPDATE
                                previous_points_daily = ?,
                                total_points = total_points + ?,
                                total_wins = total_wins + ?,
                                total_losses = total_losses + ?,
                                total_draws = total_draws + ?,
                                total_matches = total_matches + 1,
                                goals_for = goals_for + ?,
                                goals_against = goals_against + ?,
                                goal_difference = goal_difference + ?,
                                win_rate = (total_wins / total_matches) * 100`,
                                [
                                    userId, points, w, l, d, gf, ga, gd, (w * 100), prevPoints, // Insert
                                    prevPoints, points, w, l, d, gf, ga, gd // Update
                                ]
                            );

                            // 2. Insert User Statistics History (Realtime)
                            // Fetch updated stats to record snapshot
                            const [updatedStats] = await connection.query(
                                'SELECT total_points, win_rate, goal_difference, goals_for FROM user_statistics WHERE user_id = ?',
                                [userId]
                            );

                            if (updatedStats.length > 0) {
                                const current = updatedStats[0];

                                // Calculate approximate current rank
                                const [rankResult] = await connection.query(
                                    `SELECT COUNT(*) + 1 as current_rank
                                     FROM user_statistics
                                     WHERE total_points > ? 
                                     OR (total_points = ? AND win_rate > ?)
                                     OR (total_points = ? AND win_rate = ? AND goal_difference > ?)
                                     OR (total_points = ? AND win_rate = ? AND goal_difference = ? AND goals_for > ?)`,
                                    [
                                        current.total_points,
                                        current.total_points, current.win_rate,
                                        current.total_points, current.win_rate, current.goal_difference,
                                        current.total_points, current.win_rate, current.goal_difference, current.goals_for
                                    ]
                                );

                                const rank = rankResult.length > 0 ? rankResult[0].current_rank : 0;

                                await connection.query(
                                    `INSERT INTO user_statistics_history (user_id, points, rank_position, win_rate, recorded_at)
                                 VALUES (?, ?, ?, ?, NOW())`,
                                    [userId, current.total_points, rank, current.win_rate]
                                );
                            }
                        };

                        await updateStats(homePart?.user_id, !!hWin, !!hDraw, !!hLoss, hScore, aScore);
                        await updateStats(awayPart?.user_id, !!aWin, !!aDraw, !!aLoss, aScore, hScore);
                    }
                } catch (err) {
                    console.error("[Stats Update Error] Failed to update user stats:", err);
                    // Non-blocking error, continue transaction
                }
                // --- END: Update User Statistics ---
            }

            // AUTO UPDATE STANDINGS IF LEAGUE OR GROUP STAGE OF KNOCKOUT
            const [tournaments] = await connection.query('SELECT type, match_format FROM tournaments WHERE id = ?', [currentMatch.tournament_id]);
            if (tournaments.length > 0) {
                const tournament = tournaments[0];
                const isGroupMatch = (tournament.type === 'league') ||
                    (tournament.type === 'group_knockout' && details.groupName);

                if (isGroupMatch && existingEvents.length === 0) {
                    const hScore = homeScore !== undefined ? homeScore : (currentMatch.home_score || 0);
                    const aScore = awayScore !== undefined ? awayScore : (currentMatch.away_score || 0);

                    let hPoints = 0, aPoints = 0;
                    let hWon = 0, aWon = 0;
                    let hDraw = 0, aDraw = 0;
                    let hLost = 0, aLost = 0;

                    if (hScore > aScore) { hPoints = 3; hWon = 1; aLost = 1; }
                    else if (aScore > hScore) { aPoints = 3; aWon = 1; hLost = 1; }
                    else { hPoints = 1; aPoints = 1; hDraw = 1; aDraw = 1; }

                    // Helper to Update Standing Row
                    const updateStanding = async (participantId, points, won, draw, lost, gf, ga, groupName = null) => {
                        const gd = gf - ga;
                        // Check if row exists
                        const [rows] = await connection.query(
                            'SELECT id FROM standings WHERE tournament_id = ? AND participant_id = ?',
                            [currentMatch.tournament_id, participantId]
                        );

                        if (rows.length > 0) {
                            // Update
                            // Optionally update group_name if it was missing (though usually fixed on creation)
                            await connection.query(
                                `UPDATE standings SET 
                                    points = points + ?, played = played + 1, won = won + ?, drawn = drawn + ?, lost = lost + ?, 
                                    goals_for = goals_for + ?, goals_against = goals_against + ?, goal_difference = goal_difference + ?,
                                    group_name = COALESCE(group_name, ?)
                                 WHERE id = ?`,
                                [points, won, draw, lost, gf, ga, gd, groupName, rows[0].id]
                            );
                        } else {
                            // Insert
                            const newId = uuidv4();
                            await connection.query(
                                `INSERT INTO standings (id, tournament_id, participant_id, points, played, won, drawn, lost, goals_for, goals_against, goal_difference, group_name)
                                 VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?)`,
                                [newId, currentMatch.tournament_id, participantId, points, won, draw, lost, gf, ga, gd, groupName]
                            );
                        }
                    };

                    const gName = details.groupName || null;

                    // Update both teams
                    if (currentMatch.home_participant_id) await updateStanding(currentMatch.home_participant_id, hPoints, hWon, hDraw, hLost, hScore, aScore, gName);
                    if (currentMatch.away_participant_id) await updateStanding(currentMatch.away_participant_id, aPoints, aWon, aDraw, aLost, aScore, hScore, gName);
                }

                // GROUP KNOCKOUT TRANSITION LOGIC (Group -> Knockout)
                if (tournament.type === 'group_knockout' && details.groupName) {
                    // Check if ALL matches in this group are completed
                    const groupName = details.groupName;
                    log(`[Advancement] Group match completed. Checking if all group ${groupName} matches are done...`);

                    const [groupMatches] = await connection.query(
                        `SELECT id, status, details FROM matches WHERE tournament_id = ?`,
                        [currentMatch.tournament_id]
                    );

                    const matchesInGroup = groupMatches.filter(m => {
                        const d = typeof m.details === 'string' ? JSON.parse(m.details || '{}') : (m.details || {});
                        return d.groupName === groupName;
                    });

                    log(`[Advancement] Found ${matchesInGroup.length} matches in ${groupName}`);
                    const allCompleted = matchesInGroup.every(m => m.status === 'completed');
                    log(`[Advancement] All completed? ${allCompleted}`);

                    if (allCompleted) {
                        log(`[Progression] Group ${groupName} Finished. Advancing winners.`);

                        // Get Standings for this Group
                        const [standings] = await connection.query(
                            `SELECT participant_id FROM standings 
                             WHERE tournament_id = ? AND group_name = ? 
                             ORDER BY points DESC, goal_difference DESC, goals_for DESC
                             LIMIT 2`,
                            [currentMatch.tournament_id, groupName]
                        );

                        log(`[Advancement] Standings for ${groupName}: ${JSON.stringify(standings)}`);

                        if (standings.length > 0) {
                            // Find Target Matches in Bracket
                            // We need to find matches that have details.resolve_home/away = { type: 'group_result', group:..., pos:... }
                            // Since we don't have deeply nested JSON access in standard SQL in all versions easily, we fetch potential matches
                            const [bracketMatches] = await connection.query(
                                `SELECT id, details, home_participant_id, away_participant_id FROM matches 
                                 WHERE tournament_id = ? AND status = 'scheduled'`, // Optimized: only scheduled
                                [currentMatch.tournament_id]
                            );

                            log(`[Advancement] Found ${bracketMatches.length} scheduled bracket matches to check`);

                            for (const bm of bracketMatches) {
                                let d = typeof bm.details === 'string' ? JSON.parse(bm.details || '{}') : (bm.details || {});
                                let updated = false;
                                let h = bm.home_participant_id;
                                let a = bm.away_participant_id;

                                // Check Home Slot
                                if (d.resolve_home && d.resolve_home.type === 'group_result' && d.resolve_home.group === groupName) {
                                    const arrayIdx = d.resolve_home.pos - 1; // 1-based to 0-based
                                    if (standings[arrayIdx]) {
                                        h = standings[arrayIdx].participant_id;
                                        updated = true;
                                        log(`[Advancement] Match ${bm.id} HOME slot filled with pos ${d.resolve_home.pos} from ${groupName}`);
                                    }
                                }

                                // Check Away Slot
                                if (d.resolve_away && d.resolve_away.type === 'group_result' && d.resolve_away.group === groupName) {
                                    const arrayIdx = d.resolve_away.pos - 1;
                                    if (standings[arrayIdx]) {
                                        a = standings[arrayIdx].participant_id;
                                        updated = true;
                                        log(`[Advancement] Match ${bm.id} AWAY slot filled with pos ${d.resolve_away.pos} from ${groupName}`);
                                    }
                                }

                                if (updated) {
                                    await connection.query(
                                        `UPDATE matches SET home_participant_id = ?, away_participant_id = ? WHERE id = ?`,
                                        [h, a, bm.id]
                                    );
                                    log(`[Advancement] Updated match ${bm.id} with home=${h}, away=${a}`);
                                }
                            }
                        } else {
                            log(`[Advancement] WARNING: No standings found for ${groupName}`);
                        }
                    }
                }

                // KNOCKOUT PROGRESSION LOGIC (Runs even if event already exists)
                // Appy to: 'knockout' type OR 'group_knockout' type (BUT Only knockout stage matches)
                const isKnockoutStage = (tournament.type === 'knockout') ||
                    (tournament.type === 'group_knockout' && details.stage === 'knockout');

                if (isKnockoutStage) {
                    log(`[Progression] Processing Match ${id}. Format: ${tournament.match_format}, Status: ${status}, Period: ${period}`);
                    let winnerId = null;

                    // 1. Determine Winner based on format
                    if (tournament.match_format === 'single') {
                        const hScore = homeScore !== undefined ? Number(homeScore) : (currentMatch.home_score || 0);
                        const aScore = awayScore !== undefined ? Number(awayScore) : (currentMatch.away_score || 0);

                        if (hScore > aScore) winnerId = currentMatch.home_participant_id;
                        else if (aScore > hScore) winnerId = currentMatch.away_participant_id;
                        else {
                            // Scores are equal, check penalties
                            const hPen = homePenaltyScore !== undefined ? Number(homePenaltyScore) : (currentMatch.home_penalty_score || 0);
                            const aPen = awayPenaltyScore !== undefined ? Number(awayPenaltyScore) : (currentMatch.away_penalty_score || 0);

                            if (hPen > aPen) winnerId = currentMatch.home_participant_id;
                            else if (aPen > hPen) winnerId = currentMatch.away_participant_id;
                        }
                    } else if (tournament.match_format === 'home_away') {
                        const leg = Number(details.leg || 1);
                        log(`[Progression] Home/Away Format. Leg: ${leg}, Details: ${JSON.stringify(details)}`);
                        // Check if this is Leg 2
                        if (leg === 2) {
                            // Need to fetch Leg 1 to calculate aggregate
                            // Fetch all matches in this round to find the pair
                            // This avoids JSON_EXTRACT issues if column type varies, and dataset is small per round
                            const [roundMatches] = await connection.query(
                                `SELECT * FROM matches WHERE tournament_id = ? AND round = ?`,
                                [currentMatch.tournament_id, currentMatch.round]
                            );

                            const leg1 = roundMatches.find(m => {
                                const d = typeof m.details === 'string' ? JSON.parse(m.details || '{}') : (m.details || {});
                                return d.groupId == details.groupId && d.leg == 1; // Loose equality for safety
                            });

                            if (leg1) {
                                log(`[Progression] Leg 1 Found: ${leg1.id}`);
                                // Calculate Aggregate
                                const p1 = currentMatch.home_participant_id;
                                const p2 = currentMatch.away_participant_id;

                                // Current Leg (Leg 2) Scores
                                const p1ScoreLeg2 = homeScore !== undefined ? Number(homeScore) : (currentMatch.home_score || 0);
                                const p2ScoreLeg2 = awayScore !== undefined ? Number(awayScore) : (currentMatch.away_score || 0);

                                // Leg 1 Scores
                                // Determine which score belongs to P1 and P2 in Leg 1
                                let p1ScoreLeg1 = 0;
                                let p2ScoreLeg1 = 0;

                                if (leg1.home_participant_id === p1) p1ScoreLeg1 = (leg1.home_score || 0);
                                else if (leg1.away_participant_id === p1) p1ScoreLeg1 = (leg1.away_score || 0);

                                if (leg1.home_participant_id === p2) p2ScoreLeg1 = (leg1.home_score || 0);
                                else if (leg1.away_participant_id === p2) p2ScoreLeg1 = (leg1.away_score || 0);

                                const p1Agg = p1ScoreLeg1 + p1ScoreLeg2;
                                const p2Agg = p2ScoreLeg1 + p2ScoreLeg2;

                                console.log(`[Progression] Agg Calc: P1(${p1})=${p1Agg}, P2(${p2})=${p2Agg}`);

                                if (p1Agg > p2Agg) winnerId = p1;
                                else if (p2Agg > p1Agg) winnerId = p2;
                                else {
                                    log(`[Progression] Draw detected. Checking penalties.`);
                                    // Aggregate Draw -> Check Penalties (from Leg 2)
                                    const hPen = homePenaltyScore !== undefined ? Number(homePenaltyScore) : (currentMatch.home_penalty_score || 0);
                                    const aPen = awayPenaltyScore !== undefined ? Number(awayPenaltyScore) : (currentMatch.away_penalty_score || 0);

                                    // Note: homePenaltyScore belongs to currentMatch.home (P1)
                                    if (hPen > aPen) winnerId = p1;
                                    else if (aPen > hPen) winnerId = p2;
                                }
                            }
                        }
                    }

                    // 2. Advance Winner
                    log(`[Progression] Winner determined: ${winnerId}`);
                    if (winnerId && details.matchIndex !== undefined) {
                        const currentMatchIndex = Number(details.matchIndex);
                        const nextRound = currentMatch.round + 1;
                        const nextMatchIndex = Math.floor(currentMatchIndex / 2);
                        const isNextHome = (currentMatchIndex % 2 === 0);
                        // Usually: Match 0 & 1 feed into Match 0. Match 0 is Home, Match 1 is Away.

                        // Find the next match
                        const [nextMatches] = await connection.query(
                            `SELECT id, details, home_participant_id, away_participant_id FROM matches 
                             WHERE tournament_id = ? AND round = ?`,
                            [currentMatch.tournament_id, nextRound]
                        );

                        // Filter by matchIndex in JS because extracted from JSON
                        const targetMatch = nextMatches.find(m => {
                            const d = typeof m.details === 'string' ? JSON.parse(m.details || '{}') : (m.details || {});
                            return Number(d.matchIndex) === nextMatchIndex;
                        });

                        if (targetMatch) {
                            // Update slot
                            const fieldToUpdate = isNextHome ? 'home_participant_id' : 'away_participant_id';

                            // For 2-Legged Next Round:
                            // If the NEXT round is also 2-legged, we might need to update TWO matches (Leg 1 and Leg 2).
                            // But usually, we initially create matches for all rounds.
                            // If the next round is Home/Away, there will be TWO target matches with the same matchIndex but different legs.
                            // WE NEED TO UPDATE BOTH, but with swapped positions for Leg 2.

                            // Let's find ALL matches that match the nextMatchIndex (Leg 1 and Leg 2)
                            const targetMatches = nextMatches.filter(m => {
                                const d = typeof m.details === 'string' ? JSON.parse(m.details || '{}') : (m.details || {});
                                return Number(d.matchIndex) === nextMatchIndex;
                            });

                            for (const tm of targetMatches) {
                                const tmDetails = typeof tm.details === 'string' ? JSON.parse(tm.details || '{}') : (tm.details || {});

                                // For Leg 2, swap the position (who is home becomes away and vice versa)
                                const isLeg2 = tmDetails.leg === 2;
                                let fieldForThisMatch = fieldToUpdate;
                                if (isLeg2) {
                                    // Swap: if we would put in home, put in away instead for leg 2
                                    fieldForThisMatch = isNextHome ? 'away_participant_id' : 'home_participant_id';
                                }

                                await connection.query(
                                    `UPDATE matches SET ${fieldForThisMatch} = ? WHERE id = ?`,
                                    [winnerId, tm.id]
                                );
                            }
                        }
                    }
                }
            }
        }

        await connection.commit();
        res.json({ success: true, message: 'Pertandingan berhasil diupdate' });

    } catch (error) {
        await connection.rollback();
        console.error('Update match error:', error);
        res.status(500).json({ success: false, message: 'Gagal update pertandingan' });
    } finally {
        connection.release();
    }
});

// Reset Match Endpoint
import bcrypt from 'bcryptjs';

router.post('/:id/reset', authenticateToken, async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { id } = req.params;
        const { password } = req.body;
        const userId = req.user.id;

        if (!password) {
            return res.status(400).json({ success: false, message: 'Password dibutuhkan' });
        }

        // 1. Validate Password
        const [users] = await connection.query('SELECT password FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        }

        const validPassword = await bcrypt.compare(password, users[0].password);
        if (!validPassword) {
            return res.status(401).json({ success: false, message: 'Password salah' });
        }

        await connection.beginTransaction();

        // 2. Get current match details
        const [matches] = await connection.query('SELECT * FROM matches WHERE id = ? FOR UPDATE', [id]);
        if (matches.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Match tidak ditemukan' });
        }

        const currentMatch = matches[0];

        // 3. Clear match_events
        await connection.query('DELETE FROM match_events WHERE match_id = ?', [id]);

        // 4. Update match table (reset scores and status)
        let newDetails = {};
        try {
            newDetails = typeof currentMatch.details === 'string' ? JSON.parse(currentMatch.details || '{}') : (currentMatch.details || {});
            delete newDetails.period; // Clear the period
        } catch (e) {
            newDetails = {};
        }

        await connection.query(
            `UPDATE matches 
             SET home_score = NULL, away_score = NULL, home_penalty_score = NULL, away_penalty_score = NULL, 
                 status = 'scheduled', details = ? 
             WHERE id = ?`,
            [JSON.stringify(newDetails), id]
        );

        // 5. Get participants (to find user_ids for user_statistics)
        const [participants] = await connection.query(
            'SELECT id, user_id FROM participants WHERE id IN (?, ?)',
            [currentMatch.home_participant_id, currentMatch.away_participant_id]
        );
        const homePart = participants.find(p => p.id === currentMatch.home_participant_id);
        const awayPart = participants.find(p => p.id === currentMatch.away_participant_id);

        const hScore = currentMatch.home_score || 0;
        const aScore = currentMatch.away_score || 0;

        // Results
        let hWin = 0, aWin = 0, hDraw = 0, aDraw = 0, hLoss = 0, aLoss = 0;
        if (hScore > aScore) { hWin = 1; aLoss = 1; }
        else if (aScore > hScore) { aWin = 1; hLoss = 1; }
        else { hDraw = 1; aDraw = 1; }

        // 6. Reverse Standings Data (if League or Group Stage Knockout)
        const [tournaments] = await connection.query('SELECT type FROM tournaments WHERE id = ?', [currentMatch.tournament_id]);
        if (tournaments.length > 0) {
            const tournament = tournaments[0];
            let gName = newDetails.groupName || null;
            const isGroupMatch = (tournament.type === 'league') || (tournament.type === 'group_knockout' && gName);

            if (isGroupMatch) {
                let hPoints = 0, aPoints = 0;
                if (hWin) hPoints = 3; else if (hDraw) hPoints = 1;
                if (aWin) aPoints = 3; else if (aDraw) aPoints = 1;

                const reverseStanding = async (participantId, points, won, draw, lost, gf, ga) => {
                    if (!participantId) return;
                    const gd = gf - ga;
                    // Ensure we don't drop below 0
                    await connection.query(
                        `UPDATE standings SET 
                            points = GREATEST(0, points - ?), 
                            played = GREATEST(0, played - 1), 
                            won = GREATEST(0, won - ?), 
                            drawn = GREATEST(0, drawn - ?), 
                            lost = GREATEST(0, lost - ?), 
                            goals_for = GREATEST(0, goals_for - ?), 
                            goals_against = GREATEST(0, goals_against - ?), 
                            goal_difference = GREATEST(0, goal_difference - ?)
                         WHERE tournament_id = ? AND participant_id = ?`,
                        [points, won, draw, lost, gf, ga, gd, currentMatch.tournament_id, participantId]
                    );
                };

                await reverseStanding(currentMatch.home_participant_id, hPoints, hWin, hDraw, hLoss, hScore, aScore);
                await reverseStanding(currentMatch.away_participant_id, aPoints, aWin, aDraw, aLoss, aScore, hScore);
            }

            // Note: Reversing Knockout progressions (finding advanced match and un-assigning slot) is complex
            // Usually, admins need to reset the future match slots manually if a knockout game is reset.
        }

        // 7. Delete Latest user_statistics_history and Reverse user_statistics points
        const reverseStats = async (uId, isWin, isDraw, isLoss, gf, ga) => {
            if (!uId) return;

            let points = 0;
            if (isWin) points = 6; else if (isDraw) points = 2; else if (isLoss) points = -4;

            const w = isWin ? 1 : 0;
            const l = isLoss ? 1 : 0;
            const d = isDraw ? 1 : 0;
            const gd = gf - ga;

            // Delete the latest history record for this user
            const [latestHistory] = await connection.query(
                'SELECT id FROM user_statistics_history WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 1',
                [uId]
            );
            if (latestHistory.length > 0) {
                await connection.query('DELETE FROM user_statistics_history WHERE id = ?', [latestHistory[0].id]);
            }

            // Update stats back
            await connection.query(
                `UPDATE user_statistics SET
                     total_points = GREATEST(0, total_points - ?),
                     total_matches = GREATEST(0, total_matches - 1),
                     total_wins = GREATEST(0, total_wins - ?),
                     total_losses = GREATEST(0, total_losses - ?),
                     total_draws = GREATEST(0, total_draws - ?),
                     goals_for = GREATEST(0, goals_for - ?),
                     goals_against = GREATEST(0, goals_against - ?),
                     goal_difference = GREATEST(0, goal_difference - ?),
                     win_rate = CASE WHEN (total_matches - 1) > 0 THEN GREATEST(0, (total_wins - ?) / (total_matches - 1) * 100) ELSE 0 END
                  WHERE user_id = ?`,
                [points, w, l, d, gf, ga, gd, w, uId]
            );
        };

        if (homePart?.user_id) await reverseStats(homePart.user_id, !!hWin, !!hDraw, !!hLoss, hScore, aScore);
        if (awayPart?.user_id) await reverseStats(awayPart.user_id, !!aWin, !!aDraw, !!aLoss, aScore, hScore);

        await connection.commit();
        await logActivity(req.user.id, 'Reset Match', `User resetted match ${id}`, id, 'match');

        res.json({ success: true, message: 'Pertandingan berhasil di-reset' });
    } catch (error) {
        await connection.rollback();
        console.error('Reset match error:', error);
        res.status(500).json({ success: false, message: 'Gagal mereset pertandingan' });
    } finally {
        connection.release();
    }
});

// Match Chat Endpoints
router.get('/:id/chat', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const [messages] = await db.query(
            `SELECT c.*, u.username, u.name, u.avatar_url, p.team_name, p.team_name as team
             FROM match_chats c
             LEFT JOIN users u ON c.user_id = u.id
             -- Try to link user to a team loosely if they are a manager, but for public chat it's mostly User vs User
             -- Ideally we check if user owns one of the participants
             LEFT JOIN participants p ON (p.user_id = u.id AND p.tournament_id = (SELECT tournament_id FROM matches WHERE id = ?))
             WHERE c.match_id = ?
             ORDER BY c.created_at ASC`,
            [id, id]
        );

        res.json({ success: true, data: messages });
    } catch (error) {
        console.error('Get chat error:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat chat' });
    }
});

router.post('/:id/chat', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;
        const userId = req.user.id; // From auth middleware

        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Pesan tidak boleh kosong' });
        }

        const chatId = uuidv4();
        await db.query(
            `INSERT INTO match_chats (id, match_id, user_id, message) VALUES (?, ?, ?, ?)`,
            [chatId, id, userId, message]
        );

        res.json({ success: true, message: 'Pesan terkirim', chatId });
    } catch (error) {
        console.error('Send chat error:', error);
        res.status(500).json({ success: false, message: 'Gagal mengirim pesan' });
    }
});

export default router;
