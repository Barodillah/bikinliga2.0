import express from 'express';
import { query } from '../config/db.js';
import { unlockAchievement } from '../utils/achievements.js';

import { createNotification, createBulkNotifications } from '../utils/notifications.js';
import { logActivity } from '../utils/activity.js';
import { checkOrderStatus } from '../utils/doku.js';
import { getAndRecordCurrentPrice } from '../utils/economy.js';

const router = express.Router();

import os from 'os';

// Get dashboard statistics
router.get('/dashboard-stats', async (req, res) => {
    try {
        const statsQuery = `
            SELECT 
                (SELECT COUNT(*) FROM users WHERE username IS NOT NULL AND username != '') as total_users,
                (SELECT COUNT(*) FROM complaints WHERE status IN ('open', 'in_progress')) as active_complaints,
                (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'topup' AND status = 'success') as total_revenue,
                (SELECT COUNT(*) FROM tournaments) as total_tournaments,
                (SELECT COUNT(*) FROM matches) as total_matches,
                (SELECT COUNT(*) FROM user_subscriptions us JOIN subscription_plans sp ON us.plan_id = sp.id WHERE us.status = 'active' AND sp.name != 'free') as active_subscriptions,
                (SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURDATE()) as new_users_today
        `;

        const [stats] = await query(statsQuery);

        // System Metrics Calculation
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const memUsagePercent = Math.round((usedMem / totalMem) * 100);

        let healthStatus = 'Stable';
        if (memUsagePercent > 90) {
            healthStatus = 'Critical';
        } else if (memUsagePercent > 70) {
            healthStatus = 'High Load';
        }

        res.json({
            success: true,
            data: {
                ...stats,
                system_health: healthStatus,
                server_load: memUsagePercent,
                db_usage: 45 // Placeholder as requested, or could be real query count if available
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
    }
});

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
                (SELECT COUNT(*) FROM matches m WHERE m.tournament_id = t.id) as match_count,
                (SELECT COUNT(*) FROM participants p WHERE p.tournament_id = t.id) as participant_count
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

        // Handle verification update (if provided)
        if (req.body.is_verified === true || req.body.is_verified === 'true') {
            await query('UPDATE users SET is_verified = TRUE WHERE id = ?', [userId]);
            await unlockAchievement(userId, 'social_verified');
        } else if (req.body.is_verified === false || req.body.is_verified === 'false') {
            await query('UPDATE users SET is_verified = FALSE WHERE id = ?', [userId]);
        }

        // Trigger Achievement: Subscription
        if (subscription_plan === 'captain') await unlockAchievement(userId, 'sub_captain');
        if (subscription_plan === 'pro_league') await unlockAchievement(userId, 'sub_pro');

        res.json({ success: true, message: 'User updated successfully' });

        // Log Activity
        if (req.user && req.user.id) {
            await logActivity(req.user.id, 'Admin Update User', `Admin updated user ${userId} role/sub`, userId, 'user');
        }
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

        // NOTIFICATION: Coin Adjustment
        await createNotification(
            userId,
            'coin_adjustment',
            amount > 0 ? 'Penambahan Koin 💰' : 'Pengurangan Koin 💸',
            `Admin menyesuaikan saldo Anda sebesar ${amount > 0 ? '+' : ''}${amount}. Alasan: ${reason || '-'}`,
            { amount: amount, reason: reason }
        );


        res.json({ success: true, message: 'Wallet adjusted successfully' });

        // Trigger Achievement: Economy
        if (amount > 0) {
            // Check First Blood (First Topup)
            const [txCount] = await query('SELECT COUNT(*) as count FROM transactions WHERE wallet_id = ? AND type = "topup"', [wallet.id]);
            if (txCount[0].count === 1) { // 1 because we just inserted it
                await unlockAchievement(userId, 'eco_first_topup');
            }

            // Check High Roller (Balance >= 1000)
            const [updatedWallet] = await query('SELECT balance FROM wallets WHERE id = ?', [wallet.id]);
            if (updatedWallet[0].balance >= 1000) {
                await unlockAchievement(userId, 'eco_wealthy');
            }
        }
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

        if (req.user && req.user.id) {
            await logActivity(req.user.id, 'Admin Delete User', `Admin deleted user ${userId}`, userId, 'user');
        }
    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
});

// Email Blast endpoint
router.post('/email-blast', async (req, res) => {
    const { recipients, subject, body } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({ success: false, message: 'No recipients provided' });
    }

    if (!subject || !body) {
        return res.status(400).json({ success: false, message: 'Subject and body are required' });
    }

    // Dynamic import of mail config
    const { default: transporter } = await import('../config/mail.js');

    const results = [];

    for (const recipient of recipients) {
        try {
            // Replace {nama} placeholder with actual name
            const personalizedBody = body.replace(/{nama}/gi, recipient.name || 'Pengguna');

            const mailOptions = {
                from: `"BikinLiga" <${process.env.MAIL_FROM_ADDRESS}>`,
                to: recipient.email,
                subject: subject,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 20px; }
                            .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; }
                            .logo { text-align: center; margin-bottom: 30px; }
                            .logo span { font-size: 28px; font-weight: bold; }
                            .logo .pink { color: #FE00A6; }
                            .logo .green { color: #02F702; }
                            .content { font-size: 16px; line-height: 1.8; color: #e0e0e0; white-space: pre-wrap; }
                            .cta { display: inline-block; margin-top: 30px; padding: 14px 32px; background: linear-gradient(135deg, #00ff87 0%, #00d9ff 100%); color: #000; font-weight: bold; text-decoration: none; border-radius: 8px; }
                            .footer { margin-top: 40px; text-align: center; color: #666666; font-size: 12px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="logo">
                                <span class="green">Bikin<span class="pink">Liga</span></span>
                            </div>
                            <div class="content">${personalizedBody}</div>
                            <div style="text-align: center;">
                                <a href="https://bikinliga.online" class="cta">Kunjungi BikinLiga 2.0</a>
                            </div>
                            <div class="footer">
                                <p>© 2026 BikinLiga. All rights reserved.</p>
                                <p>Anda menerima email ini karena Anda terdaftar sebagai pengguna BikinLiga.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            await transporter.sendMail(mailOptions);
            results.push({ email: recipient.email, success: true });

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
            console.error(`Failed to send email to ${recipient.email}:`, error.message);
            results.push({ email: recipient.email, success: false, error: error.message });
        }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    res.json({
        success: true,
        message: `Email blast completed. ${successCount} sent, ${failCount} failed.`,
        results
    });
});

// Get System History
router.get('/history', async (req, res) => {
    try {
        const sql = `
            SELECT 
                l.id,
                l.action,
                l.description,
                l.created_at,
                l.reference_id,
                l.reference_type,
                u.name as user_name,
                u.email as user_email,
                u.avatar_url as user_avatar,
                u.role as user_role
            FROM user_logs l
            JOIN users u ON l.user_id = u.id
            ORDER BY l.created_at DESC
            LIMIT 100
        `;

        const logs = await query(sql);

        // Format relative time if needed, or let frontend handle it
        res.json({ success: true, data: logs });
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch history' });
    }
});

// Admin Announcement
router.post('/announcements', async (req, res) => {
    try {
        const { title, message, target_user_id } = req.body;

        if (!title || !message) {
            return res.status(400).json({ success: false, message: 'Title and message are required' });
        }

        if (target_user_id) {
            // Single User
            await createNotification(
                target_user_id,
                'admin_announcement',
                title,
                message,
                { from: 'admin' }
            );
        } else {
            // All Users (Bulk)
            // Fetch all user IDs (WARNING: Heavy for large user base, but okay for MVP/small scale)
            const users = await query('SELECT id FROM users');
            const userIds = users.map(u => u.id);

            // Chunking if too large? createBulkNotifications handles array.
            // But let's limit it or chunk it inside the utils if needed.
            // For now, pass all.
            await createBulkNotifications(
                userIds,
                'admin_announcement',
                title,
                message,
                { from: 'admin' }
            );
        }

        res.json({ success: true, message: 'Announcement sent successfully' });

        if (req.user && req.user.id) {
            await logActivity(req.user.id, 'Admin Announcement', `Admin sent announcement: ${title}`, null, 'system');
        }
    } catch (error) {
        console.error('Announcement Error:', error);
        res.status(500).json({ success: false, message: 'Failed to send announcement' });
    }
});

// ==================== TRANSACTION ROUTES ====================

// GET /admin/transactions/coin-price/current - Get real-time dynamic coin price
router.get('/transactions/coin-price/current', async (req, res) => {
    try {
        const { price, supply, activeTournaments } = await getAndRecordCurrentPrice();

        // Also get 24h ago, 7d ago, 30d ago prices for stats cards
        const [dayAgo] = await query('SELECT price FROM coin_price_history WHERE recorded_at <= DATE_SUB(NOW(), INTERVAL 1 DAY) ORDER BY recorded_at DESC LIMIT 1');
        const [weekAgo] = await query('SELECT price FROM coin_price_history WHERE recorded_at <= DATE_SUB(NOW(), INTERVAL 7 DAY) ORDER BY recorded_at DESC LIMIT 1');
        const [monthAgo] = await query('SELECT price FROM coin_price_history WHERE recorded_at <= DATE_SUB(NOW(), INTERVAL 30 DAY) ORDER BY recorded_at DESC LIMIT 1');

        res.json({
            success: true,
            data: {
                currentPrice: price,
                supply,
                activeTournaments,
                yesterdayPrice: dayAgo ? Number(dayAgo.price) : price,
                weekAgoPrice: weekAgo ? Number(weekAgo.price) : price,
                monthAgoPrice: monthAgo ? Number(monthAgo.price) : price
            }
        });
    } catch (error) {
        console.error('Error fetching current coin price:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch coin price' });
    }
});

// GET /admin/transactions/coin-price/history - Get 30d historical chart data
router.get('/transactions/coin-price/history', async (req, res) => {
    try {
        // Fetch 1 record per day max for the last 30 days to build the chart
        const sql = `
            SELECT 
                DATE(recorded_at) as date, 
                MAX(price) as price,
                MAX(circulating_supply) as supply,
                MAX(active_tournaments) as tournaments
            FROM coin_price_history
            WHERE recorded_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(recorded_at)
            ORDER BY date ASC
        `;
        const history = await query(sql);
        res.json({ success: true, data: history });
    } catch (error) {
        console.error('Error fetching coin price history:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch coin price history' });
    }
});

// GET /admin/transactions/recent-coin-usage
router.get('/transactions/recent-coin-usage', async (req, res) => {
    try {
        const sql = `
            SELECT 
                t.type, t.amount, t.created_at,
                u.username as user
            FROM transactions t
            JOIN wallets w ON t.wallet_id = w.id
            JOIN users u ON w.user_id = u.id
            WHERE t.status = 'success'
            ORDER BY t.created_at DESC
            LIMIT 10
        `;
        const recent = await query(sql);
        res.json({ success: true, data: recent });
    } catch (error) {
        console.error('Error fetching recent coin usage:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch recent transactions' });
    }
});


// GET /admin/transactions/stats - Transaction summary stats
router.get('/transactions/stats', async (req, res) => {
    try {
        const statsQuery = `
            SELECT
                COALESCE(SUM(CASE WHEN type = 'topup' AND status = 'success' THEN amount ELSE 0 END), 0) as total_topup_coins,
                COUNT(CASE WHEN type = 'topup' THEN 1 END) as total_topup_count,
                COUNT(CASE WHEN type = 'spend' THEN 1 END) as total_spend_count,
                COUNT(DISTINCT CASE WHEN type = 'topup' AND status = 'success' THEN wallet_id END) as active_payers
            FROM transactions
        `;
        const [stats] = await query(statsQuery);
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Transaction stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch transaction stats' });
    }
});

// GET /admin/transactions/topup - All topup transactions with user info
router.get('/transactions/topup', async (req, res) => {
    try {
        const sql = `
            SELECT 
                t.id, t.amount, t.category, t.description, t.status, t.reference_id, t.created_at,
                u.name as user_name, u.email as user_email, u.avatar_url as user_avatar
            FROM transactions t
            JOIN wallets w ON t.wallet_id = w.id
            JOIN users u ON w.user_id = u.id
            WHERE t.type = 'topup'
            ORDER BY t.created_at DESC
            LIMIT 200
        `;
        const transactions = await query(sql);
        res.json({ success: true, data: transactions });
    } catch (error) {
        console.error('Topup transactions error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch topup transactions' });
    }
});

// GET /admin/transactions/spend - All spend transactions with user info
router.get('/transactions/spend', async (req, res) => {
    try {
        const sql = `
            SELECT 
                t.id, t.amount, t.category, t.description, t.status, t.created_at,
                u.name as user_name, u.email as user_email, u.avatar_url as user_avatar
            FROM transactions t
            JOIN wallets w ON t.wallet_id = w.id
            JOIN users u ON w.user_id = u.id
            WHERE t.type = 'spend'
            ORDER BY t.created_at DESC
            LIMIT 200
        `;
        const transactions = await query(sql);
        res.json({ success: true, data: transactions });
    } catch (error) {
        console.error('Spend transactions error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch spend transactions' });
    }
});

// GET /admin/transactions/claim - All claim reward transactions with user info
router.get('/transactions/claim', async (req, res) => {
    try {
        const sql = `
            SELECT 
                t.id, t.amount, t.category, t.description, t.status, t.created_at,
                t.type as type_reward,
                u.name as user_name, u.email as user_email, u.avatar_url as user_avatar
            FROM transactions t
            JOIN wallets w ON t.wallet_id = w.id
            JOIN users u ON w.user_id = u.id
            WHERE t.type = 'reward' OR t.type = 'claim'
            ORDER BY t.created_at DESC
            LIMIT 200
        `;
        const claims = await query(sql);
        res.json({ success: true, data: claims });
    } catch (error) {
        console.error('Claim transactions error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch claim transactions' });
    }
});

// GET /admin/transactions/doku-status/:invoiceNumber - Check DOKU order status
router.get('/transactions/doku-status/:invoiceNumber', async (req, res) => {
    try {
        const { invoiceNumber } = req.params;
        const dokuData = await checkOrderStatus(invoiceNumber);
        res.json({ success: true, data: dokuData });
    } catch (error) {
        console.error('DOKU status check error:', error);
        res.status(500).json({ success: false, message: 'Failed to check DOKU status' });
    }
});

export default router;
