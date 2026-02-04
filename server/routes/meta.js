import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Debug logging for meta routes
console.log('✅ Meta routes loaded');

// Base URL for production
const BASE_URL = process.env.BASE_URL || process.env.VITE_BASE_URL || 'https://bikinliga.online';
const DEFAULT_IMAGE = `${BASE_URL}/favicon.png`;
const SITE_NAME = 'BikinLiga';

// Social media crawler User-Agent patterns
const CRAWLER_USER_AGENTS = [
    'facebookexternalhit',
    'Facebot',
    'Twitterbot',
    'WhatsApp',
    'TelegramBot',
    'LinkedInBot',
    'Slackbot',
    'Discordbot',
    'Pinterest',
    'Googlebot',
    'bingbot',
    'Yahoo! Slurp',
    'DuckDuckBot'
];

/**
 * Check if request is from social media crawler
 */
function isCrawler(userAgent) {
    if (!userAgent) return false;
    return CRAWLER_USER_AGENTS.some(bot => userAgent.toLowerCase().includes(bot.toLowerCase()));
}

/**
 * Generate HTML with Open Graph meta tags
 */
function generateMetaHTML({ title, description, image, url, type = 'website' }) {
    const safeTitle = escapeHtml(title || SITE_NAME);
    const safeDesc = escapeHtml(description || 'Platform Turnamen eFootball Terbaik');
    const safeImage = image || DEFAULT_IMAGE;
    const safeUrl = url || BASE_URL;

    return `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDesc}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="${type}">
    <meta property="og:url" content="${safeUrl}">
    <meta property="og:title" content="${safeTitle}">
    <meta property="og:description" content="${safeDesc}">
    <meta property="og:image" content="${safeImage}">
    <meta property="og:site_name" content="${SITE_NAME}">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${safeUrl}">
    <meta name="twitter:title" content="${safeTitle}">
    <meta name="twitter:description" content="${safeDesc}">
    <meta name="twitter:image" content="${safeImage}">
    
    <!-- Redirect to SPA for non-crawlers -->
    <script>
        if (!/facebookexternalhit|Twitterbot|WhatsApp|TelegramBot|LinkedInBot|Slackbot|Discordbot/i.test(navigator.userAgent)) {
            window.location.href = '${safeUrl}';
        }
    </script>
</head>
<body>
    <h1>${safeTitle}</h1>
    <p>${safeDesc}</p>
    <img src="${safeImage}" alt="${safeTitle}">
    <a href="${safeUrl}">Lihat di ${SITE_NAME}</a>
</body>
</html>`;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ============================================
// TOURNAMENT META TAGS: /t/:slug
// ============================================
router.get('/t/:slug', async (req, res, next) => {
    const userAgent = req.get('User-Agent');

    // If not a crawler, pass to next handler (Vite/SPA)
    if (!isCrawler(userAgent)) {
        return next();
    }

    try {
        const { slug } = req.params;
        const [tournaments] = await pool.query(
            `SELECT t.name, t.description, t.logo_url, t.slug,
                    u.name as organizer_name
             FROM tournaments t
             LEFT JOIN users u ON t.organizer_id = u.id
             WHERE t.slug = ? OR t.id = ?`,
            [slug, slug]
        );

        if (tournaments.length === 0) {
            return res.status(404).send(generateMetaHTML({
                title: 'Turnamen Tidak Ditemukan - BikinLiga',
                description: 'Turnamen yang kamu cari tidak ditemukan.',
                url: `${BASE_URL}/t/${slug}`
            }));
        }

        const t = tournaments[0];
        const html = generateMetaHTML({
            title: `${t.name} - BikinLiga`,
            description: t.description || `Turnamen ${t.name} diselenggarakan oleh ${t.organizer_name || 'BikinLiga'}. Ikuti sekarang!`,
            image: t.logo_url || DEFAULT_IMAGE,
            url: `${BASE_URL}/t/${t.slug}`,
            type: 'article'
        });

        res.send(html);
    } catch (error) {
        console.error('Meta tournament error:', error);
        next();
    }
});

// ============================================
// MATCH META TAGS: /t/:slug/match/:matchId
// ============================================
router.get('/t/:slug/match/:matchId', async (req, res, next) => {
    const userAgent = req.get('User-Agent');

    if (!isCrawler(userAgent)) {
        return next();
    }

    try {
        const { slug, matchId } = req.params;
        const [matches] = await pool.query(
            `SELECT m.*, t.name as tournament_name, t.logo_url as tournament_logo, t.slug as tournament_slug,
                    COALESCE(hp.team_name, hu.name) as home_name,
                    COALESCE(ap.team_name, au.name) as away_name
             FROM matches m
             JOIN tournaments t ON m.tournament_id = t.id
             LEFT JOIN participants hp ON m.home_participant_id = hp.id
             LEFT JOIN users hu ON hp.user_id = hu.id
             LEFT JOIN participants ap ON m.away_participant_id = ap.id
             LEFT JOIN users au ON ap.user_id = au.id
             WHERE m.id = ? AND (t.slug = ? OR t.id = ?)`,
            [matchId, slug, slug]
        );

        if (matches.length === 0) {
            return res.status(404).send(generateMetaHTML({
                title: 'Pertandingan Tidak Ditemukan - BikinLiga',
                description: 'Pertandingan yang kamu cari tidak ditemukan.',
                url: `${BASE_URL}/t/${slug}/match/${matchId}`
            }));
        }

        const m = matches[0];
        const scoreText = m.status === 'completed' || m.status === 'finished'
            ? `${m.home_score} - ${m.away_score}`
            : 'VS';

        const html = generateMetaHTML({
            title: `${m.home_name} ${scoreText} ${m.away_name} | ${m.tournament_name}`,
            description: `Pertandingan ${m.home_name} melawan ${m.away_name} di turnamen ${m.tournament_name}. Lihat detail dan statistik pertandingan!`,
            image: m.tournament_logo || DEFAULT_IMAGE,
            url: `${BASE_URL}/t/${m.tournament_slug}/match/${matchId}`,
            type: 'article'
        });

        res.send(html);
    } catch (error) {
        console.error('Meta match error:', error);
        next();
    }
});

// ============================================
// COMMUNITY META TAGS: /c/:id
// ============================================
router.get('/c/:id', async (req, res, next) => {
    const userAgent = req.get('User-Agent');

    if (!isCrawler(userAgent)) {
        return next();
    }

    try {
        const { id } = req.params;
        const [communities] = await pool.query(
            `SELECT c.*, u.name as creator_name,
                    (SELECT COUNT(*) FROM community_members WHERE community_id = c.id AND status = 'active') as member_count
             FROM communities c
             LEFT JOIN users u ON c.creator_id = u.id
             WHERE c.id = ?`,
            [id]
        );

        if (communities.length === 0) {
            return res.status(404).send(generateMetaHTML({
                title: 'Komunitas Tidak Ditemukan - BikinLiga',
                description: 'Komunitas yang kamu cari tidak ditemukan.',
                url: `${BASE_URL}/c/${id}`
            }));
        }

        const c = communities[0];
        const html = generateMetaHTML({
            title: `${c.name} - Komunitas BikinLiga`,
            description: c.description || `Bergabunglah dengan komunitas ${c.name}! ${c.member_count || 0} anggota aktif.`,
            image: c.icon_url || c.banner_url || DEFAULT_IMAGE,
            url: `${BASE_URL}/c/${id}`,
            type: 'profile'
        });

        res.send(html);
    } catch (error) {
        console.error('Meta community error:', error);
        next();
    }
});

// ============================================
// POST META TAGS: /post/:id
// ============================================
router.get('/post/:id', async (req, res, next) => {
    const userAgent = req.get('User-Agent');

    if (!isCrawler(userAgent)) {
        return next();
    }

    try {
        const { id } = req.params;
        const [posts] = await pool.query(
            `SELECT p.*, u.name as user_name, u.avatar_url as user_avatar
             FROM posts p
             LEFT JOIN users u ON p.user_id = u.id
             WHERE p.id = ?`,
            [id]
        );

        if (posts.length === 0) {
            return res.status(404).send(generateMetaHTML({
                title: 'Postingan Tidak Ditemukan - BikinLiga',
                description: 'Postingan yang kamu cari tidak ditemukan.',
                url: `${BASE_URL}/post/${id}`
            }));
        }

        const p = posts[0];
        // Truncate content for description
        const contentPreview = p.content ? p.content.substring(0, 160) + (p.content.length > 160 ? '...' : '') : '';

        const html = generateMetaHTML({
            title: `${p.user_name} di BikinLiga`,
            description: contentPreview || `Lihat postingan dari ${p.user_name} di BikinLiga!`,
            image: p.image_url || p.user_avatar || DEFAULT_IMAGE,
            url: `${BASE_URL}/post/${id}`,
            type: 'article'
        });

        res.send(html);
    } catch (error) {
        console.error('Meta post error:', error);
        next();
    }
});

export default router;
