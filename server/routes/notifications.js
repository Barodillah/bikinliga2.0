import express from 'express';
import db from '../config/db.js';
import { authMiddleware as authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get Notifications
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 20, offset = 0, unread_only } = req.query;

        let query = `
            SELECT * FROM notifications 
            WHERE user_id = ?
        `;
        const params = [userId];

        if (unread_only === 'true') {
            query += ` AND is_read = FALSE`;
        }

        query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        const [notifications] = await db.query(query, params);

        // Count unread
        const [countResult] = await db.query(
            `SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = FALSE`,
            [userId]
        );

        const formatted = notifications.map(n => ({
            ...n,
            data: typeof n.data === 'string' ? JSON.parse(n.data || '{}') : (n.data || {}),
            is_read: !!n.is_read
        }));

        res.json({
            success: true,
            data: formatted,
            unreadCount: countResult[0].unread_count
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
});

// Mark as Read (Single)
router.patch('/:id/read', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        await db.query(
            `UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?`,
            [id, userId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ success: false, message: 'Failed to update notification' });
    }
});

// Mark All as Read
router.patch('/read-all', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        await db.query(
            `UPDATE notifications SET is_read = TRUE WHERE user_id = ?`,
            [userId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ success: false, message: 'Failed to update notifications' });
    }
});

// Delete Notification
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        await db.query(
            `DELETE FROM notifications WHERE id = ? AND user_id = ?`,
            [id, userId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete notification' });
    }
});

export default router;
