import express from 'express';
import db from '../config/db.js';
import { authMiddleware as authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public Endpoint: Get Single Post (No Auth)
router.get('/public/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [posts] = await db.query(`
            SELECT p.*, 
            u.name as user_name, u.username as user_username, u.avatar_url as user_avatar, u.role as user_role,
            c.name as community_name, c.icon_url as community_icon,
            (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) as likes_count,
            (SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.id) as comments_count
            FROM posts p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN communities c ON p.community_id = c.id
            WHERE p.id = ?
        `, [id]);

        if (posts.length === 0) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        const post = posts[0];
        post.metadata = typeof post.metadata === 'string' ? JSON.parse(post.metadata) : post.metadata;

        // Fetch top 3 latest comments
        const [comments] = await db.query(`
             SELECT c.*, u.name, u.username, u.avatar_url
            FROM post_comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = ?
            ORDER BY c.created_at DESC
            LIMIT 3
        `, [id]);

        res.json({
            success: true,
            data: {
                ...post,
                comments: comments
            }
        });
    } catch (error) {
        console.error('Error fetching public post:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get Posts (Timeline or Community Feed)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { community_id, cursor, limit = 10 } = req.query;
        const userId = req.user.id;

        let query = `
            SELECT p.*, 
            u.name as user_name, u.username as user_username, u.avatar_url as user_avatar, u.role as user_role,
            c.name as community_name, c.icon_url as community_icon,
            (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) as likes_count,
            (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ?) as is_liked,
            (SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.id) as comments_count
            FROM posts p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN communities c ON p.community_id = c.id
            WHERE 1=1
        `;

        const params = [userId];

        if (community_id) {
            query += ` AND p.community_id = ?`;
            params.push(community_id);
        } else {
            // For global feed (E-Club), only show general posts (not community specific)
            query += ` AND p.community_id IS NULL`;
        }

        if (cursor) {
            query += ` AND p.id < ?`;
            params.push(cursor);
        }

        query += ` ORDER BY p.is_pinned DESC, p.created_at DESC LIMIT ?`;
        params.push(parseInt(limit));

        const [posts] = await db.query(query, params);

        // Parse metadata JSON
        const formattedPosts = posts.map(p => ({
            ...p,
            metadata: typeof p.metadata === 'string' ? JSON.parse(p.metadata) : p.metadata,
            is_liked: !!p.is_liked
        }));

        res.json({ success: true, data: formattedPosts });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Create Post
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { content, community_id, image_url, shared_content_type, shared_content_id, metadata } = req.body;
        const userId = req.user.id;

        const [result] = await db.query(`
            INSERT INTO posts (user_id, community_id, content, image_url, shared_content_type, shared_content_id, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [userId, community_id || null, content, image_url, shared_content_type || 'none', shared_content_id, JSON.stringify(metadata)]);

        // Fetch the created post to return full structure
        const [newPost] = await db.query(`
             SELECT p.*, 
            u.name as user_name, u.username as user_username, u.avatar_url as user_avatar, u.role as user_role
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.id = ?
        `, [result.insertId]);

        res.json({
            success: true,
            message: 'Post created',
            data: {
                ...newPost[0],
                metadata: typeof newPost[0].metadata === 'string' ? JSON.parse(newPost[0].metadata) : newPost[0].metadata
            }
        });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ success: false, message: 'Failed to create post' });
    }
});

// Like Post
router.post('/:id/like', authenticateToken, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;

        // Check if liked
        const [exists] = await db.query('SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?', [postId, userId]);

        if (exists.length > 0) {
            await db.query('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?', [postId, userId]);
            res.json({ success: true, liked: false });
        } else {
            await db.query('INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)', [postId, userId]);
            res.json({ success: true, liked: true });
        }
    } catch (error) {
        console.error('Like error:', error);
        res.status(500).json({ success: false, message: 'Error processing like' });
    }
});

// Get Comments
router.get('/:id/comments', authenticateToken, async (req, res) => {
    try {
        const postId = req.params.id;
        const [comments] = await db.query(`
            SELECT c.*, u.name, u.username, u.avatar_url
            FROM post_comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = ?
            ORDER BY c.created_at ASC
        `, [postId]);

        res.json({ success: true, data: comments });
    } catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({ success: false, message: 'Error fetching comments' });
    }
});

// Add Comment
router.post('/:id/comments', authenticateToken, async (req, res) => {
    try {
        const postId = req.params.id;
        const { content } = req.body;
        const userId = req.user.id;

        const [result] = await db.query(`
            INSERT INTO post_comments (post_id, user_id, content)
            VALUES (?, ?, ?)
        `, [postId, userId, content]);

        const [newComment] = await db.query(`
            SELECT c.*, u.name, u.username, u.avatar_url
            FROM post_comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
        `, [result.insertId]);

        res.json({ success: true, data: newComment[0] });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ success: false, message: 'Failed to add comment' });
    }
});

// Delete Post
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;

        // Verify ownership
        const [posts] = await db.query('SELECT user_id FROM posts WHERE id = ?', [postId]);
        if (posts.length === 0) return res.status(404).json({ success: false, message: 'Post not found' });

        if (posts[0].user_id !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        await db.query('DELETE FROM posts WHERE id = ?', [postId]);
        res.json({ success: true, message: 'Post deleted' });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ success: false, message: 'Error deleting post' });
    }
});

export default router;
