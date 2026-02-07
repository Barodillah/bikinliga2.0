import express from 'express';
import db from '../config/db.js';
import { authMiddleware as authenticateToken } from '../middleware/auth.js';
import { unlockAchievement } from '../utils/achievements.js';

const router = express.Router();

// Get communities (Public with filters)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { search, type } = req.query;
        let query = `
            SELECT c.*, 
            (SELECT COUNT(*) FROM community_members cm WHERE cm.community_id = c.id) as member_count,
            (SELECT COUNT(*) FROM community_members cm WHERE cm.community_id = c.id AND cm.user_id = ?) as is_joined,
            (
                SELECT sp.name 
                FROM user_subscriptions us 
                JOIN subscription_plans sp ON us.plan_id = sp.id 
                WHERE us.user_id = c.creator_id AND us.status = 'active' 
                ORDER BY sp.price DESC LIMIT 1
            ) as creator_tier_name
            FROM communities c
            WHERE 1=1
        `;
        const params = [req.user.id];

        if (search) {
            query += ` AND c.name LIKE ?`;
            params.push(`%${search}%`);
        }

        if (type) {
            query += ` AND c.type = ?`;
            params.push(type);
        }

        query += ` ORDER BY member_count DESC LIMIT 20`;

        const [communities] = await db.query(query, params);

        res.json({
            success: true,
            data: communities.map(c => ({
                ...c,
                isJoined: !!c.is_joined,
                creator_tier: (c.creator_tier_name || 'free').toLowerCase().replace(' ', '_')
            }))
        });
    } catch (error) {
        console.error('Error fetching communities:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get user's communities
router.get('/my', authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT c.*, 
            cm.role as user_role,
            (SELECT COUNT(*) FROM community_members cm_count WHERE cm_count.community_id = c.id) as total_members
            FROM communities c
            JOIN community_members cm ON c.id = cm.community_id
            WHERE cm.user_id = ?
            ORDER BY cm.joined_at DESC
        `;
        const [communities] = await db.query(query, [req.user.id]);
        res.json({ success: true, data: communities });
    } catch (error) {
        console.error('Error fetching user communities:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Create Community
router.post('/', authenticateToken, async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { name, description, type } = req.body;
        const userId = req.user.id;
        const COST = 500; // Hardcoded cost for now

        // 1. Check Wallet Balance
        const [wallets] = await connection.query('SELECT * FROM wallets WHERE user_id = ? FOR UPDATE', [userId]);
        if (wallets.length === 0 || wallets[0].balance < COST) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Saldo koin tidak mencukupi (Butuh 500 Koin)' });
        }

        // 2. Deduct Balance
        await connection.query('UPDATE wallets SET balance = balance - ?, updated_at = NOW() WHERE user_id = ?', [COST, userId]);

        // 3. Record Transaction
        await connection.query(`
            INSERT INTO transactions (id, wallet_id, type, amount, category, description, status)
            VALUES (UUID(), ?, 'spend', ?, 'community_creation', ?, 'success')
        `, [wallets[0].id, COST, `Pembuatan Komunitas: ${name}`]);

        // 4. Create Community
        const [result] = await connection.query(`
            INSERT INTO communities (name, description, type, creator_id)
            VALUES (?, ?, ?, ?)
        `, [name, description, type, userId]);

        const communityId = result.insertId;

        // 5. Add Creator as Admin Member
        await connection.query(`
            INSERT INTO community_members (community_id, user_id, role, status)
            VALUES (?, ?, 'admin', 'active')
        `, [communityId, userId]);

        // Trigger Achievement: Community Founder
        await unlockAchievement(userId, 'comm_founder');

        await connection.commit();

        res.json({ success: true, message: 'Komunitas berhasil dibuat', data: { id: communityId, name } });

    } catch (error) {
        await connection.rollback();
        console.error('Create community error:', error);
        res.status(500).json({ success: false, message: 'Gagal membuat komunitas' });
    } finally {
        connection.release();
    }
});

// Public Endpoint: Get Community Detail (No Auth)
router.get('/public/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [communities] = await db.query(`
            SELECT c.*, 
            u.name as creator_name,
            u.username as creator_username,
            u.avatar_url as creator_avatar,
            (SELECT COUNT(*) FROM community_members cm WHERE cm.community_id = c.id) as member_count,
            (
                SELECT sp.name 
                FROM user_subscriptions us 
                JOIN subscription_plans sp ON us.plan_id = sp.id 
                WHERE us.user_id = c.creator_id AND us.status = 'active' 
                ORDER BY sp.price DESC LIMIT 1
            ) as creator_tier_name
            FROM communities c
            JOIN users u ON c.creator_id = u.id
            WHERE c.id = ?
        `, [id]);

        if (communities.length === 0) {
            return res.status(404).json({ success: false, message: 'Community not found' });
        }

        const community = {
            ...communities[0],
            creator_tier: (communities[0].creator_tier_name || 'free').toLowerCase().replace(' ', '_')
        };

        // Fetch Admins/Mods (Publicly visible)
        const [admins] = await db.query(`
            SELECT u.id, u.name, u.username, u.avatar_url, cm.role
            FROM community_members cm
            JOIN users u ON cm.user_id = u.id
            WHERE cm.community_id = ? AND cm.role IN ('admin', 'moderator')
        `, [id]);

        res.json({
            success: true,
            data: {
                ...community,
                admins: admins
            }
        });
    } catch (error) {
        console.error('Error fetching public community:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get Community Detail
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id; // Define userId for the query
        const [communities] = await db.query(`
            SELECT c.*, 
            u.name as creator_name,
            u.username as creator_username,
            u.avatar_url as creator_avatar,
            (SELECT COUNT(*) FROM community_members cm WHERE cm.community_id = c.id) as member_count,
            (SELECT COUNT(*) FROM community_members cm WHERE cm.community_id = c.id AND cm.user_id = ?) as is_joined,
            (
                SELECT sp.name 
                FROM user_subscriptions us 
                JOIN subscription_plans sp ON us.plan_id = sp.id 
                WHERE us.user_id = c.creator_id AND us.status = 'active' 
                ORDER BY sp.price DESC LIMIT 1
            ) as creator_tier_name
            FROM communities c
            JOIN users u ON c.creator_id = u.id
            WHERE c.id = ?
        `, [userId, id]);

        if (communities.length === 0) {
            return res.status(404).json({ success: false, message: 'Community not found' });
        }

        const community = {
            ...communities[0],
            isJoined: !!communities[0].is_joined,
            creator_tier: (communities[0].creator_tier_name || 'free').toLowerCase().replace(' ', '_')
        };

        // Fetch Admins/Mods
        const [admins] = await db.query(`
            SELECT u.id, u.name, u.username, u.avatar_url, cm.role
            FROM community_members cm
            JOIN users u ON cm.user_id = u.id
            WHERE cm.community_id = ? AND cm.role IN ('admin', 'moderator')
        `, [id]);

        // Fetch All Members (excluding admins/mods to avoid duplicates in member card)
        const [members] = await db.query(`
            SELECT u.id, u.name, u.username, u.avatar_url, cm.role, cm.joined_at
            FROM community_members cm
            JOIN users u ON cm.user_id = u.id
            WHERE cm.community_id = ? AND cm.status = 'active'
            ORDER BY cm.joined_at DESC
            LIMIT 50
        `, [id]);

        res.json({
            success: true,
            data: {
                ...community,
                isJoined: !!community.is_joined,
                admins: admins,
                members: members
            }
        });
    } catch (error) {
        console.error('Error fetching community detail:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Join Community
router.post('/:id/join', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if community exists
        const [communities] = await db.query('SELECT type FROM communities WHERE id = ?', [id]);
        if (communities.length === 0) return res.status(404).json({ success: false, message: 'Community not found' });

        const community = communities[0];
        const status = community.type === 'private' ? 'pending' : 'active';

        // Check existing membership
        const [existing] = await db.query('SELECT status FROM community_members WHERE community_id = ? AND user_id = ?', [id, userId]);

        if (existing.length > 0) {
            // Already member or pending
            if (existing[0].status === 'active') return res.status(400).json({ success: false, message: 'Sudah bergabung' });
            if (existing[0].status === 'pending') return res.status(400).json({ success: false, message: 'Permintaan masih pending' });
            if (existing[0].status === 'banned') return res.status(403).json({ success: false, message: 'Anda dibanned dari komunitas ini' });

            // Re-join logic if needed (e.g. left before) - simplifying for now by just insert ignore or explicit check
            return res.status(400).json({ success: false, message: 'Status membership tidak valid' });
        }

        await db.query(`INSERT INTO community_members (community_id, user_id, role, status) VALUES (?, ?, 'member', ?)`, [id, userId, status]);

        if (status === 'active') {
            // Trigger Achievement: Team Player
            await unlockAchievement(userId, 'comm_member');
        }

        // Update member count cache in communities table if needed, or rely on count query

        res.json({ success: true, message: status === 'active' ? 'Berhasil bergabung' : 'Permintaan bergabung dikirim' });
    } catch (error) {
        // Handle duplicate key error gracefully
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Sudah bergabung / request pending' });
        }
        console.error('Join community error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Leave Community
router.post('/:id/leave', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if community exists
        const [communities] = await db.query('SELECT creator_id FROM communities WHERE id = ?', [id]);
        if (communities.length === 0) return res.status(404).json({ success: false, message: 'Community not found' });

        const community = communities[0];

        // Prevent creator from leaving
        if (community.creator_id === userId) {
            return res.status(400).json({ success: false, message: 'Creator tidak dapat keluar dari komunitas. Silakan bubarkan komunitas jika ingin menghapus.' });
        }

        // Check membership
        const [existing] = await db.query('SELECT id FROM community_members WHERE community_id = ? AND user_id = ?', [id, userId]);
        if (existing.length === 0) {
            return res.status(400).json({ success: false, message: 'Anda bukan anggota komunitas ini' });
        }

        // Remove member
        await db.query('DELETE FROM community_members WHERE community_id = ? AND user_id = ?', [id, userId]);

        res.json({ success: true, message: 'Berhasil keluar dari komunitas' });
    } catch (error) {
        console.error('Leave community error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

export default router;
