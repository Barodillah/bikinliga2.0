import express from 'express';
import { query } from '../config/db.js';
import dotenv from 'dotenv';
// Import Auth Middleware
import { authMiddleware } from '../middleware/auth.js';

dotenv.config();

const router = express.Router();

// Apply Auth Middleware to all routes
router.use(authMiddleware);

// Helper to get system stats for context
const getSystemStats = async () => {
    const statsQuery = `
        SELECT 
            (SELECT COUNT(*) FROM users) as total_users,
            (SELECT COUNT(*) FROM complaints WHERE status IN ('open', 'in_progress')) as active_complaints,
            (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'topup' AND status = 'success') as total_revenue,
            (SELECT COUNT(*) FROM tournaments) as total_tournaments
    `;
    const [stats] = await query(statsQuery);
    return stats;
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
                // Session ID provided but not found? Treat as new or error. Let's create new.
                currentSessionId = null;
            }
        }

        if (!currentSessionId) {
            // Create new session
            // Using UUID for ID generation in SQL if possible, or selecting after. 
            // Better to use UUID library but I'll stick to SQL UUID() and fetch content.
            // Actually, let's use a simpler approach: 
            // Generate UUID in JS (if I had uuid lib imported, looking at ai_minliga.js it does)
            // But since I don't want to add imports if not needed, I will do the INSERT then SELECT.

            await query(
                'INSERT INTO chat_sessions (id, user_id, title) VALUES (UUID(), ?, ?)',
                [userId, 'New Chat']
            );
            const [newSession] = await query('SELECT id FROM chat_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [userId]);
            currentSessionId = newSession.id;
        }

        // 2. Prepare Context
        const systemStats = await getSystemStats();
        const systemPrompt = `
            You are an AI Assistant for the Admin of "BikinLiga", a tournament management platform.
            
            Current System Stats:
            - Users: ${systemStats.total_users}
            - Active Complaints: ${systemStats.active_complaints}
            - Revenue: Rp ${Number(systemStats.total_revenue).toLocaleString('id-ID')}
            - Tournaments: ${systemStats.total_tournaments}
            
            Answer the admin's questions based on this data. Be helpful, concise, and professional.
            If asked about data not here, explain you only have access to high-level stats currently.
            Response format: Markdown.
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
            aiResponseText = `[MOCK AI] (No API Key) Saya melihat ada ${systemStats.total_users} user.`;
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
                    max_tokens: 1024,
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
        // Insert User Message
        await query('INSERT INTO chat_messages (id, session_id, role, content) VALUES (UUID(), ?, ?, ?)', [currentSessionId, 'user', message]);
        // Insert AI Message
        await query('INSERT INTO chat_messages (id, session_id, role, content) VALUES (UUID(), ?, ?, ?)', [currentSessionId, 'assistant', aiResponseText]);

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
        res.status(500).json({ success: false, message: 'Failed to process AI request' });
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
