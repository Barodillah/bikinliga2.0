import express from 'express';
import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware as authenticateToken } from '../middleware/auth.js';
import { logActivity } from '../utils/activity.js';

const router = express.Router();

// System prompt for MinLiga AI Assistant
const SYSTEM_PROMPT = `Kamu adalah MinLiga, asisten AI cerdas untuk platform BikinLiga - aplikasi manajemen turnamen dan liga. Kamu membantu pengguna dengan:

1. **Informasi Turnamen**: Cara membuat, mengelola, dan mengikuti turnamen
2. **Panduan Fitur**: Cara menggunakan fitur-fitur di BikinLiga (bracket, standings, live score, dll)
3. **Tips & Tricks**: Saran untuk penyelenggara dan peserta turnamen
4. **Troubleshooting**: Membantu menyelesaikan masalah teknis

Panduan komunikasi:
- Gunakan Bahasa Indonesia yang ramah dan santai
- Berikan jawaban yang jelas dan terstruktur
- Jika ada keluhan atau saran dari user, tanggapi dengan empati
- Jika user memberikan keluhan/saran/komplen, respon dengan baik dan katakan bahwa masukan mereka akan diteruskan ke tim

Kata kunci untuk mendeteksi keluhan/saran: saran, masukan, keluhan, komplen, bug, error, tidak bisa, gagal, tolong perbaiki, mohon diperbaiki`;

// Keywords to detect complaints/suggestions
const COMPLAINT_KEYWORDS = [
    'saran', 'masukan', 'keluhan', 'komplen', 'complaint',
    'bug', 'error', 'tidak bisa', 'gagal', 'rusak',
    'tolong perbaiki', 'mohon diperbaiki', 'harap diperbaiki',
    'tidak jalan', 'tidak work', 'tidak berfungsi',
    'fitur request', 'tambah fitur', 'usul'
];

// Check if message contains complaint keywords
function isComplaint(message) {
    const lowerMessage = message.toLowerCase();
    return COMPLAINT_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
}

// Generate subject from complaint message
function generateSubject(message) {
    const words = message.split(' ').slice(0, 8).join(' ');
    return words.length > 50 ? words.substring(0, 50) + '...' : words;
}

// Create new chat session
router.post('/sessions', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const sessionId = uuidv4();

        await query(
            'INSERT INTO chat_sessions (id, user_id, title) VALUES (?, ?, ?)',
            [sessionId, userId, 'Percakapan Baru']
        );

        // Add initial greeting message
        const messageId = uuidv4();
        const greeting = 'Halo! Saya MinLiga, asisten AI BikinLiga. Ada yang bisa saya bantu untuk turnamen Anda? 🏆';

        await query(
            'INSERT INTO chat_messages (id, session_id, role, content) VALUES (?, ?, ?, ?)',
            [messageId, sessionId, 'assistant', greeting]
        );

        res.json({
            success: true,
            data: {
                id: sessionId,
                title: 'Percakapan Baru',
                messages: [{
                    id: messageId,
                    role: 'assistant',
                    content: greeting,
                    created_at: new Date()
                }]
            }
        });
    } catch (error) {
        console.error('Create Session Error:', error);
        res.status(500).json({ success: false, message: 'Failed to create chat session' });
    }
});

// Get user's chat sessions
router.get('/sessions', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const sessions = await query(
            `SELECT cs.*, 
                (SELECT COUNT(*) FROM chat_messages WHERE session_id = cs.id) as message_count
             FROM chat_sessions cs 
             WHERE cs.user_id = ? 
             ORDER BY cs.updated_at DESC`,
            [userId]
        );

        res.json({ success: true, data: sessions });
    } catch (error) {
        console.error('Get Sessions Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch chat sessions' });
    }
});

// Get messages for a session
router.get('/sessions/:id/messages', authenticateToken, async (req, res) => {
    try {
        const sessionId = req.params.id;
        const userId = req.user.id;

        // Verify session belongs to user
        const session = await query(
            'SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?',
            [sessionId, userId]
        );

        if (session.length === 0) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        const messages = await query(
            'SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC',
            [sessionId]
        );

        res.json({ success: true, data: messages });
    } catch (error) {
        console.error('Get Messages Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch messages' });
    }
});

// Delete (clear) chat session
router.delete('/sessions/:id', authenticateToken, async (req, res) => {
    try {
        const sessionId = req.params.id;
        const userId = req.user.id;

        // Verify session belongs to user
        const session = await query(
            'SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?',
            [sessionId, userId]
        );

        if (session.length === 0) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        // Delete session (messages will cascade)
        await query('DELETE FROM chat_sessions WHERE id = ?', [sessionId]);

        res.json({ success: true, message: 'Chat session cleared' });
    } catch (error) {
        console.error('Delete Session Error:', error);
        res.status(500).json({ success: false, message: 'Failed to clear chat session' });
    }
});

// Send message and get AI response
router.post('/message', authenticateToken, async (req, res) => {
    try {
        const { sessionId, content } = req.body;
        const userId = req.user.id;

        if (!sessionId || !content) {
            return res.status(400).json({ success: false, message: 'Session ID and content are required' });
        }

        // Verify session belongs to user
        const session = await query(
            'SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?',
            [sessionId, userId]
        );

        if (session.length === 0) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        // Save user message
        const userMessageId = uuidv4();
        await query(
            'INSERT INTO chat_messages (id, session_id, role, content) VALUES (?, ?, ?, ?)',
            [userMessageId, sessionId, 'user', content]
        );

        // Check if message is a complaint
        if (isComplaint(content)) {
            const complaintId = uuidv4();
            await query(
                'INSERT INTO complaints (id, user_id, source, chat_sessions_id, subject, message) VALUES (?, ?, ?, ?, ?, ?)',
                [complaintId, userId, 'chatbot', sessionId, generateSubject(content), content]
            );
        }

        // Get conversation history for context
        const history = await query(
            'SELECT role, content FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC LIMIT 20',
            [sessionId]
        );

        // Fetch User Context (Tournaments, etc) WITH MORE DETAILS
        // 1. Hosted Tournaments (Organizer)
        const hostedTournaments = await query(
            `SELECT name, type, status, 
                    current_participants, max_participants, 
                    DATE_FORMAT(start_date, '%d %M %Y') as start_date, 
                    DATE_FORMAT(end_date, '%d %M %Y') as end_date
             FROM tournaments 
             WHERE organizer_id = ? 
             ORDER BY 
                CASE 
                    WHEN status = 'active' THEN 1 
                    WHEN status = 'open' THEN 2 
                    WHEN status = 'draft' THEN 3 
                    ELSE 4 
                END, 
                created_at DESC`,
            [userId]
        );

        // 2. Joined as Team Manager (Participants)
        const joinedTeams = await query(
            `SELECT t.name as tournament_name, t.status as tournament_status, 
                    p.name as team_name, p.status as participation_status,
                    DATE_FORMAT(t.start_date, '%d %M %Y') as start_date
             FROM participants p 
             JOIN tournaments t ON p.tournament_id = t.id 
             WHERE p.user_id = ? 
             ORDER BY t.created_at DESC`,
            [userId]
        );

        // 3. Joined as Player (Players)
        const joinedPlayer = await query(
            `SELECT t.name as tournament_name, pl.team_name, pl.position, pl.jersey_number
             FROM players pl
             JOIN tournaments t ON pl.tournament_id = t.id
             WHERE pl.user_id = ?
             ORDER BY t.created_at DESC`,
            [userId]
        );

        // Fetch User Wallet & Subscription
        const wallet = await query('SELECT balance FROM wallets WHERE user_id = ?', [userId]);
        const subscription = await query(
            `SELECT sp.name as plan_name, us.status, DATE_FORMAT(us.end_date, '%d %M %Y') as end_date
             FROM user_subscriptions us
             JOIN subscription_plans sp ON us.plan_id = sp.id
             WHERE us.user_id = ? AND us.status = 'active'
             LIMIT 1`,
            [userId]
        );

        let contextString = `\n\n=== DATA KONTEKS PENGGUNA TERKINI ===\n`;
        contextString += `[PROFIL]\n`;
        contextString += `- User ID: ${userId}\n`;
        contextString += `- Paket: ${subscription?.[0] ? `${subscription[0].plan_name} (Berakhir: ${subscription[0].end_date})` : 'Free'}\n`;
        contextString += `- Saldo Koin: ${wallet?.[0] ? Number(wallet[0].balance).toLocaleString('id-ID') : 0}\n`;

        if (Array.isArray(hostedTournaments) && hostedTournaments.length > 0) {
            contextString += `\n[TURNAMEN YANG DIKELOLA (Organizer)]\n`;
            hostedTournaments.forEach((t, index) => {
                if (index < 10) { // Limit context size
                    contextString += `- ${t.name} (${t.type})\n`;
                    contextString += `  Status: ${t.status} | Peserta: ${t.current_participants}/${t.max_participants}\n`;
                    contextString += `  Jadwal: ${t.start_date || '?'} s/d ${t.end_date || '?'}\n`;
                }
            });
            if (hostedTournaments.length > 10) contextString += `...dan ${hostedTournaments.length - 10} turnamen lainnya.\n`;
        }

        if (Array.isArray(joinedTeams) && joinedTeams.length > 0) {
            contextString += `\n[TIM YANG DIKELOLA (Manager)]\n`;
            joinedTeams.forEach((t, index) => {
                if (index < 10) {
                    contextString += `- Tim "${t.team_name}" di turnamen "${t.tournament_name}"\n`;
                    contextString += `  Status Tim: ${t.participation_status} | Status Turnamen: ${t.tournament_status} | Mulai: ${t.start_date || '?'}\n`;
                }
            });
        }

        if (Array.isArray(joinedPlayer) && joinedPlayer.length > 0) {
            contextString += `\n[PARTISIPASI SEBAGAI PEMAIN]\n`;
            joinedPlayer.forEach((p, index) => {
                if (index < 10) {
                    contextString += `- Pemain di tim "${p.team_name}" (Turnamen: ${p.tournament_name})\n`;
                    contextString += `  Posisi: ${p.position} | Jersey: ${p.jersey_number}\n`;
                }
            });
        }
        contextString += `=====================================\n`;

        // Build messages array for OpenRouter
        const messages = [
            { role: 'system', content: SYSTEM_PROMPT + contextString },
            ...history.map(msg => ({ role: msg.role, content: msg.content }))
        ];

        // Call OpenRouter API
        const apiKey = process.env.VITE_OPENROUTER_API_KEY;
        const model = process.env.VITE_OPENROUTER_MODEL || 'google/gemini-2.5-flash-lite';

        const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://bikinliga.online',
                'X-Title': 'BikinLiga MinLiga Assistant'
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                max_tokens: 1024,
                temperature: 0.7
            })
        });

        if (!openRouterResponse.ok) {
            const errorText = await openRouterResponse.text();
            console.error('OpenRouter API Error:', errorText);
            throw new Error('Failed to get AI response');
        }

        const aiData = await openRouterResponse.json();
        const aiContent = aiData.choices?.[0]?.message?.content || 'Maaf, saya tidak bisa memproses permintaan Anda saat ini.';

        // Save AI response
        const aiMessageId = uuidv4();
        await query(
            'INSERT INTO chat_messages (id, session_id, role, content) VALUES (?, ?, ?, ?)',
            [aiMessageId, sessionId, 'assistant', aiContent]
        );

        // Update session title if it's the first real message
        if (history.length <= 2) {
            const newTitle = content.slice(0, 50) + (content.length > 50 ? '...' : '');
            await query('UPDATE chat_sessions SET title = ? WHERE id = ?', [newTitle, sessionId]);
        }

        // Update session timestamp
        await query('UPDATE chat_sessions SET updated_at = NOW() WHERE id = ?', [sessionId]);

        // Log Activity
        await logActivity(userId, 'Ask AI', 'User asked a question to AI Assistant', sessionId, 'chat_session');

        res.json({
            success: true,
            data: {
                userMessage: {
                    id: userMessageId,
                    role: 'user',
                    content: content,
                    created_at: new Date()
                },
                aiMessage: {
                    id: aiMessageId,
                    role: 'assistant',
                    content: aiContent,
                    created_at: new Date()
                }
            }
        });
    } catch (error) {
        console.error('Send Message Error:', error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
});

export default router;
