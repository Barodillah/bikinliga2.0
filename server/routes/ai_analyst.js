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

        // Fetch ALL participants
        const participants = await query(
            `SELECT id, name, team_name, logo_url FROM participants WHERE tournament_id = ? AND status = 'approved'`,
            [realTournamentId]
        );

        // Fetch ALL matches (completed + scheduled) for accurate standings & chance calculation
        const allMatches = await query(
            `SELECT m.*, 
                p1.name as home_player_name, p1.team_name as home_team_name,
                p2.name as away_player_name, p2.team_name as away_team_name
             FROM matches m 
             LEFT JOIN participants p1 ON m.home_participant_id = p1.id
             LEFT JOIN participants p2 ON m.away_participant_id = p2.id
             WHERE m.tournament_id = ?
             ORDER BY m.round ASC, m.created_at ASC`,
            [realTournamentId]
        );

        // Compute LIVE standings from matches (not from stale standings table)
        const teamStats = {};
        participants.forEach(p => {
            teamStats[p.id] = {
                id: p.id,
                name: p.team_name || p.name,
                played: 0, won: 0, drawn: 0, lost: 0,
                goalsFor: 0, goalsAgainst: 0, points: 0
            };
        });

        const totalMatchesPerTeam = {};
        allMatches.forEach(match => {
            // Count total assigned matches
            if (match.home_participant_id) totalMatchesPerTeam[match.home_participant_id] = (totalMatchesPerTeam[match.home_participant_id] || 0) + 1;
            if (match.away_participant_id) totalMatchesPerTeam[match.away_participant_id] = (totalMatchesPerTeam[match.away_participant_id] || 0) + 1;

            // Only count completed matches for standings
            if (match.status === 'completed' || match.status === 'finished') {
                const hs = parseInt(match.home_score) || 0;
                const as = parseInt(match.away_score) || 0;

                if (teamStats[match.home_participant_id]) {
                    const t = teamStats[match.home_participant_id];
                    t.played++; t.goalsFor += hs; t.goalsAgainst += as;
                    if (hs > as) { t.won++; t.points += 3; }
                    else if (hs === as) { t.drawn++; t.points += 1; }
                    else { t.lost++; }
                }
                if (teamStats[match.away_participant_id]) {
                    const t = teamStats[match.away_participant_id];
                    t.played++; t.goalsFor += as; t.goalsAgainst += hs;
                    if (as > hs) { t.won++; t.points += 3; }
                    else if (as === hs) { t.drawn++; t.points += 1; }
                    else { t.lost++; }
                }
            }
        });

        const totalTeams = participants.length;
        const computedStandings = Object.values(teamStats)
            .map(t => {
                const gd = t.goalsFor - t.goalsAgainst;
                const allM = totalMatchesPerTeam[t.id] || 0;
                const remaining = allM - t.played;
                const maxPoin = t.points + (remaining * 3);
                const maxPoinLiga = totalTeams > 1 ? ((totalTeams - 1) * 2) * 3 : 1;
                const chance = Math.min(100, Math.max(0, (maxPoin / maxPoinLiga) * 100));
                return { ...t, goalDifference: gd, remaining, chance: parseFloat(chance.toFixed(2)) };
            })
            .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor);

        // Special case: rank 1 is mathematically champion
        if (tournament.type === 'league' && computedStandings.length >= 2) {
            const first = computedStandings[0];
            const second = computedStandings[1];
            const secondMaxPoin = second.points + (second.remaining * 3);
            if (secondMaxPoin < first.points) {
                first.chance = 100;
            }
        }

        // Recent completed matches for context
        const completedMatches = allMatches
            .filter(m => m.status === 'completed' || m.status === 'finished')
            .sort((a, b) => b.round - a.round || new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, 20);

        // Upcoming scheduled matches
        const scheduledMatches = allMatches
            .filter(m => m.status === 'scheduled')
            .slice(0, 10);

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
        contextData += `Status: ${tournament.status}\n`;
        contextData += `Total Tim: ${totalTeams}\n\n`;

        if (userTeam?.[0]) {
            const ut = userTeam[0];
            contextData += `=== TIM ANDA (USER YANG BERTANYA) ===\n`;
            contextData += `- Nama Tim: ${ut.team_name || ut.name}\n`;
            contextData += `- Pemain/Manager: ${ut.name} (@${ut.username || 'user'})\n`;
            contextData += `- Status Partisipasi: ${ut.status}\n\n`;
        }

        contextData += `=== KLASEMEN SAAT INI (LIVE / TERBARU) ===\n`;
        if (computedStandings.length > 0) {
            computedStandings.forEach((s, i) => {
                contextData += `${i + 1}. ${s.name}: ${s.points} Poin (Main: ${s.played}, M:${s.won}, S:${s.drawn}, K:${s.lost}, Gol:${s.goalsFor}-${s.goalsAgainst}, Selisih:${s.goalDifference}, Sisa Match:${s.remaining}, Peluang Juara:${s.chance}%)\n`;
            });
        } else {
            contextData += `(Belum ada data klasemen)\n`;
        }

        contextData += `\n=== HASIL PERTANDINGAN TERAKHIR ===\n`;
        if (completedMatches.length > 0) {
            completedMatches.forEach(m => {
                const home = m.home_team_name || m.home_player_name || 'Home';
                const away = m.away_team_name || m.away_player_name || 'Away';
                contextData += `- [Round ${m.round}] ${home} ${m.home_score} vs ${m.away_score} ${away} (${m.status})\n`;
            });
        } else {
            contextData += `(Belum ada hasil pertandingan)\n`;
        }

        if (scheduledMatches.length > 0) {
            contextData += `\n=== JADWAL PERTANDINGAN MENDATANG ===\n`;
            scheduledMatches.forEach(m => {
                const home = m.home_team_name || m.home_player_name || 'Home';
                const away = m.away_team_name || m.away_player_name || 'Away';
                contextData += `- [Round ${m.round}] ${home} vs ${away} (${m.status})\n`;
            });
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

PENTING:
- Data klasemen di bawah adalah data LIVE terbaru yang dihitung langsung dari hasil pertandingan, BUKAN data lama.
- Setiap tim memiliki "Peluang Juara" yang sudah dihitung berdasarkan poin saat ini + sisa pertandingan × 3, dibagi total poin maksimal liga. Gunakan angka ini saat user bertanya peluang/chance.
- Jika "Peluang Juara" = 100%, berarti tim sudah secara matematis menjadi juara (posisi kedua tidak bisa menyusul meskipun menang semua sisa match).
- Jawablah pertanyaan user berdasarkan data di atas. Jika data tidak cukup, berikan asumsi logis berdasarkan tren performa.`;

        // 4. Send to AI — always use LIVE data only, no chat history
        const messages = [
            { role: 'system', content: ANALYSIS_SYSTEM_PROMPT + '\n\n' + contextData },
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
