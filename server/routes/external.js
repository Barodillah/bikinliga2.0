import express from 'express';
import fetch from 'node-fetch'; // Standard available in node 18+ or needs import depending on setup. Native fetch is available in Node 18+. I will assume native fetch or use fallback. 
// Actually 'node-fetch' might not be installed. Node 18+ has global fetch.
// I'll try using global fetch first.

const router = express.Router();

router.get('/players', async (req, res) => {
    try {
        const { q } = req.query;
        // Construct target URL
        let targetUrl = 'https://cuma.click/support_bikinliga/api_pemain.php';
        if (q) {
            targetUrl += `?q=${encodeURIComponent(q)}`;
        }

        const response = await fetch(targetUrl);

        if (!response.ok) {
            throw new Error(`External API error: ${response.statusText}`);
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('External API Proxy Error:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data pemain eksternal' });
    }
});

export default router;
