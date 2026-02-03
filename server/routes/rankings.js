import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// Get Leaderboard
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT 
                us.user_id, us.total_points, us.total_matches, us.total_wins, us.total_losses, us.total_draws, us.win_rate, us.previous_points_daily,
                us.goals_for, us.goals_against, us.goal_difference,
                u.username, u.name, u.avatar_url,
                (
                    SELECT sp.name 
                    FROM user_subscriptions sub 
                    JOIN subscription_plans sp ON sub.plan_id = sp.id 
                    WHERE sub.user_id = u.id AND sub.status = 'active'
                    ORDER BY sp.price DESC LIMIT 1
                ) as tier_name,
                (
                    SELECT COUNT(*)
                    FROM participants p
                    WHERE p.user_id = u.id
                ) as totalTournaments
             FROM user_statistics us
             JOIN users u ON us.user_id = u.id
             ORDER BY us.total_points DESC, us.win_rate DESC, us.goal_difference DESC, us.goals_for DESC
             LIMIT 100`
        );

        // Add rank number and gap logic
        const data = rows.map((row, index) => {
            const gap = row.total_points - (row.previous_points_daily || 0);
            return {
                ...row,
                rank: index + 1,
                gap: gap
            };
        });

        res.json({ success: true, data });
    } catch (error) {
        console.error('Fetch rankings error:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data ranking' });
    }
});

// Get User Stats & History
router.get('/user/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const [users] = await db.query('SELECT id FROM users WHERE username = ?', [username]);

        if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found' });

        const userId = users[0].id;

        const [stats] = await db.query('SELECT * FROM user_statistics WHERE user_id = ?', [userId]);
        const [history] = await db.query(
            'SELECT * FROM user_statistics_history WHERE user_id = ? ORDER BY recorded_at ASC LIMIT 30',
            [userId]
        );

        // Fetch recent matches (Last 5) - Aligned with user.js logic
        const [tournaments] = await db.query(
            'SELECT COUNT(*) as count FROM participants WHERE user_id = ?',
            [userId]
        );
        const totalTournaments = tournaments[0].count;

        const [matches] = await db.query(
            `SELECT m.id, m.home_score, m.away_score, m.status, m.created_at,
                    p1.user_id as home_user_id, p1.name as home_name,
                    p2.user_id as away_user_id, p2.name as away_name
             FROM matches m
             JOIN participants p1 ON m.home_participant_id = p1.id
             JOIN participants p2 ON m.away_participant_id = p2.id
             WHERE (p1.user_id = ? OR p2.user_id = ?)
             AND m.status = 'completed'
             ORDER BY m.created_at DESC
             LIMIT 5`,
            [userId, userId]
        );

        const recent_matches = matches.map(m => {
            const isHome = m.home_user_id === userId;
            const myScore = isHome ? (m.home_score || 0) : (m.away_score || 0);
            const opScore = isHome ? (m.away_score || 0) : (m.home_score || 0);

            if (myScore > opScore) return 'Win';
            if (myScore < opScore) return 'Lose';
            return 'Draw';
        });

        res.json({ success: true, stats: stats[0] || null, history, recent_matches, totalTournaments });
    } catch (error) {
        console.error('Fetch user stats error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

export default router;
