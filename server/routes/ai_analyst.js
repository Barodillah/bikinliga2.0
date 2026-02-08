import express from 'express';
import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware as authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Analyze tournament and provide AI insights
router.post('/analyze', authenticateToken, async (req, res) => {
    try {
        const { tournamentId, message, sessionId } = req.body;
        const userId = req.user.id;

        if (!tournamentId || !message) {
            return res.status(400).json({ success: false, message: 'Tournament ID and message are required' });
        }

        // 1. Check Subscription Plan
        const subscription = await query(
            `SELECT sp.name as plan_name, us.status, sp.id as plan_id
             FROM user_subscriptions us
             JOIN subscription_plans sp ON us.plan_id = sp.id
             WHERE us.user_id = ? AND us.status = 'active'
             LIMIT 1`,
            [userId]
        );

        const planName = subscription?.[0] ? subscription[0].plan_name.toLowerCase() : 'free';

        // Subscription Logic
        if (planName === 'free') {
            return res.status(403).json({
                success: false,
                code: 'PLAN_FREE',
                message: 'Fitur ini hanya tersedia untuk member. Silakan upgrade paket Anda.'
            });
        }

        if (planName.includes('captain')) {
            // Check daily limit (2 per day)
            const dailyUsage = await query(
                `SELECT COUNT(*) as count 
                 FROM chat_messages cm
                 JOIN chat_sessions cs ON cm.session_id = cs.id
                 WHERE cs.user_id = ? 
                 AND cm.role = 'user' 
                 AND cs.title LIKE 'Analysis:%'
                 AND DATE(cm.created_at) = CURDATE()`,
                [userId]
            );

            if (dailyUsage?.[0]?.count >= 2) {
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
            const existingSession = await query(
                `SELECT id FROM chat_sessions 
                 WHERE user_id = ? AND title = ? 
                 ORDER BY updated_at DESC LIMIT 1`,
                [userId, `Analysis: Tournament #${tournamentId}`]
            );

            if (existingSession?.[0]) {
                activeSessionId = existingSession[0].id;
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
        const tournamentsList = await query('SELECT * FROM tournaments WHERE id = ? OR slug = ?', [tournamentId, tournamentId]);
        const tournament = tournamentsList?.[0];

        if (!tournament) {
            console.error(`Tournament not found: ${tournamentId}`);
            throw new Error('Tournament not found');
        }

        const realTournamentId = tournament.id;

        // Fetch User's Own Team in this tournament
        const userTeam = await query(
            `SELECT p.*, u.username 
             FROM participants p 
             LEFT JOIN users u ON p.user_id = u.id
             WHERE p.tournament_id = ? AND p.user_id = ?`,
            [realTournamentId, userId]
        );

        // Standings with Names
        const standings = await query(
            `SELECT s.*, p.name as player_name, p.team_name, p.logo_url
             FROM standings s 
             JOIN participants p ON s.participant_id = p.id
             WHERE s.tournament_id = ? 
             ORDER BY s.points DESC, s.goal_difference DESC, s.goals_for DESC 
             LIMIT 20`,
            [realTournamentId]
        );

        // Completed Matches with Names
        const matches = await query(
            `SELECT m.*, 
                p1.name as home_player_name, p1.team_name as home_team_name,
                p2.name as away_player_name, p2.team_name as away_team_name
             FROM matches m 
             LEFT JOIN participants p1 ON m.home_participant_id = p1.id
             LEFT JOIN participants p2 ON m.away_participant_id = p2.id
             WHERE m.tournament_id = ? AND (m.status = 'completed' OR m.status = 'finished')
             ORDER BY m.round DESC, m.updated_at DESC LIMIT 20`,
            [realTournamentId]
        );

        // Top Scorers
        const topScorers = await query(
            `SELECT 
                me.player_name,
                p.name as p_name, 
                p.team_name as p_team_name,
                COUNT(me.id) as goals
             FROM match_events me
             LEFT JOIN participants p ON me.participant_id = p.id
             WHERE me.tournament_id = ? 
               AND me.type IN ('goal', 'penalty_goal')
             GROUP BY me.player_name, me.participant_id
             ORDER BY goals DESC
             LIMIT 10`,
            [realTournamentId]
        );

        // Fetch Prizes
        const prizeSettings = await query(
            `SELECT * FROM tournament_prizes WHERE tournament_id = ?`,
            [realTournamentId]
        );

        let recipients = [];
        if (prizeSettings?.[0]) {
            recipients = await query(
                `SELECT * FROM prize_recipients WHERE tournament_prize_id = ? ORDER BY order_index ASC`,
                [prizeSettings[0].id]
            );
        }

        // Format Context for AI
        let contextData = `=== INFORMASI TURNAMEN ===\n`;
        contextData += `Nama Turnamen: ${tournament.name}\n`;
        contextData += `Tipe: ${tournament.type}, Format: ${tournament.match_format}\n`;
        contextData += `Status: ${tournament.status}\n\n`;

        if (userTeam?.[0]) {
            const ut = userTeam[0];
            contextData += `=== TIM ANDA (USER YANG BERTANYA) ===\n`;
            contextData += `- Nama Tim: ${ut.team_name || ut.name}\n`;
            contextData += `- Pemain/Manager: ${ut.name} (@${ut.username || 'user'})\n`;
            contextData += `- Status Partisipasi: ${ut.status}\n\n`;
        }

        contextData += `=== KLASEMEN SAAT INI ===\n`;
        if (standings.length > 0) {
            standings.forEach((s, i) => {
                const name = s.team_name || s.player_name || 'Tim Tanpa Nama';
                contextData += `${i + 1}. ${name}: ${s.points} Poin (Main: ${s.played}, M:${s.won}, S:${s.drawn}, K:${s.lost}, Gol:${s.goals_for}-${s.goals_against}, Selisih:${s.goal_difference})\n`;
            });
        } else {
            contextData += `(Belum ada data klasemen)\n`;
        }

        contextData += `\n=== HASIL PERTANDINGAN TERAKHIR ===\n`;
        if (matches.length > 0) {
            matches.forEach(m => {
                const home = m.home_team_name || m.home_player_name || 'Home';
                const away = m.away_team_name || m.away_player_name || 'Away';
                contextData += `- [Round ${m.round}] ${home} ${m.home_score} vs ${m.away_score} ${away} (${m.status})\n`;
            });
        } else {
            contextData += `(Belum ada hasil pertandingan)\n`;
        }

        contextData += `\n=== TOP SCORERS ===\n`;
        if (topScorers.length > 0) {
            topScorers.forEach((p, i) => {
                const team = p.p_team_name || p.p_name || 'Unknown';
                contextData += `${i + 1}. ${p.player_name} (${team}) - ${p.goals} Gol\n`;
            });
        } else {
            contextData += `(Belum ada data pencetak gol)\n`;
        }

        if (prizeSettings?.[0]?.is_enabled) {
            contextData += `\n=== HADIAH & HADIAH POOL ===\n`;
            contextData += `- Total Hadiah: ${Number(prizeSettings[0].total_pool).toLocaleString('id-ID')} Koin\n`;
            recipients.forEach(r => {
                contextData += `- ${r.title}: ${Number(r.amount).toLocaleString('id-ID')} (${r.percentage}%)\n`;
            });
        }

        const ANALYSIS_SYSTEM_PROMPT = `Anda adalah AI Analis Turnamen Sepak Bola/Futsal Profesional. 
Tugas Anda adalah memberikan analisis mendalam, prediksi, dan insight tactical berdasarkan data statistik yang diberikan.
Gunakan gaya bahasa komentator atau analis olahraga profesional (seperti Bung Binder atau Coach Justin) namun tetap sopan dan membantu.
Jawablah pertanyaan user berdasarkan data di atas. Jika data tidak cukup, berikan asumsi logis berdasarkan tren performa (menang/kalah).`;

        // 4. Send to AI
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

export default router;
