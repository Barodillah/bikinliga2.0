import 'dotenv/config';
import mysql from 'mysql2/promise';

async function debugMatch() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        // Get the most recently updated match
        const [matches] = await connection.query(`
            SELECT m.*, t.type as tournament_type, t.match_format
            FROM matches m
            JOIN tournaments t ON m.tournament_id = t.id
            ORDER BY m.updated_at DESC
            LIMIT 1
        `);

        if (matches.length === 0) {
            console.log("No matches found.");
            return;
        }

        const match = matches[0];
        console.log("=== LATEST MATCH DEBUG INFO ===");
        console.log(`ID: ${match.id}`);
        console.log(`Status: ${match.status}`);
        console.log(`Scores: ${match.home_score} - ${match.away_score}`);
        console.log(`Penalties: ${match.home_penalty_score} - ${match.away_penalty_score}`);
        console.log(`Round: ${match.round}`);
        console.log(`Details (Raw):`, match.details);

        let details = {};
        try {
            details = typeof match.details === 'string' ? JSON.parse(match.details) : match.details;
        } catch (e) { console.log("Failed to parse details"); }

        console.log(`Details (Parsed):`, details);
        console.log(`MatchIndex: ${details?.matchIndex}`);
        console.log(`Tournament Type: ${match.tournament_type}`);
        console.log(`Match Format: ${match.match_format}`);

        if (details && details.matchIndex !== undefined) {
            const currentMatchIndex = Number(details.matchIndex);
            const nextRound = match.round + 1;

            console.log(`--- Progression Check ---`);
            console.log(`Current MatchIndex: ${currentMatchIndex}`);
            console.log(`Next Round Should Be: ${nextRound}`);

            // Check if next match exists
            const [nextMatches] = await connection.query(`
                SELECT * FROM matches 
                WHERE tournament_id = ? AND round = ?
             `, [match.tournament_id, nextRound]);

            console.log(`Found ${nextMatches.length} matches in next round.`);
            nextMatches.forEach(m => {
                console.log(`- Match ${m.id}: Details=${JSON.stringify(m.details)}`);
            });
        }

    } catch (error) {
        console.error(error);
    } finally {
        await connection.end();
    }
}

debugMatch();
