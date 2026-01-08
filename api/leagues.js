// Vercel Serverless Function - Proxy for API-Sports leagues
// This avoids CORS issues and hides the API key from the frontend

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    try {
        const response = await fetch("https://v3.football.api-sports.io/leagues", {
            method: 'GET',
            headers: {
                "x-apisports-key": "ba7f9e9f4e2895c61a3e211ce5d7897a"
            }
        })

        const data = await response.json()

        // Return the data
        res.status(200).json(data)
    } catch (error) {
        console.error('Error fetching leagues:', error)
        res.status(500).json({ error: 'Failed to fetch leagues', message: error.message })
    }
}
