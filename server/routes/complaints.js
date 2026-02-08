import express from 'express';
import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware as authenticateToken } from '../middleware/auth.js';
import { createNotification } from '../utils/notifications.js';
import { logActivity } from '../utils/activity.js';

const router = express.Router();

// Get all complaints (admin only)
router.get('/', authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const complaints = await query(`
            SELECT 
                c.*,
                u.name as user_name,
                u.username,
                u.avatar_url,
                u.email
            FROM complaints c
            LEFT JOIN users u ON c.user_id = u.id
            ORDER BY c.created_at DESC
        `);

        res.json({ success: true, data: complaints });
    } catch (error) {
        console.error('Get Complaints Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch complaints' });
    }
});

// Get single complaint with messages (for admin reply feature)
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const complaintId = req.params.id;

        const complaint = await query(`
            SELECT 
                c.*,
                u.name as user_name,
                u.username,
                u.avatar_url,
                u.email
            FROM complaints c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
        `, [complaintId]);

        if (complaint.length === 0) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }

        res.json({ success: true, data: complaint[0] });
    } catch (error) {
        console.error('Get Complaint Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch complaint' });
    }
});

// Get chat messages related to a complaint (admin only)
router.get('/:id/messages', authenticateToken, async (req, res) => {
    try {
        const complaintId = req.params.id;

        // Check if user is admin
        if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        // Get complaint to find session_id
        const complaint = await query('SELECT chat_sessions_id FROM complaints WHERE id = ?', [complaintId]);

        if (complaint.length === 0) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }

        const sessionId = complaint[0].chat_sessions_id;

        if (!sessionId) {
            return res.json({ success: true, data: [] });
        }

        const messages = await query(
            'SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC',
            [sessionId]
        );

        res.json({ success: true, data: messages });
    } catch (error) {
        console.error('Get Complaint Messages Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch messages' });
    }
});

// Create new complaint (from chatbot or manual)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { subject, message, source = 'manual' } = req.body;
        const userId = req.user.id;

        if (!subject || !message) {
            return res.status(400).json({ success: false, message: 'Subject and message are required' });
        }

        const complaintId = uuidv4();

        await query(
            'INSERT INTO complaints (id, user_id, source, subject, message) VALUES (?, ?, ?, ?, ?)',
            [complaintId, userId, source, subject, message]
        );

        res.json({
            success: true,
            message: 'Complaint submitted successfully',
            data: { id: complaintId }
        });

        // Log Activity
        await logActivity(userId, 'Create Complaint', `User submitted complaint: ${subject}`, complaintId, 'complaint');

    } catch (error) {
        console.error('Create Complaint Error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit complaint' });
    }
});

// Update complaint status (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const complaintId = req.params.id;
        const { status, admin_notes } = req.body;

        // Check if user is admin
        if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        // Build update query dynamically
        const updates = [];
        const values = [];

        if (status) {
            updates.push('status = ?');
            values.push(status);
        }
        if (admin_notes !== undefined) {
            updates.push('admin_notes = ?');
            values.push(admin_notes);
        }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'No updates provided' });
        }

        values.push(complaintId);

        await query(
            `UPDATE complaints SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        res.json({ success: true, message: 'Complaint updated successfully' });

        // Log Activity
        if (req.user && req.user.id) {
            await logActivity(req.user.id, 'Update Complaint', `Admin updated complaint ${complaintId} status to ${status}`, complaintId, 'complaint');
        }

        // NOTIFICATION: Complaint Update
        // Fetch user_id
        const [comp] = await query('SELECT user_id, subject FROM complaints WHERE id = ?', [complaintId]);
        if (comp.length > 0) {
            await createNotification(
                comp[0].user_id,
                'complaint_update',
                'Update Laporan',
                `Status laporan "${comp[0].subject}" telah diperbarui menjadi: ${status}`,
                { complaint_id: complaintId, status: status }
            );
        }
    } catch (error) {
        console.error('Update Complaint Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update complaint' });
    }
});

// Delete complaint (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const complaintId = req.params.id;

        // Check if user is admin
        if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        await query('DELETE FROM complaints WHERE id = ?', [complaintId]);

        res.json({ success: true, message: 'Complaint deleted successfully' });
    } catch (error) {
        console.error('Delete Complaint Error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete complaint' });
    }
});

export default router;
