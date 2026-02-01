import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { OAuth2Client } from 'google-auth-library';
import { query, getConnection } from '../config/db.js';
import { sendOTPEmail } from '../config/mail.js';
import { generateToken, authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/register - Register with email/password
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                message: 'Email, password, dan nama harus diisi'
            });
        }

        // Check if email already exists
        const existingUsers = await query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email sudah terdaftar'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const userId = uuidv4();
        await query(
            'INSERT INTO users (id, email, password, name, auth_provider, is_verified) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, email, hashedPassword, name, 'email', false]
        );

        // Generate and save OTP
        const otp = generateOTP();
        const otpId = uuidv4();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await query(
            'INSERT INTO otps (id, user_id, code, type, expires_at) VALUES (?, ?, ?, ?, ?)',
            [otpId, userId, otp, 'registration', expiresAt]
        );

        // Send OTP email
        await sendOTPEmail(email, otp, name);

        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil! Cek email untuk kode OTP',
            data: { userId, email }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat registrasi'
        });
    }
});

// POST /api/auth/verify-otp - Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { userId, code } = req.body;

        if (!userId || !code) {
            return res.status(400).json({
                success: false,
                message: 'User ID dan kode OTP harus diisi'
            });
        }

        // Find valid OTP
        const otps = await query(
            `SELECT * FROM otps 
             WHERE user_id = ? AND code = ? AND is_used = FALSE AND expires_at > NOW()
             ORDER BY created_at DESC LIMIT 1`,
            [userId, code]
        );

        if (otps.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Kode OTP tidak valid atau sudah kadaluarsa'
            });
        }

        const connection = await getConnection();
        try {
            await connection.beginTransaction();

            // Mark OTP as used
            await connection.execute('UPDATE otps SET is_used = TRUE WHERE id = ?', [otps[0].id]);

            // Verify user
            await connection.execute('UPDATE users SET is_verified = TRUE WHERE id = ?', [userId]);

            // Create wallet for user
            const walletId = uuidv4();
            await connection.execute(
                'INSERT INTO wallets (id, user_id, balance) VALUES (?, ?, ?)',
                [walletId, userId, 0]
            );

            // Create user profile
            await connection.execute(
                'INSERT INTO user_profiles (user_id) VALUES (?)',
                [userId]
            );

            // Assign free subscription
            const subscriptionId = uuidv4();
            await connection.execute(
                'INSERT INTO user_subscriptions (id, user_id, plan_id, status) VALUES (?, ?, ?, ?)',
                [subscriptionId, userId, 1, 'active']
            );

            await connection.commit();

            // Get user data
            const users = await query('SELECT * FROM users WHERE id = ?', [userId]);
            const user = users[0];

            // Get subscription
            const subscriptions = await query(
                `SELECT s.*, p.name as plan_name 
                 FROM user_subscriptions s
                 JOIN subscription_plans p ON s.plan_id = p.id
                 WHERE s.user_id = ? AND s.status = 'active'
                 ORDER BY s.end_date DESC LIMIT 1`,
                [userId]
            );
            const subscription = subscriptions.length > 0 ? { ...subscriptions[0], plan: subscriptions[0].plan_name } : null;

            // Generate token
            const token = generateToken(userId);

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.json({
                success: true,
                message: 'Email berhasil diverifikasi',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        username: user.username,
                        phone: user.phone,
                        avatar_url: user.avatar_url,
                        role: user.role,
                        needsUsername: !user.username,
                        needsCoinClaim: !user.has_claimed_login_coin
                    },
                    token,
                    subscription
                }
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat verifikasi OTP'
        });
    }
});

// POST /api/auth/resend-otp - Resend OTP
router.post('/resend-otp', async (req, res) => {
    try {
        const { userId } = req.body;

        const users = await query('SELECT id, email, name FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        const user = users[0];

        // Invalidate old OTPs
        await query('UPDATE otps SET is_used = TRUE WHERE user_id = ? AND is_used = FALSE', [userId]);

        // Generate new OTP
        const otp = generateOTP();
        const otpId = uuidv4();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await query(
            'INSERT INTO otps (id, user_id, code, type, expires_at) VALUES (?, ?, ?, ?, ?)',
            [otpId, userId, otp, 'registration', expiresAt]
        );

        await sendOTPEmail(user.email, otp, user.name);

        res.json({
            success: true,
            message: 'Kode OTP baru telah dikirim'
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengirim OTP'
        });
    }
});

// POST /api/auth/login - Login with email/password
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email dan password harus diisi'
            });
        }

        const users = await query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Email atau password salah'
            });
        }

        const user = users[0];

        if (user.auth_provider === 'google' && !user.password) {
            return res.status(400).json({
                success: false,
                message: 'Akun ini terdaftar dengan Google. Silakan login dengan Google.'
            });
        }

        if (!user.is_verified) {
            return res.status(403).json({
                success: false,
                message: 'Email belum diverifikasi',
                data: { userId: user.id, needsVerification: true }
            });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'Email atau password salah'
            });
        }

        const subscriptions = await query(
            `SELECT s.*, p.name as plan_name 
             FROM user_subscriptions s
             JOIN subscription_plans p ON s.plan_id = p.id
             WHERE s.user_id = ? AND s.status = 'active'
             ORDER BY s.end_date DESC LIMIT 1`,
            [user.id]
        );
        const subscription = subscriptions.length > 0 ? { ...subscriptions[0], plan: subscriptions[0].plan_name } : null;

        const token = generateToken(user.id);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            success: true,
            message: 'Login berhasil',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    username: user.username,
                    phone: user.phone,
                    avatar_url: user.avatar_url,
                    role: user.role,
                    needsUsername: !user.username,
                    needsCoinClaim: !user.has_claimed_login_coin
                },
                token,
                subscription
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat login'
        });
    }
});

// POST /api/auth/google - Google OAuth
router.post('/google', async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: 'Google credential tidak ditemukan'
            });
        }

        // Verify Google token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Check if user exists
        let users = await query('SELECT * FROM users WHERE google_id = ? OR email = ?', [googleId, email]);
        let user;
        let isNewUser = false;

        if (users.length === 0) {
            // Create new user
            isNewUser = true;
            const userId = uuidv4();

            const connection = await getConnection();
            try {
                await connection.beginTransaction();

                await connection.execute(
                    `INSERT INTO users (id, email, name, avatar_url, auth_provider, google_id, is_verified) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [userId, email, name, picture, 'google', googleId, true]
                );

                // Create wallet
                const walletId = uuidv4();
                await connection.execute(
                    'INSERT INTO wallets (id, user_id, balance) VALUES (?, ?, ?)',
                    [walletId, userId, 0]
                );

                // Create profile
                await connection.execute(
                    'INSERT INTO user_profiles (user_id) VALUES (?)',
                    [userId]
                );

                // Assign free subscription
                const subscriptionId = uuidv4();
                await connection.execute(
                    'INSERT INTO user_subscriptions (id, user_id, plan_id, status) VALUES (?, ?, ?, ?)',
                    [subscriptionId, userId, 1, 'active']
                );

                await connection.commit();

                users = await query('SELECT * FROM users WHERE id = ?', [userId]);
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
        } else {
            // Link Google account or update existing user info (avatar, google_id)
            await query('UPDATE users SET google_id = ?, avatar_url = ?, auth_provider = ? WHERE id = ?',
                [googleId, picture, 'google', users[0].id]);
            users = await query('SELECT * FROM users WHERE id = ?', [users[0].id]);
        }

        user = users[0];

        const subscriptions = await query(
            `SELECT s.*, p.name as plan_name 
             FROM user_subscriptions s
             JOIN subscription_plans p ON s.plan_id = p.id
             WHERE s.user_id = ? AND s.status = 'active'
             ORDER BY s.end_date DESC LIMIT 1`,
            [user.id]
        );
        const subscription = subscriptions.length > 0 ? { ...subscriptions[0], plan: subscriptions[0].plan_name } : null;

        const token = generateToken(user.id);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            success: true,
            message: isNewUser ? 'Registrasi Google berhasil' : 'Login Google berhasil',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    username: user.username,
                    phone: user.phone,
                    avatar_url: user.avatar_url,
                    role: user.role,
                    needsUsername: !user.username,
                    needsCoinClaim: !user.has_claimed_login_coin
                },
                token,
                isNewUser,
                subscription
            }
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat autentikasi Google: ' + error.message,
            error: error.message // Expose error for debugging
        });
    }
});

// GET /api/auth/me - Get current user
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const subscriptions = await query(
            `SELECT s.*, p.name as plan_name 
             FROM user_subscriptions s
             JOIN subscription_plans p ON s.plan_id = p.id
             WHERE s.user_id = ? AND s.status = 'active'
             ORDER BY s.end_date DESC LIMIT 1`,
            [req.user.id]
        );
        const subscription = subscriptions.length > 0 ? { ...subscriptions[0], plan: subscriptions[0].plan_name } : null;

        // Fetch user profiles for bio
        const [profiles] = await query('SELECT bio FROM user_profiles WHERE user_id = ?', [req.user.id]);

        const [users] = await query('SELECT password FROM users WHERE id = ?', [req.user.id]);

        // Attach bio to users object for convenience in the response construction below
        if (profiles) users.bio = profiles.bio;

        res.json({
            success: true,
            data: {
                subscription,
                user: {
                    id: req.user.id,
                    email: req.user.email,
                    name: req.user.name,
                    username: req.user.username,
                    phone: req.user.phone,
                    avatar_url: req.user.avatar_url,
                    role: req.user.role,
                    needsUsername: !req.user.username,
                    needsCoinClaim: !req.user.has_claimed_login_coin,
                    hasPassword: !!users?.password,
                    bio: users?.bio || ''
                }
            }
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan'
        });
    }
});

// PUT /api/auth/password - Update password
router.put('/password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        console.log('--- PUT /api/auth/password DEBUG ---');
        console.log('Headers:', req.headers);
        console.log('Body:', req.body);
        console.log('newPassword:', newPassword);

        // 1. Validate New Password Strength
        // Allow any character as long as it meets complexity requirements
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*.,\-_]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            console.log('Password validation failed for:', newPassword); // DEBUG
            return res.status(400).json({
                success: false,
                message: 'Backend: Password harus minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan simbol (!@#$%^&*.,-_).'
            });
        }

        // 2. Check Current Password (if exists)
        const [users] = await query('SELECT password FROM users WHERE id = ?', [userId]);
        const user = users;

        console.log('User has password in DB:', !!user?.password); // DEBUG
        console.log('Current password provided:', !!currentPassword); // DEBUG

        if (user && user.password) {
            if (!currentPassword) {
                console.log('Missing current password'); // DEBUG
                return res.status(400).json({
                    success: false,
                    message: 'Password saat ini harus diisi.'
                });
            }

            console.log('Verifying current password...'); // DEBUG
            const validPassword = await bcrypt.compare(currentPassword, user.password);
            console.log('Password valid:', validPassword); // DEBUG

            if (!validPassword) {
                console.log('Sending 401: Wrong password'); // DEBUG
                return res.status(401).json({
                    success: false,
                    message: 'Password saat ini salah.'
                });
            }
        }

        // 3. Update Password
        console.log('Hashing new password...'); // DEBUG
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

        console.log('Password updated successfully'); // DEBUG
        res.json({
            success: true,
            message: 'Password berhasil diperbarui',
            data: { hasPassword: true }
        });

    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat memperbarui password'
        });
    }
});

// POST /api/auth/logout - Logout
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({
        success: true,
        message: 'Logout berhasil'
    });
});

// PUT /api/auth/profile - Update profile details
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { name, username, phone, bio } = req.body;
        const userId = req.user.id;

        // Validation
        if (!name || !username) {
            return res.status(400).json({
                success: false,
                message: 'Nama dan Username harus diisi'
            });
        }

        if (username.length < 5) {
            return res.status(400).json({
                success: false,
                message: 'Username minimal 5 karakter'
            });
        }

        // Check username uniqueness (excluding current user)
        const existingUsers = await query(
            'SELECT id FROM users WHERE username = ? AND id != ?',
            [username, userId]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Username sudah digunakan'
            });
        }

        // Update User
        await query(
            'UPDATE users SET name = ?, username = ?, phone = ? WHERE id = ?',
            [name, username, phone, userId]
        );

        // Update Bio in user_profiles
        // Use INSERT ... ON DUPLICATE KEY UPDATE to handle both new and existing profiles
        await query(
            `INSERT INTO user_profiles (user_id, bio) VALUES (?, ?) 
             ON DUPLICATE KEY UPDATE bio = VALUES(bio)`,
            [userId, bio || '']
        );

        // Update Bio (if user_profiles table exists and has bio)
        // Check if user_profiles exists and has bio column is good practice, but assuming schema based on context
        // Ignoring bio for now if not in schema, but request mentioned "Bio".
        // Let's assume user_profiles has bio or it's in users. 
        // Based on verify-otp, user_profiles is created but no bio column shown in insert.
        // Let's stick to users table updates for now as that's safe. 
        // Wait, the Settings.jsx has a Bio field. I should verify if I can store it.
        // I'll check schema later. For now, sticking to name/username/phone.

        res.json({
            success: true,
            message: 'Profil berhasil diperbarui',
            data: {
                user: {
                    id: userId,
                    name,
                    username,
                    phone
                }
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat memperbarui profil'
        });
    }
});

export default router;
