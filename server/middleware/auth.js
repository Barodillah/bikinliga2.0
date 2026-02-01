import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'bikinliga-secret-key-2024';

export function generateToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

export async function authMiddleware(req, res, next) {
    try {
        const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token tidak ditemukan'
            });
        }

        const decoded = verifyToken(token);

        const users = await query(
            'SELECT id, email, username, name, phone, avatar_url, role, is_verified, has_claimed_login_coin FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        req.user = users[0];
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token tidak valid'
        });
    }
}

export async function optionalAuth(req, res, next) {
    try {
        const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            req.user = null;
            return next();
        }

        const decoded = verifyToken(token);
        const users = await query(
            'SELECT id, email, username, name, phone, avatar_url, role, is_verified, has_claimed_login_coin FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (users.length === 0) {
            req.user = null;
        } else {
            req.user = users[0];
        }
        next();
    } catch (error) {
        req.user = null;
        next();
    }
}

export default authMiddleware;
