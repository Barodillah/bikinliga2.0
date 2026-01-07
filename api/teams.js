// Vercel Serverless Function - Proxy for eFootball DB API
// This bypasses CORS restrictions by making server-side requests

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const response = await fetch('https://api.efootballdb.com/api/2022/competitions');

        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();

        // Cache the response for 1 hour to reduce API calls
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

        return res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching teams:', error);
        return res.status(500).json({
            error: 'Failed to fetch teams data',
            message: error.message
        });
    }
}
