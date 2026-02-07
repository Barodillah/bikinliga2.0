
import express from 'express';
import db from '../config/db.js';
import { authMiddleware as authenticateToken } from '../middleware/auth.js';
import { unlockAchievement } from '../utils/achievements.js';

const router = express.Router();

// Get public achievements for a user
router.get('/user/:username', async (req, res) => {
    try {
        const { username } = req.params;

        // Get user ID from username
        const [users] = await db.query('SELECT id FROM users WHERE username = ?', [username]);

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const userId = users[0].id;

        // Fetch achievements
        const [achievements] = await db.query(`
            SELECT 
                a.id, a.id as achievement_id, a.name, a.description, a.icon, a.category, a.xp_value,
                ua.unlocked_at, ua.is_showcased
            FROM user_achievements ua
            JOIN achievements a ON ua.achievement_id = a.id
            WHERE ua.user_id = ?
            ORDER BY ua.is_showcased DESC, ua.unlocked_at DESC, a.xp_value DESC
        `, [userId]);

        res.json({ success: true, achievements });
    } catch (error) {
        console.error('Error fetching public achievements:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get my achievements (authenticated)
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const [achievements] = await db.query(`
            SELECT 
                a.id, a.id as achievement_id, a.name, a.description, a.icon, a.category, a.xp_value,
                ua.unlocked_at, ua.is_showcased, ua.metadata
            FROM user_achievements ua
            JOIN achievements a ON ua.achievement_id = a.id
            WHERE ua.user_id = ?
            ORDER BY ua.unlocked_at DESC
        `, [userId]);

        res.json({ success: true, achievements });
    } catch (error) {
        console.error('Error fetching my achievements:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Update showcased achievements
router.post('/showcase', authenticateToken, async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const userId = req.user.id;
        const { achievementIds } = req.body;

        if (!Array.isArray(achievementIds) || achievementIds.length > 3) {
            return res.status(400).json({ success: false, message: 'Invalid selection. Max 3 achievements.' });
        }

        // 1. Reset current showcase
        await connection.query('UPDATE user_achievements SET is_showcased = FALSE WHERE user_id = ?', [userId]);

        // 2. Set new showcase
        if (achievementIds.length > 0) {
            // Verify ownership
            const [owned] = await connection.query(
                `SELECT achievement_id FROM user_achievements WHERE user_id = ? AND achievement_id IN (?)`,
                [userId, achievementIds]
            );

            const ownedIds = owned.map(o => o.achievement_id);

            // Check if all requested IDs are owned
            const allOwned = achievementIds.every(id => ownedIds.includes(id));
            if (!allOwned) {
                await connection.rollback();
                return res.status(403).json({ success: false, message: 'You do not own one or more selected achievements.' });
            }

            if (achievementIds.length > 0) {
                await connection.query(
                    `UPDATE user_achievements SET is_showcased = TRUE WHERE user_id = ? AND achievement_id IN (?)`,
                    [userId, achievementIds]
                );
            }
        }

        await connection.commit();
        res.json({ success: true, message: 'Showcase updated successfully' });

    } catch (error) {
        await connection.rollback();
        console.error('Error updating showcase:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    } finally {
        connection.release();
    }
});

// Dev endpoint to manually unlock
router.post('/unlock', authenticateToken, async (req, res) => {
    // Only allow for admin or dev environment? For now, we allow auth user to test.
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    try {
        const { userId, achievementId } = req.body;
        const result = await unlockAchievement(userId || req.user.id, achievementId);

        if (result) {
            res.json({ success: true, message: 'Achievement unlocked' });
        } else {
            res.json({ success: false, message: 'Achievement already unlocked or not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
