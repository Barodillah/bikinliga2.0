import express from 'express';
// Native fetch is available in Node 18+

const router = express.Router();

router.get('/players', async (req, res) => {
    try {
        const { q } = req.query;
        // Construct target URL
        let targetUrl = 'https://bikinliga.online/api_pemain.php';
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
