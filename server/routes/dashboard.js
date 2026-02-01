import express from 'express';
import { query } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Overview Stats
        const [overviewStats] = await query(`
            SELECT 
                COUNT(DISTINCT t.id) as total_tournaments,
                COUNT(DISTINCT CASE WHEN t.status IN ('active', 'open') THEN t.id END) as active_tournaments,
                COUNT(DISTINCT m.id) as total_matches,
                COUNT(DISTINCT p.id) as total_participants
            FROM tournaments t
            LEFT JOIN matches m ON m.tournament_id = t.id
            LEFT JOIN participants p ON p.tournament_id = t.id
            WHERE t.organizer_id = ?
        `, [userId]);

        // 2. Recent Tournaments
        const recentTournaments = await query(`
            SELECT 
                t.id, 
                t.name, 
                t.slug,
                t.logo_url,
                t.type, 
                t.current_participants as players, 
                t.status,
                (SELECT COUNT(*) FROM matches m WHERE m.tournament_id = t.id) as matches
            FROM tournaments t
            WHERE t.organizer_id = ?
            ORDER BY t.created_at DESC
            LIMIT 4
        `, [userId]);

        // 3. Mixed Matches (Upcoming + Recent Results) with Balancing Logic

        const matchQuery = (typeCondition, limit, orderDir) => `
            SELECT 
                m.id, 
                m.start_time as time, 
                t.name as tournament,
                t.slug as tournament_slug,
                t.id as tournament_id,
                p1.name as home_player,
                p1.team_name as home_team,
                p1.logo_url as home_logo,
                p2.name as away_player,
                p2.team_name as away_team,
                p2.logo_url as away_logo,
                m.home_score,
                m.away_score,
                m.home_penalty_score,
                m.away_penalty_score,
                m.status,
                m.round,
                JSON_UNQUOTE(JSON_EXTRACT(m.details, '$.leg')) as leg,
                '${typeCondition === 'upcoming' ? 'upcoming' : 'result'}' as type,
                
                -- Aggregate calculation for Leg 2 (Using JSON fields for leg/groupId)
                CASE 
                    WHEN JSON_UNQUOTE(JSON_EXTRACT(m.details, '$.leg')) = '2' THEN (
                        SELECT 
                            CASE 
                                WHEN m_prev.home_participant_id = m.home_participant_id THEN m_prev.home_score 
                                ELSE m_prev.away_score 
                            END
                        FROM matches m_prev 
                        WHERE m_prev.tournament_id = m.tournament_id 
                        AND JSON_UNQUOTE(JSON_EXTRACT(m_prev.details, '$.groupId')) = JSON_UNQUOTE(JSON_EXTRACT(m.details, '$.groupId'))
                        AND JSON_UNQUOTE(JSON_EXTRACT(m_prev.details, '$.leg')) = '1'
                        LIMIT 1
                    )
                    ELSE NULL 
                END as prev_leg_home_score,
                
                CASE 
                    WHEN JSON_UNQUOTE(JSON_EXTRACT(m.details, '$.leg')) = '2' THEN (
                        SELECT 
                            CASE 
                                WHEN m_prev.away_participant_id = m.away_participant_id THEN m_prev.away_score 
                                ELSE m_prev.home_score 
                            END
                        FROM matches m_prev 
                        WHERE m_prev.tournament_id = m.tournament_id 
                        AND JSON_UNQUOTE(JSON_EXTRACT(m_prev.details, '$.groupId')) = JSON_UNQUOTE(JSON_EXTRACT(m.details, '$.groupId'))
                        AND JSON_UNQUOTE(JSON_EXTRACT(m_prev.details, '$.leg')) = '1'
                        LIMIT 1
                    )
                    ELSE NULL 
                END as prev_leg_away_score

            FROM matches m
            JOIN tournaments t ON m.tournament_id = t.id
            LEFT JOIN participants p1 ON m.home_participant_id = p1.id
            LEFT JOIN participants p2 ON m.away_participant_id = p2.id
            WHERE t.organizer_id = ? 
            ${typeCondition === 'upcoming'
                ? "AND m.start_time > NOW() AND m.status = 'scheduled'"
                : "AND (m.start_time <= NOW() OR m.status = 'completed')"}
            ORDER BY m.start_time ${orderDir}
            LIMIT ?
        `;

        // Fetch larger pool to allow balancing (10 instead of 3)
        // Helper function to pick distinct tournaments
        const balanceMatches = (matches, targetCount = 3) => {
            const distinctTournaments = new Set();
            const balanced = [];
            const remaining = [];

            // First pass: Pick one for each distinct tournament
            for (const m of matches) {
                if (!distinctTournaments.has(m.tournament_id)) {
                    distinctTournaments.add(m.tournament_id);
                    balanced.push(m);
                } else {
                    remaining.push(m);
                }
                if (balanced.length >= targetCount) break;
            }

            // Second pass: Fill remaining slots if needed
            if (balanced.length < targetCount) {
                const needed = targetCount - balanced.length;
                balanced.push(...remaining.slice(0, needed));
            }

            // Re-sort by time (for upcoming: ASC, for results: DESC usually, but here we want strict feed order)
            // Actually, for display, upcoming should be chronological ASC.
            // Results should be chronological DESC (newest first).
            // Let's assume input matches are already sorted correctly by the query. 
            // We need to re-sort 'balanced' based on the original type/time sort.
            // Since we might mix upcoming and results later, we just return balanced for now.
            return balanced;
        };

        let upcomingCandidates = await query(matchQuery('upcoming', 10, 'ASC'), [userId, 10]);
        let upcomingMatches = balanceMatches(upcomingCandidates, 3); // Reverted to 3

        // Sort upcoming ASC
        upcomingMatches.sort((a, b) => new Date(a.time) - new Date(b.time));

        // If less than 3, get recent completed/past
        if (upcomingMatches.length < 3) {
            const limit = 3 - upcomingMatches.length;
            // Fetch more past matches to balance if needed
            let pastCandidates = await query(matchQuery('result', 10, 'DESC'), [userId, 10]);

            // Simple balance for past matches logic:
            let pastMatches = balanceMatches(pastCandidates, limit);

            // Sort past matches DESC (Newest first)
            pastMatches.sort((a, b) => new Date(b.time) - new Date(a.time));

            upcomingMatches = [...upcomingMatches, ...pastMatches];
        }

        // Parse leg to int just in case
        upcomingMatches = upcomingMatches.map(m => ({
            ...m,
            leg: m.leg ? parseInt(m.leg) : null
        }));

        res.json({
            success: true,
            data: {
                stats: {
                    totalTournaments: overviewStats.total_tournaments || 0,
                    activeTournaments: overviewStats.active_tournaments || 0,
                    totalMatches: overviewStats.total_matches || 0,
                    totalParticipants: overviewStats.total_participants || 0
                },
                recentTournaments,
                upcomingMatches,
                quickActions: {
                    latestDraft: (await query(`SELECT id, slug, status FROM tournaments WHERE organizer_id = ? AND status = 'draft' ORDER BY created_at DESC LIMIT 1`, [userId]))[0] || null,
                    latestActive: (await query(`SELECT id, slug, status FROM tournaments WHERE organizer_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1`, [userId]))[0] || null,
                    latestAny: (await query(`SELECT id, slug, status FROM tournaments WHERE organizer_id = ? ORDER BY created_at DESC LIMIT 1`, [userId]))[0] || null
                },
                joinedTournaments: await query(`
                    SELECT 
                        t.id, t.name, t.slug, t.logo_url, t.type, t.status,
                        p.status as user_status,
                        (SELECT COUNT(*) FROM matches m WHERE m.tournament_id = t.id AND (m.home_participant_id = p.id OR m.away_participant_id = p.id) AND m.status = 'completed') as played_matches,
                        (SELECT COUNT(*) FROM matches m WHERE m.tournament_id = t.id AND (m.home_participant_id = p.id OR m.away_participant_id = p.id)) as total_matches
                    FROM participants p
                    JOIN tournaments t ON p.tournament_id = t.id
                    WHERE p.user_id = ?
                    ORDER BY t.created_at DESC
                    LIMIT 3
                `, [userId])
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

export default router;
