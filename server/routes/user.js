import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, getConnection } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { createCheckoutSession, verifyNotificationSignature, checkOrderStatus } from '../utils/doku.js';

const router = express.Router();

// GET /api/user/check-username - Check username availability
router.get('/check-username', async (req, res) => {
    try {
        const { username } = req.query;

        if (!username) {
            return res.status(400).json({
                success: false,
                message: 'Username harus diisi'
            });
        }

        // Validate username format
        const usernameRegex = /^[a-zA-Z0-9._]{3,20}$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).json({
                success: false,
                message: 'Username hanya boleh huruf, angka, titik, dan underscore (3-20 karakter)'
            });
        }

        const users = await query('SELECT id FROM users WHERE username = ?', [username.toLowerCase()]);

        res.json({
            success: true,
            available: users.length === 0,
            message: users.length === 0 ? 'Username tersedia' : 'Username sudah digunakan'
        });
    } catch (error) {
        console.error('Check username error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan'
        });
    }
});

// POST /api/user/set-username - Set username (first time)
router.post('/set-username', authMiddleware, async (req, res) => {
    try {
        const { username } = req.body;
        const userId = req.user.id;

        if (!username) {
            return res.status(400).json({
                success: false,
                message: 'Username harus diisi'
            });
        }

        // Validate username format
        const usernameRegex = /^[a-zA-Z0-9._]{3,20}$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).json({
                success: false,
                message: 'Username hanya boleh huruf, angka, titik, dan underscore (3-20 karakter)'
            });
        }

        // Check if user already has username
        if (req.user.username) {
            return res.status(400).json({
                success: false,
                message: 'Username sudah diatur sebelumnya'
            });
        }

        // Check availability
        const existing = await query('SELECT id FROM users WHERE username = ? AND id != ?',
            [username.toLowerCase(), userId]);

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Username sudah digunakan'
            });
        }

        // Update username
        await query('UPDATE users SET username = ? WHERE id = ?', [username.toLowerCase(), userId]);

        res.json({
            success: true,
            message: 'Username berhasil diatur',
            data: { username: username.toLowerCase() }
        });
    } catch (error) {
        console.error('Set username error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengatur username'
        });
    }
});

// POST /api/user/claim-login-coin - Claim 100 coins (first login reward)
router.post('/claim-login-coin', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        // Check if already claimed
        if (req.user.has_claimed_login_coin) {
            return res.status(400).json({
                success: false,
                message: 'Bonus sudah diklaim sebelumnya'
            });
        }

        const connection = await getConnection();
        try {
            await connection.beginTransaction();

            // Get wallet
            const [wallets] = await connection.execute(
                'SELECT id, balance FROM wallets WHERE user_id = ?',
                [userId]
            );

            if (wallets.length === 0) {
                throw new Error('Wallet tidak ditemukan');
            }

            const wallet = wallets[0];
            const newBalance = parseFloat(wallet.balance) + 100;

            // Update wallet balance
            await connection.execute(
                'UPDATE wallets SET balance = ? WHERE id = ?',
                [newBalance, wallet.id]
            );

            // Create transaction record
            const txId = uuidv4();
            await connection.execute(
                `INSERT INTO transactions (id, wallet_id, type, amount, category, description, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [txId, wallet.id, 'reward', 100, 'Login Bonus', 'Bonus coin pendaftaran pertama kali', 'success']
            );

            // Mark as claimed
            await connection.execute(
                'UPDATE users SET has_claimed_login_coin = TRUE WHERE id = ?',
                [userId]
            );

            await connection.commit();

            res.json({
                success: true,
                message: 'Selamat! Anda mendapat 100 Coin!',
                data: {
                    amount: 100,
                    newBalance: newBalance
                }
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Claim coin error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengklaim bonus'
        });
    }
});

// POST /api/user/claim-ad-reward - Claim coins from watching ads
router.post('/claim-ad-reward', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { coins } = req.body;

        if (!coins || isNaN(coins) || coins <= 0) {
            return res.status(400).json({ success: false, message: 'Jumlah koin tidak valid' });
        }

        const connection = await getConnection();
        try {
            await connection.beginTransaction();

            // Get wallet
            const [wallets] = await connection.execute(
                'SELECT id, balance FROM wallets WHERE user_id = ?',
                [userId]
            );

            if (wallets.length === 0) {
                throw new Error('Wallet tidak ditemukan');
            }

            const wallet = wallets[0];
            const newBalance = parseFloat(wallet.balance) + coins;

            // Update wallet balance
            await connection.execute(
                'UPDATE wallets SET balance = ? WHERE id = ?',
                [newBalance, wallet.id]
            );

            // Create transaction record
            const txId = uuidv4();
            await connection.execute(
                `INSERT INTO transactions (id, wallet_id, type, amount, category, description, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [txId, wallet.id, 'reward', coins, 'Ad Reward', 'Watch Ad Reward', 'success']
            );

            await connection.commit();

            res.json({
                success: true,
                message: `Berhasil mendapatkan ${coins} koin`,
                data: {
                    amount: coins,
                    newBalance: newBalance
                }
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Claim ad reward error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengklaim reward iklan'
        });
    }
});

// GET /api/user/profile - Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const profiles = await query(
            `SELECT u.id, u.email, u.username, u.name, u.phone, u.avatar_url, u.role, u.created_at,
                    up.bio, up.city, up.birth_date, up.preferences
             FROM users u
             LEFT JOIN user_profiles up ON u.id = up.user_id
             WHERE u.id = ?`,
            [userId]
        );

        if (profiles.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Profil tidak ditemukan'
            });
        }

        // Fetch Subscription
        const subscription = await query(
            `SELECT sp.name as plan_name, us.status, us.end_date 
             FROM user_subscriptions us
             JOIN subscription_plans sp ON us.plan_id = sp.id
             WHERE us.user_id = ? AND us.status = 'active'
             ORDER BY sp.price DESC LIMIT 1`,
            [userId]
        );

        const profileData = profiles[0];
        profileData.subscription = subscription.length > 0 ? subscription[0] : null;

        res.json({
            success: true,
            data: profileData
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan'
        });
    }
});

// GET /api/user/wallet - Get wallet balance
router.get('/wallet', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const wallets = await query(
            'SELECT id, balance, updated_at FROM wallets WHERE user_id = ?',
            [userId]
        );

        if (wallets.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Wallet tidak ditemukan'
            });
        }

        res.json({
            success: true,
            data: wallets[0]
        });
    } catch (error) {
        console.error('Get wallet error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan'
        });
    }
});

// GET /api/user/transactions - Get transaction history
router.get('/transactions', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 20, offset = 0 } = req.query;

        const transactions = await query(
            `SELECT t.* FROM transactions t
             JOIN wallets w ON t.wallet_id = w.id
             WHERE w.user_id = ?
             ORDER BY t.created_at DESC
             LIMIT ? OFFSET ?`,
            [userId, parseInt(limit), parseInt(offset)]
        );

        res.json({
            success: true,
            data: transactions
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan'
        });
    }
});

// GET /api/user/public/:username - Get Public User Profile
router.get('/public/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const cleanUsername = username.replace('@', '');
        console.log('DEBUG PUBLIC: Requested username:', username, 'Clean:', cleanUsername);

        // 1. Get User Details
        const users = await query(
            `SELECT u.id, u.name, u.username, u.email, u.avatar_url, u.created_at, up.bio, up.city, up.preferences,
             (SELECT COUNT(*) FROM participants p WHERE p.user_id = u.id) as total_tournaments,
             (
                SELECT c.name 
                FROM community_members cm
                JOIN communities c ON cm.community_id = c.id
                WHERE cm.user_id = u.id AND cm.status = 'active'
                ORDER BY cm.joined_at DESC LIMIT 1
             ) as community_name,
             (
                SELECT sp.name 
                FROM user_subscriptions us 
                JOIN subscription_plans sp ON us.plan_id = sp.id 
                WHERE us.user_id = u.id AND us.status = 'active' 
                ORDER BY sp.price DESC LIMIT 1
             ) as tier_name
             FROM users u
             LEFT JOIN user_profiles up ON u.id = up.user_id
             WHERE u.username = ?`,
            [cleanUsername]
        );

        console.log('DEBUG PUBLIC: Found users:', users.length);

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = users[0];

        // 2. Fetched Joined Tournaments (Top 3 Recent)
        const joinedTournaments = await query(
            `SELECT t.id, t.name, t.slug, t.logo_url, t.type
             FROM participants p
             JOIN tournaments t ON p.tournament_id = t.id
             WHERE p.user_id = ?
             ORDER BY p.created_at DESC
             LIMIT 3`,
            [user.id]
        );

        // 3. Fetch Match Stats (Points, Win Rate, Matches)
        // Rule: Points (Win=3, Draw=1, Loss=0) based on COMPLETED matches
        const matches = await query(
            `SELECT m.id, m.home_score, m.away_score, m.status, m.created_at, m.updated_at,
                    p1.user_id as home_user_id, p1.name as home_name,
                    p2.user_id as away_user_id, p2.name as away_name,
                    t.name as tournament_name, t.slug as tournament_slug
             FROM matches m
             JOIN participants p1 ON m.home_participant_id = p1.id
             JOIN participants p2 ON m.away_participant_id = p2.id
             LEFT JOIN tournaments t ON m.tournament_id = t.id
             WHERE (p1.user_id = ? OR p2.user_id = ?)
             AND m.status = 'completed'
             ORDER BY m.updated_at DESC`,
            [user.id, user.id]
        );

        let totalPoints = 0;
        let wins = 0;
        let draws = 0;
        let losses = 0;
        let totalMatches = matches.length;

        const recentMatches = matches.slice(0, 10).map(m => {
            const isHome = m.home_user_id === user.id;
            const myScore = isHome ? (m.home_score || 0) : (m.away_score || 0);
            const opScore = isHome ? (m.away_score || 0) : (m.home_score || 0);

            let result = 'Draw';
            if (myScore > opScore) {
                result = 'Win';
                wins++;
                totalPoints += 3;
            } else if (opScore > myScore) {
                result = 'Lose';
                losses++;
            } else {
                draws++;
                totalPoints += 1;
            }

            return {
                result,
                opponent: isHome ? m.away_name : m.home_name,
                score: `${myScore} - ${opScore}`,
                date: m.updated_at || m.created_at,
                tournamentName: m.tournament_name || null,
                tournamentSlug: m.tournament_slug || null
            };
        });

        // Calculate Win Rate
        const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

        // Process Tier
        const tier = (user.tier_name || 'free').toLowerCase().replace(' ', '_');

        // Privacy Check
        let preferences = user.preferences || {};
        console.log('DEBUG PUBLIC: Raw preferences:', preferences, typeof preferences);

        if (typeof preferences === 'string') {
            try {
                preferences = JSON.parse(preferences);
                console.log('DEBUG PUBLIC: Parsed preferences:', preferences);
            } catch (e) {
                console.error('Failed to parse user preferences in public profile:', e);
                preferences = {};
            }
        }

        const showEmail = preferences.showEmail === true; // Default false if undefined
        console.log('DEBUG PUBLIC: showEmail:', showEmail, 'User Email:', user.email);

        res.json({
            success: true,
            data: {
                id: user.id,
                name: user.name,
                username: `@${user.username}`,
                email: showEmail ? user.email : null,
                avatar: user.avatar_url,
                bio: user.bio || 'Tidak ada bio.',
                team: user.community_name || 'Free Agent', // Use fetched community name or default
                role: 'Player', // Placeholder
                tier: tier, // Added Tier
                joinDate: new Date(user.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
                points: totalPoints,
                winRate: `${winRate}%`,
                recentMatches: recentMatches.map(m => m.result), // Simple array ['Win', 'Lose'] for UI chips
                recentMatchesDetails: recentMatches, // Full details if needed later
                totalTournaments: user.total_tournaments || 0,
                joinedTournaments: joinedTournaments,
                socials: {}, // Placeholder
                preferences: preferences // Send preferences to frontend so it can hide other sections
            }
        });

    } catch (error) {
        console.error('Get public profile error:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat profil' });
    }
});

// POST /api/user/topup/create-payment - Create DOKU payment session
router.post('/topup/create-payment', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, coins, package_name } = req.body;

        if (!amount || amount < 10000) {
            return res.status(400).json({ success: false, message: 'Minimal pembayaran Rp 10.000' });
        }

        const connection = await getConnection();
        try {
            console.log('DEBUG DOKU: Creating payment for user', userId, 'amount', amount);
            await connection.beginTransaction();

            // 1. Get Wallet
            const [wallets] = await connection.execute('SELECT id FROM wallets WHERE user_id = ?', [userId]);
            if (wallets.length === 0) {
                console.error('DEBUG DOKU: Wallet not found for user', userId);
                throw new Error('Wallet tidak ditemukan');
            }
            const walletId = wallets[0].id;

            // 2. Create Pending Transaction
            const txId = `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const invoiceNumber = `INV-${Date.now()}`;

            console.log('DEBUG DOKU: Creating transaction', txId, 'invoice', invoiceNumber);
            await connection.execute(
                `INSERT INTO transactions (id, wallet_id, type, amount, category, description, status, reference_id) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [txId, walletId, 'topup', coins, 'Deposit', `Top Up ${coins} Coins - ${package_name}`, 'pending', invoiceNumber]
            );

            // 3. Create DOKU Checkout Session
            console.log('DEBUG DOKU: Calling DOKU API...');
            const checkoutData = await createCheckoutSession({
                amount: amount,
                invoiceNumber: invoiceNumber,
                callbackUrl: `${process.env.VITE_BASE_URL}/dashboard/topup?status=check&invoice=${invoiceNumber}`,
                customerId: userId.toString(),
                customerName: req.user.name,
                customerEmail: req.user.email,
                customerPhone: req.user.phone || '08123456789',
                lineItems: [
                    {
                        name: `Top Up ${coins} Coins`,
                        price: amount,
                        quantity: 1
                    }
                ]
            });
            console.log('DEBUG DOKU: DOKU API Response:', JSON.stringify(checkoutData));

            if (checkoutData && checkoutData.response && checkoutData.response.payment && checkoutData.response.payment.url) {
                await connection.commit();
                res.json({
                    success: true,
                    data: {
                        payment_url: checkoutData.response.payment.url,
                        invoice_number: invoiceNumber,
                        transaction_id: txId
                    }
                });
            } else {
                console.error('DEBUG DOKU: DOKU API Error response:', checkoutData);
                throw new Error(checkoutData.message || (checkoutData.error ? JSON.stringify(checkoutData.error) : 'Gagal membuat sesi pembayaran DOKU'));
            }
        } catch (error) {
            console.error('DEBUG DOKU: Caught error in route:', error);
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({ success: false, message: error.message || 'Terjadi kesalahan sistem' });
    }
});

// POST /api/user/topup/webhook - DOKU Webhook Notification
router.post('/topup/webhook', async (req, res) => {
    try {
        const body = req.body;
        const headers = req.headers;

        console.log('DOKU WEBHOOK RECEIVED:', JSON.stringify(body));

        // Signature Verification (Optional but recommended)
        // const isValid = verifyNotificationSignature(headers, body, process.env.DOKU_SECRET_KEY);
        // if (!isValid) return res.status(401).send('Invalid Signature');

        const invoiceNumber = body.order?.invoice_number;
        const status = body.transaction?.status;

        if (status === 'SUCCESS' && invoiceNumber) {
            const connection = await getConnection();
            try {
                await connection.beginTransaction();

                // 1. Find Transaction
                const [txs] = await connection.execute(
                    'SELECT id, wallet_id, amount, status FROM transactions WHERE reference_id = ? AND type = "topup"',
                    [invoiceNumber]
                );

                if (txs.length > 0 && txs[0].status === 'pending') {
                    const tx = txs[0];
                    const coinsToReceive = tx.amount;

                    // 2. Update Wallet
                    await connection.execute(
                        'UPDATE wallets SET balance = balance + ? WHERE id = ?',
                        [coinsToReceive, tx.wallet_id]
                    );

                    // 3. Mark Transaction as Success
                    await connection.execute(
                        'UPDATE transactions SET status = "success" WHERE id = ?',
                        [tx.id]
                    );

                    await connection.commit();
                    console.log('TOPUP SUCCESS VIA WEBHOOK:', invoiceNumber);
                }
            } catch (error) {
                await connection.rollback();
                console.error('Webhook process error:', error);
            } finally {
                connection.release();
            }
        }

        // DOKU expects 200 OK
        res.status(200).send('OK');
    } catch (error) {
        console.error('Webhook route error:', error);
        res.status(500).send('Internal Error');
    }
});
// GET /api/user/topup/status/:invoice - Check Transaction Status
router.get('/topup/status/:invoice', authMiddleware, async (req, res) => {
    try {
        const invoice = req.params.invoice;
        const connection = await getConnection();

        try {
            const [txs] = await connection.execute(
                `SELECT t.id, t.status, t.wallet_id, t.amount
                 FROM transactions t
                 JOIN wallets w ON t.wallet_id = w.id
                 WHERE t.reference_id = ? AND w.user_id = ? AND t.type = "topup"`,
                [invoice, req.user.id]
            );

            if (txs.length === 0) {
                return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });
            }

            const localTx = txs[0];

            // Jika status masih pending di DB, kita cek ke DOKU
            if (localTx.status === 'pending') {
                try {
                    const dokuStatus = await checkOrderStatus(invoice);
                    const realStatus = dokuStatus?.transaction?.status; // 'SUCCESS', 'FAILED', 'PENDING'

                    if (realStatus === 'SUCCESS') {
                        // Update status transaksi & tambah koin
                        await connection.beginTransaction();
                        try {
                            // 1. Tambah coin ke wallet
                            await connection.execute(
                                'UPDATE wallets SET balance = balance + ? WHERE id = ?',
                                [localTx.amount, localTx.wallet_id]
                            );

                            // 2. Tandai transaksi success
                            await connection.execute(
                                'UPDATE transactions SET status = "success" WHERE id = ?',
                                [localTx.id]
                            );

                            await connection.commit();
                            return res.json({ success: true, status: 'success' });
                        } catch (txError) {
                            await connection.rollback();
                            throw txError;
                        }
                    } else if (realStatus === 'FAILED' || realStatus === 'EXPIRED') {
                        // Update status jadi failed
                        await connection.execute(
                            'UPDATE transactions SET status = "failed" WHERE id = ?',
                            [localTx.id]
                        );
                        return res.json({ success: true, status: 'failed' });
                    }
                } catch (dokuError) {
                    console.error('Failed checking status to DOKU:', dokuError);
                    // Jika gagal cek ke DOKU, kita kembalikan status DB saat ini
                }
            }

            res.json({ success: true, status: localTx.status });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Check status error:', error);
        res.status(500).json({ success: false, message: 'Gagal mengecek status transaksi' });
    }
});

// POST /api/user/subscription/upgrade - Upgrade subscription using coins
router.post('/subscription/upgrade', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { plan_id } = req.body;

        if (!plan_id) {
            return res.status(400).json({ success: false, message: 'Plan ID harus diisi' });
        }

        // Determine required coins based on plan
        let requiredCoins = 0;
        let planName = '';
        if (plan_id === 2) {
            requiredCoins = 1960;
            planName = 'Captain';
        } else if (plan_id === 3) {
            requiredCoins = 5960;
            planName = 'Pro League';
        } else {
            return res.status(400).json({ success: false, message: 'Plan ID tidak valid' });
        }

        const connection = await getConnection();
        try {
            await connection.beginTransaction();

            // 1. Check wallet balance
            const [wallets] = await connection.execute('SELECT id, balance FROM wallets WHERE user_id = ? FOR UPDATE', [userId]);
            if (wallets.length === 0) {
                throw new Error('Wallet tidak ditemukan');
            }

            const wallet = wallets[0];
            if (parseFloat(wallet.balance) < requiredCoins) {
                throw new Error('Saldo koin tidak mencukupi untuk upgrade ini');
            }

            // 2. Deduct coins from wallet
            const newBalance = parseFloat(wallet.balance) - requiredCoins;
            await connection.execute('UPDATE wallets SET balance = ? WHERE id = ?', [newBalance, wallet.id]);

            // 3. Create spend transaction
            const txId = uuidv4();
            await connection.execute(
                `INSERT INTO transactions (id, wallet_id, type, amount, category, description, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [txId, wallet.id, 'spend', -requiredCoins, 'Purchase', `Upgrade to ${planName} Plan (6 Months)`, 'success']
            );

            // 4. Deactivate current active subscriptions
            await connection.execute(
                `UPDATE user_subscriptions SET status = 'expired' WHERE user_id = ? AND status = 'active'`,
                [userId]
            );

            // 5. Insert new subscription
            const subId = uuidv4();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 6);

            await connection.execute(
                `INSERT INTO user_subscriptions (id, user_id, plan_id, status, end_date) 
                 VALUES (?, ?, ?, ?, ?)`,
                [subId, userId, plan_id, 'active', endDate]
            );

            await connection.commit();

            res.json({ success: true, message: `Berhasil upgrade ke paket ${planName}` });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Subscription upgrade error:', error);
        res.status(500).json({ success: false, message: error.message || 'Terjadi kesalahan sistem' });
    }
});

export default router;
