import express from 'express';
import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware as authenticateToken } from '../middleware/auth.js';

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
        const [hostedTournaments] = await query(
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
        const [joinedTeams] = await query(
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
        const [joinedPlayer] = await query(
            `SELECT t.name as tournament_name, pl.team_name, pl.position, pl.jersey_number
             FROM players pl
             JOIN tournaments t ON pl.tournament_id = t.id
             WHERE pl.user_id = ?
             ORDER BY t.created_at DESC`,
            [userId]
        );

        // Fetch User Wallet & Subscription
        const [wallet] = await query('SELECT balance FROM wallets WHERE user_id = ?', [userId]);
        const [subscription] = await query(
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
        contextString += `- Paket: ${subscription ? `${subscription.plan_name} (Berakhir: ${subscription.end_date})` : 'Free'}\n`;
        contextString += `- Saldo Koin: ${wallet ? Number(wallet.balance).toLocaleString('id-ID') : 0}\n`;

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
        const userContentWithContext = `INFO KONTEKS SYSTEM (Hidden from user):\n${contextString}\n\nPERTANYAAN USER:\n${content}`;

        // Instead of modifying system prompt which is static, we can prepend context to the latest user message 
        // OR append to system prompt. Appending to system prompt is cleaner contextually.

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

// Analyze tournament and provide AI insights
router.post('/analyze', authenticateToken, async (req, res) => {
    try {
        const { tournamentId, message, sessionId } = req.body;
        const userId = req.user.id;

        if (!tournamentId || !message) {
            return res.status(400).json({ success: false, message: 'Tournament ID and message are required' });
        }

        // 1. Check Subscription Plan
        const [subscription] = await query(
            `SELECT sp.name as plan_name, us.status, sp.id as plan_id
             FROM user_subscriptions us
             JOIN subscription_plans sp ON us.plan_id = sp.id
             WHERE us.user_id = ? AND us.status = 'active'
             LIMIT 1`,
            [userId]
        );

        const planName = subscription ? subscription.plan_name.toLowerCase() : 'free';

        // Subscription Logic
        if (planName === 'free') {
            return res.status(403).json({
                success: false,
                code: 'PLAN_FREE',
                message: 'Fitur ini hanya tersedia untuk member. Silakan upgrade paket Anda.'
            });
        }

        if (planName.includes('captain')) { // Assuming 'Captain' or 'captain'
            // Check daily limit (2 per day)
            const [dailyUsage] = await query(
                `SELECT COUNT(*) as count 
                 FROM chat_messages cm
                 JOIN chat_sessions cs ON cm.session_id = cs.id
                 WHERE cs.user_id = ? 
                 AND cm.role = 'user' 
                 AND cs.title LIKE 'Analysis:%'
                 AND DATE(cm.created_at) = CURDATE()`,
                [userId]
            );

            if (dailyUsage.count >= 2) {
                return res.status(403).json({
                    success: false,
                    code: 'LIMIT_REACHED',
                    message: 'Kuota harian Anda habis. Upgrade ke Pro League untuk akses unlimited.'
                });
            }
        }

        // Pro League is unlimited, continue...

        // 2. Handle Session
        let activeSessionId = sessionId;
        if (!activeSessionId) {
            // Check if there is an existing session for this tournament today
            const [existingSession] = await query(
                `SELECT id FROM chat_sessions 
                 WHERE user_id = ? AND title = ? 
                 ORDER BY updated_at DESC LIMIT 1`,
                [userId, `Analysis: Tournament #${tournamentId}`]
            );

            if (existingSession) {
                activeSessionId = existingSession.id;
            } else {
                // Create new session
                activeSessionId = uuidv4();
                await query(
                    'INSERT INTO chat_sessions (id, user_id, title) VALUES (?, ?, ?)',
                    [activeSessionId, userId, `Analysis: Tournament #${tournamentId}`]
                );
            }
        }

        // 3. Gather Tournament Context
        // Basic Info
        const tournamentsList = await query('SELECT * FROM tournaments WHERE id = ? OR slug = ?', [tournamentId, tournamentId]);
        const tournament = tournamentsList[0];

        if (!tournament) {
            console.error(`Tournament not found: ${tournamentId}`);
            throw new Error('Tournament not found');
        }

        const realTournamentId = tournament.id;

        // Standings (Points, Win Rate, etc)
        const standings = await query(
            `SELECT * FROM standings WHERE tournament_id = ? ORDER BY points DESC, goal_difference DESC LIMIT 10`,
            [realTournamentId]
        );

        // Completed Matches
        const matches = await query(
            `SELECT * FROM matches 
             WHERE tournament_id = ? AND (status = 'completed' OR status = 'finished')
             ORDER BY start_time DESC LIMIT 20`,
            [realTournamentId]
        );

        // Top Scorers
        const topScorers = await query(
            `SELECT 
                me.player_name,
                p.name as team_name, 
                COUNT(me.id) as goals
             FROM match_events me
             LEFT JOIN participants p ON me.participant_id = p.id
             WHERE me.tournament_id = ? 
               AND me.type IN ('goal', 'penalty_goal')
             GROUP BY me.player_name, me.participant_id
             ORDER BY goals DESC
             LIMIT 5`,
            [realTournamentId]
        );

        // Format Context for AI
        let contextData = `DATA TURNAMEN: ${tournament.name}\n`;
        contextData += `Tipe: ${tournament.type}, Format: ${tournament.match_format}\n\n`;

        contextData += `KLASEMEN (Top 10):\n`;
        standings.forEach((s, i) => {
            contextData += `${i + 1}. ${s.team_name || s.player_name}: ${s.points} Poin, Main: ${s.played}, Menang: ${s.won}, Seri: ${s.drawn}, Kalah: ${s.lost}, Gol: ${s.goals_for}:${s.goals_against}\n`;
        });

        contextData += `\nPERTANDINGAN TERAKHIR:\n`;
        matches.forEach(m => {
            const home = m.home_team_name || m.home_player_name;
            const away = m.away_team_name || m.away_player_name;
            contextData += `- ${home} ${m.home_score} vs ${m.away_score} ${away}\n`;
        });

        contextData += `\nTOP SCORERS:\n`;
        topScorers.forEach((p, i) => {
            contextData += `${i + 1}. ${p.player_name} (${p.team_name}) - ${p.goals} Gol\n`;
        });

        const ANALYSIS_SYSTEM_PROMPT = `Anda adalah AI Analis Turnamen Sepak Bola/Futsal Profesional. 
Tugas Anda adalah memberikan analisis mendalam, prediksi, dan insight tactical berdasarkan data statistik yang diberikan.
Gunakan gaya bahasa komentator atau analis olahraga profesional (seperti Bung Binder atau Coach Justin) namun tetap sopan dan membantu.
Jawablah pertanyaan user berdasarkan data di atas. Jika data tidak cukup, berikan asumsi logis berdasarkan tren performa (menang/kalah).`;

        // 4. Send to AI
        // Get conversation history
        const history = await query(
            'SELECT role, content FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC LIMIT 10',
            [activeSessionId]
        );

        const messages = [
            { role: 'system', content: ANALYSIS_SYSTEM_PROMPT + '\n\n' + contextData },
            ...history.map(msg => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: message }
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
                'X-Title': 'Tourney Analyst'
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                max_tokens: 1024,
                temperature: 0.7
            })
        });

        if (!openRouterResponse.ok) {
            const err = await openRouterResponse.text();
            console.error("AI Error", err);
            throw new Error('AI Service Unavailable');
        }

        const aiData = await openRouterResponse.json();
        const aiContent = aiData.choices?.[0]?.message?.content || 'Maaf, analisis tidak tersedia.';

        // 5. Save Messages
        const userMsgId = uuidv4();
        await query(
            'INSERT INTO chat_messages (id, session_id, role, content) VALUES (?, ?, ?, ?)',
            [userMsgId, activeSessionId, 'user', message]
        );

        const aiMsgId = uuidv4();
        await query(
            'INSERT INTO chat_messages (id, session_id, role, content) VALUES (?, ?, ?, ?)',
            [aiMsgId, activeSessionId, 'assistant', aiContent]
        );

        res.json({
            success: true,
            sessionId: activeSessionId,
            data: {
                id: aiMsgId,
                role: 'assistant',
                content: aiContent,
                created_at: new Date()
            }
        });

    } catch (error) {
        console.error('Analyze Error:', error);
        res.status(500).json({ success: false, message: `Gagal melakukan analisis: ${error.message}` });
    }
});
