import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

// Get all users with stats
router.get('/users', async (req, res) => {
    try {
        const sql = `
            SELECT 
                u.id, 
                u.username, 
                u.email, 
                u.name, 
                u.phone, 
                u.avatar_url, 
                u.role, 
                u.created_at,
                COALESCE(w.balance, 0) as wallet_balance,
                (SELECT COUNT(*) FROM tournaments t WHERE t.organizer_id = u.id) as tournaments_created,
                (SELECT COUNT(*) FROM participants p WHERE p.user_id = u.id) as competitions_joined,
                sp.name as subscription_plan
            FROM users u
            LEFT JOIN wallets w ON w.user_id = u.id
            LEFT JOIN user_subscriptions us ON us.user_id = u.id AND us.status = 'active'
            LEFT JOIN subscription_plans sp ON sp.id = us.plan_id
            ORDER BY u.created_at DESC
        `;

        const users = await query(sql);

        // Fix map loop bug in thought above
        const formattedUsers = users.map(user => ({
            ...user,
            status: 'active',
            wallet_balance: Number(user.wallet_balance || 0),
            tournaments_created: Number(user.tournaments_created || 0),
            competitions_joined: Number(user.competitions_joined || 0),
            subscription_plan: user.subscription_plan || 'free'
        }));

        res.json({ success: true, data: formattedUsers });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
});

// Get all tournaments (Admin)
router.get('/tournaments', async (req, res) => {
    try {
        const sql = `
            SELECT 
                t.*,
                u.name as creator_name,
                u.username as creator_username,
                u.avatar_url as creator_avatar,
                (SELECT COUNT(*) FROM matches m WHERE m.tournament_id = t.id) as match_count
            FROM tournaments t
            LEFT JOIN users u ON t.organizer_id = u.id
            ORDER BY t.created_at DESC
        `;

        const tournaments = await query(sql);
        res.json({ success: true, data: tournaments });
    } catch (error) {
        console.error('Error fetching tournaments:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch tournaments' });
    }
});

// Update user role and subscription
router.put('/users/:id', async (req, res) => {
    const userId = req.params.id;
    const { role, subscription_plan } = req.body;

    try {
        await query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);

        // Handle subscription plan update
        if (subscription_plan) {
            // Find existing active subscription
            const existingSub = await query(
                'SELECT * FROM user_subscriptions WHERE user_id = ? AND status = "active"',
                [userId]
            );

            // Get plan ID
            const [plan] = await query('SELECT id FROM subscription_plans WHERE name = ?', [subscription_plan]);

            if (plan) {
                if (existingSub.length > 0) {
                    // Update existing
                    await query(
                        'UPDATE user_subscriptions SET plan_id = ? WHERE id = ?',
                        [plan.id, existingSub[0].id]
                    );
                } else {
                    // Create new
                    await query(
                        `INSERT INTO user_subscriptions (id, user_id, plan_id, start_date, end_date, status) 
                         VALUES (UUID(), ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'active')`,
                        [userId, plan.id]
                    );
                }
            } else if (subscription_plan === 'free') {
                // If switching to free, cancel active paid subscriptions
                await query('UPDATE user_subscriptions SET status = "cancelled" WHERE user_id = ? AND status = "active"', [userId]);
            }
        }

        res.json({ success: true, message: 'User updated successfully' });
    } catch (error) {
        console.error('Update User Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update user' });
    }
});

// Adjust wallet balance
router.post('/users/:id/wallet', async (req, res) => {
    const userId = req.params.id;
    const { amount, reason } = req.body;

    if (!amount || amount === 0) {
        return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    try {
        // Get user wallet
        const [wallet] = await query('SELECT id FROM wallets WHERE user_id = ?', [userId]);

        if (!wallet) return res.status(404).json({ success: false, message: 'Wallet not found' });

        // Update balance
        await query('UPDATE wallets SET balance = balance + ? WHERE id = ?', [amount, wallet.id]);

        // Log transaction
        const type = amount > 0 ? 'topup' : 'spend'; // Using topup/spend as approximation, could add 'admin_adjustment' to enum if allowed
        const category = amount > 0 ? 'Admin Bonus' : 'Admin Deduction';

        await query(
            `INSERT INTO transactions (id, wallet_id, type, amount, category, description, status, created_at)
             VALUES (UUID(), ?, ?, ?, ?, ?, 'success', NOW())`,
            [wallet.id, type, amount, category, reason || 'Admin adjustment']
        );

        res.json({ success: true, message: 'Wallet adjusted successfully' });
    } catch (error) {
        console.error('Wallet Adjustment Error:', error);
        res.status(500).json({ success: false, message: 'Failed to adjust wallet' });
    }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        // Cascading deletes handled by foreign keys ideally, but manual cleanup ensures safety
        await query('DELETE FROM users WHERE id = ?', [userId]);
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
});

export default router;
