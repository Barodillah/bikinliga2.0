import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import tournamentRoutes from './routes/tournament.js';
import teamsRoutes from './routes/teams.js';
import matchesRoutes from './routes/matches.js';
import externalRoutes from './routes/external.js';
import dashboardRoutes from './routes/dashboard.js';
import adminRoutes from './routes/admin.js';
import rankingsRoutes from './routes/rankings.js';
import communityRoutes from './routes/communities.js';
import postRoutes from './routes/posts.js';
import minligaAIRoutes from './routes/ai_minliga.js';
import analystAIRoutes from './routes/ai_analyst.js';
import complaintsRoutes from './routes/complaints.js';
import metaRoutes from './routes/meta.js';
import achievementsRoutes from './routes/achievements.js';
import adminAIRouter from './routes/adminAI.js';
import notificationRoutes from './routes/notifications.js';
import { initDatabase } from './config/db.js';

const app = express();
const PORT = process.env.PORT || 3001;
// Trigger reload 1

// Middleware
app.use(cors({
    origin: true, // Allow all origins for dev network access
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Meta routes for social media crawlers (must be before API routes)
app.use('/', metaRoutes);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/external', externalRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/ai', adminAIRouter);
app.use('/api/rankings', rankingsRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/ai/minliga', minligaAIRoutes);
app.use('/api/ai/analyst', analystAIRoutes);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

// Initialize database
initDatabase().then(() => {
    console.log('✅ Database connected');
}).catch(error => {
    console.error('❌ Failed to connect to database:', error);
});

// Export app for Vercel
export default app;

// Start server if run directly
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const PORT = process.env.PORT || 3001;
    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`➜  Network: http://${process.env.HOST_IP || '0.0.0.0'}:${PORT}/`);
    });

    server.on('error', (e) => {
        if (e.code === 'EADDRINUSE') {
            console.error('❌ Port ' + PORT + ' is already in use!');
        } else {
            console.error('❌ Server error:', e);
        }
    });
}
