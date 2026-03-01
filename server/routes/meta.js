import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

console.log('✅ Meta routes loaded');

// Base URL for production
const BASE_URL = process.env.BASE_URL || process.env.VITE_BASE_URL || 'https://bikinliga.online';
const DEFAULT_IMAGE = `${BASE_URL}/favicon.png`;
const SITE_NAME = 'BikinLiga';

// Social media crawler User-Agent patterns
const CRAWLER_USER_AGENTS = [
    'facebookexternalhit', 'Facebot', 'Twitterbot', 'WhatsApp',
    'TelegramBot', 'LinkedInBot', 'Slackbot', 'Discordbot',
    'Pinterest', 'Googlebot', 'bingbot', 'Yahoo! Slurp', 'DuckDuckBot'
];

function isCrawler(userAgent) {
    if (!userAgent) return false;
    return CRAWLER_USER_AGENTS.some(bot => userAgent.toLowerCase().includes(bot.toLowerCase()));
}

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

/**
 * Generate OG meta tags string for injection
 */
function generateOGTags({ title, description, image, url, type = 'website', favicon }) {
    const safeTitle = escapeHtml(title || SITE_NAME);
    const safeDesc = escapeHtml(description || 'Platform Turnamen eFootball Terbaik');
    const safeImage = image || DEFAULT_IMAGE;
    const safeUrl = url || BASE_URL;
    const safeFavicon = favicon || '/favicon.png';

    return {
        safeTitle, safeDesc, safeImage, safeUrl, safeFavicon, type,
        metaTags: `
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDesc}">
    <link rel="icon" type="image/png" href="${safeFavicon}">
    <meta property="og:type" content="${type}">
    <meta property="og:url" content="${safeUrl}">
    <meta property="og:title" content="${safeTitle}">
    <meta property="og:description" content="${safeDesc}">
    <meta property="og:image" content="${safeImage}">
    <meta property="og:site_name" content="${SITE_NAME}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${safeUrl}">
    <meta name="twitter:title" content="${safeTitle}">
    <meta name="twitter:description" content="${safeDesc}">
    <meta name="twitter:image" content="${safeImage}">`
    };
}

/**
 * Cache for the base index.html from CDN
 */
let cachedIndexHtml = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getBaseIndexHtml() {
    const now = Date.now();
    if (cachedIndexHtml && (now - cacheTime) < CACHE_TTL) {
        return cachedIndexHtml;
    }
    try {
        // Fetch the SPA index.html from the root (served by Vercel CDN)
        // Use _next_bypass query param to avoid going through our own rewrites
        const response = await fetch(`${BASE_URL}/?_vercel_no_cache=1`, {
            headers: { 'User-Agent': 'BikinLiga-MetaBot/1.0' }
        });
        if (response.ok) {
            cachedIndexHtml = await response.text();
            cacheTime = now;
            return cachedIndexHtml;
        }
    } catch (err) {
        console.error('Failed to fetch base index.html:', err.message);
    }
    return null;
}

/**
 * Inject dynamic OG tags into the base index.html
 * Replaces the default <title>, description, OG, Twitter, and favicon tags
 */
function injectMetaTags(baseHtml, ogData) {
    let html = baseHtml;

    // Replace title
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${ogData.safeTitle}</title>`);

    // Replace meta description
    html = html.replace(
        /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
        `<meta name="description" content="${ogData.safeDesc}">`
    );

    // Replace favicon
    html = html.replace(
        /<link\s+rel="icon"\s+type="image\/png"\s+href="[^"]*"\s*\/?>/,
        `<link rel="icon" type="image/png" href="${ogData.safeFavicon}">`
    );

    // Replace OG tags
    html = html.replace(/(<meta\s+property="og:type"\s+content=")[^"]*(")/, `$1${ogData.type}$2`);
    html = html.replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/, `$1${ogData.safeUrl}$2`);
    html = html.replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/, `$1${ogData.safeTitle}$2`);
    html = html.replace(/(<meta\s+property="og:description"\s+content=")[^"]*("[\s>])/, `$1${ogData.safeDesc}$2`);
    html = html.replace(/(<meta\s+property="og:image"\s+content=")[^"]*(")/, `$1${ogData.safeImage}$2`);

    // Replace Twitter tags
    html = html.replace(/(<meta\s+name="twitter:url"\s+content=")[^"]*(")/, `$1${ogData.safeUrl}$2`);
    html = html.replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/, `$1${ogData.safeTitle}$2`);
    html = html.replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*("[\s>])/, `$1${ogData.safeDesc}$2`);
    html = html.replace(/(<meta\s+name="twitter:image"\s+content=")[^"]*(")/, `$1${ogData.safeImage}$2`);

    return html;
}

/**
 * Serve the page: for crawlers serve OG-only HTML, for users serve the full SPA with injected OG tags
 */
async function servePage(res, ogParams) {
    const ogData = generateOGTags(ogParams);

    // Try to fetch and inject into the real SPA index.html
    const baseHtml = await getBaseIndexHtml();
    if (baseHtml) {
        const injectedHtml = injectMetaTags(baseHtml, ogData);
        return res.send(injectedHtml);
    }

    // Fallback: serve a simple OG HTML (works for crawlers, users get minimal page)
    res.send(`<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${ogData.metaTags}
</head>
<body>
    <h1>${ogData.safeTitle}</h1>
    <p>${ogData.safeDesc}</p>
    <img src="${ogData.safeImage}" alt="${ogData.safeTitle}">
    <a href="${ogData.safeUrl}">Lihat di ${SITE_NAME}</a>
</body>
</html>`);
}

// ============================================
// TOURNAMENT META TAGS: /t/:slug
// ============================================
router.get('/t/:slug', async (req, res, next) => {
    // In local dev (Vite proxy), non-crawlers should pass to Vite SPA
    const userAgent = req.get('User-Agent');
    const isVercel = !!process.env.VERCEL;

    if (!isVercel && !isCrawler(userAgent)) {
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
            return servePage(res, {
                title: 'Turnamen Tidak Ditemukan - BikinLiga',
                description: 'Turnamen yang kamu cari tidak ditemukan.',
                url: `${BASE_URL}/t/${slug}`
            });
        }

        const t = tournaments[0];
        await servePage(res, {
            title: `${t.name} - BikinLiga`,
            description: t.description || `Turnamen ${t.name} diselenggarakan oleh ${t.organizer_name || 'BikinLiga'}. Ikuti sekarang!`,
            image: t.logo_url || DEFAULT_IMAGE,
            url: `${BASE_URL}/t/${t.slug}`,
            type: 'article',
            favicon: t.logo_url
        });
    } catch (error) {
        console.error('Meta tournament error:', error);
        if (!process.env.VERCEL) return next();
        res.status(500).send('Internal Server Error');
    }
});

// ============================================
// MATCH META TAGS: /t/:slug/match/:matchId
// ============================================
router.get('/t/:slug/match/:matchId', async (req, res, next) => {
    const userAgent = req.get('User-Agent');
    const isVercel = !!process.env.VERCEL;

    if (!isVercel && !isCrawler(userAgent)) {
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
            return servePage(res, {
                title: 'Pertandingan Tidak Ditemukan - BikinLiga',
                description: 'Pertandingan yang kamu cari tidak ditemukan.',
                url: `${BASE_URL}/t/${slug}/match/${matchId}`
            });
        }

        const m = matches[0];
        const scoreText = m.status === 'completed' || m.status === 'finished'
            ? `${m.home_score} - ${m.away_score}` : 'VS';

        await servePage(res, {
            title: `${m.home_name} ${scoreText} ${m.away_name} | ${m.tournament_name}`,
            description: `Pertandingan ${m.home_name} melawan ${m.away_name} di turnamen ${m.tournament_name}. Lihat detail dan statistik pertandingan!`,
            image: m.tournament_logo || DEFAULT_IMAGE,
            url: `${BASE_URL}/t/${m.tournament_slug}/match/${matchId}`,
            type: 'article',
            favicon: m.tournament_logo
        });
    } catch (error) {
        console.error('Meta match error:', error);
        if (!process.env.VERCEL) return next();
        res.status(500).send('Internal Server Error');
    }
});

// ============================================
// COMMUNITY META TAGS: /c/:id
// ============================================
router.get('/eclub/:id', async (req, res, next) => {
    const userAgent = req.get('User-Agent');
    const isVercel = !!process.env.VERCEL;

    if (!isVercel && !isCrawler(userAgent)) {
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
            return servePage(res, {
                title: 'Komunitas Tidak Ditemukan - BikinLiga',
                description: 'Komunitas yang kamu cari tidak ditemukan.',
                url: `${BASE_URL}/eclub/${id}`
            });
        }

        const c = communities[0];
        await servePage(res, {
            title: `${c.name} - Komunitas BikinLiga`,
            description: c.description || `Bergabunglah dengan komunitas ${c.name}! ${c.member_count || 0} anggota aktif.`,
            image: c.icon_url || c.banner_url || DEFAULT_IMAGE,
            url: `${BASE_URL}/eclub/${id}`,
            type: 'profile',
            favicon: c.icon_url
        });
    } catch (error) {
        console.error('Meta community error:', error);
        if (!process.env.VERCEL) return next();
        res.status(500).send('Internal Server Error');
    }
});

// ============================================
// POST META TAGS: /post/:id
// ============================================
router.get('/post/:id', async (req, res, next) => {
    const userAgent = req.get('User-Agent');
    const isVercel = !!process.env.VERCEL;

    if (!isVercel && !isCrawler(userAgent)) {
        return next();
    }

    try {
        const { id } = req.params;
        const [posts] = await pool.query(
            `SELECT p.*, u.name as user_name, u.avatar_url as user_avatar,
                    c.icon_url as community_icon, c.name as community_name
             FROM posts p
             LEFT JOIN users u ON p.user_id = u.id
             LEFT JOIN communities c ON p.community_id = c.id
             WHERE p.id = ?`,
            [id]
        );

        if (posts.length === 0) {
            return servePage(res, {
                title: 'Postingan Tidak Ditemukan - BikinLiga',
                description: 'Postingan yang kamu cari tidak ditemukan.',
                url: `${BASE_URL}/post/${id}`
            });
        }

        const p = posts[0];
        const contentPreview = p.content ? p.content.substring(0, 160) + (p.content.length > 160 ? '...' : '') : '';

        await servePage(res, {
            title: p.community_name ? `${p.user_name} di ${p.community_name} - BikinLiga` : `${p.user_name} di BikinLiga`,
            description: contentPreview || `Lihat postingan dari ${p.user_name} di BikinLiga!`,
            image: p.image_url || p.community_icon || p.user_avatar || DEFAULT_IMAGE,
            url: `${BASE_URL}/post/${id}`,
            type: 'article',
            favicon: p.community_icon
        });
    } catch (error) {
        console.error('Meta post error:', error);
        if (!process.env.VERCEL) return next();
        res.status(500).send('Internal Server Error');
    }
});

export default router;
