import express from 'express';
import fetch from 'node-fetch'; // or use native fetch if node 18+

const router = express.Router();

// Get teams from eFootball DB
router.get('/', async (req, res) => {
    try {
        const response = await fetch('https://api.efootballdb.com/api/2022/competitions');

        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();

        // Cache control
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

        res.json(data);
    } catch (error) {
        console.error('Error fetching teams:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal memuat data tim',
            error: error.message
        });
    }
});

export default router;
