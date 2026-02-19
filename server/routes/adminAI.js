import express from 'express';
import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

import dotenv from 'dotenv';
// Import Auth Middleware
import { authMiddleware } from '../middleware/auth.js';

dotenv.config();

const router = express.Router();

// Apply Auth Middleware to all routes
router.use(authMiddleware);

// Helper to get system stats for context
const getSystemStats = async () => {
    // 1. User Stats
    const [userStats] = await query(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN is_verified = 1 THEN 1 ELSE 0 END) as verified,
            SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new_users_30d
        FROM users
    `);

    // 2. Tournament Stats
    const [tournamentStats] = await query(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
            SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
            SUM(CASE WHEN type = 'knockout' THEN 1 ELSE 0 END) as knockout,
            SUM(CASE WHEN type = 'league' THEN 1 ELSE 0 END) as league,
            SUM(CASE WHEN type = 'group_knockout' THEN 1 ELSE 0 END) as group_knockout
        FROM tournaments
    `);

    // 3. Financial Stats (Revenue)
    const [financialStats] = await query(`
        SELECT 
            COALESCE(SUM(amount), 0) as total_revenue,
            COUNT(*) as total_transactions,
            SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN amount ELSE 0 END) as revenue_30d
        FROM transactions 
        WHERE type = 'topup' AND status = 'success'
    `);

    // 4. Complaints Overview
    const [complaintStats] = await query(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
            SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
            SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
        FROM complaints
    `);

    // 5. Recent Complaints (for qualitative analysis)
    const recentComplaints = await query(`
        SELECT subject, message, status, created_at 
        FROM complaints 
        ORDER BY created_at DESC 
        LIMIT 5
    `);

    return {
        users: userStats[0],
        tournaments: tournamentStats[0],
        finance: financialStats[0],
        complaints: {
            stats: complaintStats[0],
            recent: recentComplaints
        }
    };
};



// Analyze/Chat Endpoint
router.post('/analyze', async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        const userId = req.user ? req.user.id : null;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        let currentSessionId = sessionId;
        let history = [];

        // 1. Handle Session
        if (currentSessionId) {
            const [session] = await query('SELECT * FROM chat_sessions WHERE id = ?', [currentSessionId]);
            if (session) {
                // Fetch messages from chat_messages table
                const [msgs] = await query('SELECT role, content FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC', [currentSessionId]);
                history = msgs || [];
            } else {
                // Session ID provided but not found? Treat as new.
                currentSessionId = null;
            }
        }

        if (!currentSessionId) {
            // Create new session
            currentSessionId = uuidv4();
            await query(
                'INSERT INTO chat_sessions (id, user_id, title) VALUES (?, ?, ?)',
                [currentSessionId, userId, 'New Chat']
            );
        }

        // 2. Prepare Context
        const stats = await getSystemStats();

        const systemPrompt = `
            Anda adalah **AI Business Intelligence & Product Consultant** untuk **BikinLiga**.
            
            **Tentang BikinLiga:**
            BikinLiga adalah platform SaaS modern untuk manajemen turnamen e-sports dan olahraga fisik. 
            Fitur utama meliputi: Bracket Generator (Knockout/League), Automatic Scheduling, Public Leaderboard, Manajemen Tim/Pemain, dan Integrasi Pembayaran (Wallet System).
            Tujuan aplikasi ini adalah memudahkan penyelenggara (EO) membuat turnamen yang profesional dan transparan.

            **Data Terkini Sistem (Real-time):**
            
            📊 **Pengguna:**
            - Total: ${stats.users.total} (Terverifikasi: ${stats.users.verified})
            - Baru (30 Hari): ${stats.users.new_users_30d}
            
            🏆 **Turnamen:**
            - Total: ${stats.tournaments.total}
            - Status: ${stats.tournaments.active} Aktif, ${stats.tournaments.completed} Selesai, ${stats.tournaments.draft} Draft
            - Tipe: ${stats.tournaments.knockout} Knockout, ${stats.tournaments.league} Liga, ${stats.tournaments.group_knockout} Grup+Knockout
            
            💰 **Keuangan:**
            - Total Pendapatan: Rp ${Number(stats.finance.total_revenue).toLocaleString('id-ID')}
            - Pendapatan (30 Hari): Rp ${Number(stats.finance.revenue_30d).toLocaleString('id-ID')}
            - Total Transaksi: ${stats.finance.total_transactions}
            
            📢 **Keluhan & Masukan User:**
            - Total: ${stats.complaints.stats.total} (Open: ${stats.complaints.stats.open}, On Progress: ${stats.complaints.stats.in_progress}, Resolved: ${stats.complaints.stats.resolved})
            - **5 Keluhan Terakhir:**
            ${stats.complaints.recent.map(c => `- [${c.status.toUpperCase()}] ${c.subject}: "${c.message.substring(0, 100)}..."`).join('\n')}

            **Tugas Anda:**
            1. **Analisis Data:** Berikan insight mendalam berdasarkan data di atas. Jangan hanya membaca angka, tapi cari pola (misal: rasio user aktif rendah, banyak turnamen draft, dll).
            2. **Analisis Masalah:** Identifikasi pain point utama user dari data keluhan terakhir. Berikan saran solusi konkret.
            3. **Brainstorming Pengembangan:** Berikan ide fitur baru atau perbaikan UX yang relevan dengan kondisi data saat ini untuk meningkatkan engagement dan revenue.
            4. **Gaya Komunikasi:** Profesional, Strategis, Data-Driven, namun tetap ringkas dan mudah dibaca. Gunakan format Markdown (Bold, List, Header) agar rapi.
            
            Jawab pertanyaan admin berikut dengan konteks di atas:
        `;

        // Map history to OpenRouter format
        const openRouterMessages = [
            { role: 'system', content: systemPrompt },
            ...history.map(msg => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: message }
        ];

        // 3. Call OpenRouter API
        const apiKey = process.env.VITE_OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
        const model = process.env.VITE_OPENROUTER_MODEL || 'google/gemini-2.5-flash-lite';

        let aiResponseText = "";

        if (!apiKey || apiKey === 'mock-key') {
            aiResponseText = `[MOCK AI] (No API Key) Saya melihat ada ${stats.users.total} user.`;
        } else {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://bikinliga.online',
                    'X-Title': 'BikinLiga Admin Assistant'
                },
                body: JSON.stringify({
                    model: model,
                    messages: openRouterMessages,
                    max_tokens: 2000,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error('OpenRouter Error:', errText);
                throw new Error(`OpenRouter API Error: ${response.statusText}`);
            }

            const data = await response.json();
            aiResponseText = data.choices?.[0]?.message?.content || "(No response from AI)";
        }

        // 4. Update History (Save to chat_messages)
        const userMsgId = uuidv4();
        const aiMsgId = uuidv4();

        // Insert User Message
        await query('INSERT INTO chat_messages (id, session_id, role, content) VALUES (?, ?, ?, ?)', [userMsgId, currentSessionId, 'user', message]);
        // Insert AI Message
        await query('INSERT INTO chat_messages (id, session_id, role, content) VALUES (?, ?, ?, ?)', [aiMsgId, currentSessionId, 'assistant', aiResponseText]);

        // Update Title if it's the first message (history was empty)
        if (history.length === 0) {
            const title = message.substring(0, 30) + (message.length > 30 ? '...' : '');
            await query('UPDATE chat_sessions SET title = ? WHERE id = ?', [title, currentSessionId]);
        }

        // Touch updated_at
        await query('UPDATE chat_sessions SET updated_at = NOW() WHERE id = ?', [currentSessionId]);

        // Return full history including new messages
        const updatedHistory = [
            ...history,
            { role: 'user', content: message, created_at: new Date() },
            { role: 'assistant', content: aiResponseText, created_at: new Date() }
        ];

        res.json({
            success: true,
            data: {
                response: aiResponseText,
                sessionId: currentSessionId,
                history: updatedHistory
            }
        });

    } catch (error) {
        console.error('AI Analysis Error:', error);
        console.error('Error Details:', {
            message: error.message,
            stack: error.stack,
            sqlState: error.sqlState,
            sqlMessage: error.sqlMessage
        });
        res.status(500).json({ success: false, message: 'Failed to process AI request: ' + error.message });
    }
});

// Get History
router.get('/history', async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;
        const sql = 'SELECT id, title, created_at FROM chat_sessions WHERE user_id = ? ORDER BY created_at DESC';
        const sessions = await query(sql, [userId]);

        // Improve: Fetch last message for preview
        const formattedSessions = await Promise.all(sessions.map(async session => {
            const [lastMsg] = await query('SELECT content FROM chat_messages WHERE session_id = ? ORDER BY created_at DESC LIMIT 1', [session.id]);
            return {
                id: session.id,
                title: session.title,
                date: session.created_at,
                preview: lastMsg ? (lastMsg.content.substring(0, 50) + '...') : 'No messages'
            };
        }));

        res.json({ success: true, data: formattedSessions });
    } catch (error) {
        console.error('Fetch History Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch history' });
    }
});

// Get Single Session
router.get('/session/:id', async (req, res) => {
    try {
        const sessionId = req.params.id;
        const [session] = await query('SELECT * FROM chat_sessions WHERE id = ?', [sessionId]);

        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

        const messages = await query('SELECT role, content, created_at FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC', [sessionId]);
        session.messages = messages;

        res.json({ success: true, data: session });
    } catch (error) {
        console.error('Fetch Session Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch session' });
    }
});

// Delete Session
router.delete('/session/:id', async (req, res) => {
    try {
        const sessionId = req.params.id;
        await query('DELETE FROM chat_sessions WHERE id = ?', [sessionId]);
        // Cascade delete should handle messages if configured, otherwise delete manually
        // Assuming CASCADE is set on DB, if not: await query('DELETE FROM chat_messages WHERE session_id = ?', [sessionId]);
        res.json({ success: true, message: 'Session deleted' });
    } catch (error) {
        console.error('Delete Session Error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete session' });
    }
});

export default router;
