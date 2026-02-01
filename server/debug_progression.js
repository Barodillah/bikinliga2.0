import dotenv from 'dotenv';
const result = dotenv.config({ path: '../.env' });
console.log('Dotenv Result:', result.error ? result.error : 'Success');
console.log('DB Connection Test Host:', process.env.DB_HOST);
import db from './config/db.js';

const matchId = 'ecc35161-1321-4ad8-9a54-a3514e8123d5';

async function debugMatch() {
    try {
        console.log(`Debugging Match ID: ${matchId}`);
        const [matches] = await db.query('SELECT * FROM matches WHERE id = ?', [matchId]);

        if (matches.length === 0) {
            console.log('Match not found');
            return;
        }

        const match = matches[0];
        console.log('Match Data:', JSON.stringify(match, null, 2));

        const details = typeof match.details === 'string' ? JSON.parse(match.details || '{}') : (match.details || {});
        console.log('Parsed Details:', details);

        const [tournaments] = await db.query('SELECT * FROM tournaments WHERE id = ?', [match.tournament_id]);
        const tournament = tournaments[0];
        console.log('Tournament Data:', JSON.stringify(tournament, null, 2));

        if (tournament.type === 'knockout' || tournament.type === 'group_knockout') {
            console.log(`Tournament Format: ${tournament.match_format}`);

            if (tournament.match_format === 'home_away') {
                const leg = Number(details.leg || 1);
                console.log(`Generic Leg Check: ${leg}`);

                if (leg === 2) {
                    console.log('Searching for Leg 1...');
                    const [roundMatches] = await db.query(
                        `SELECT * FROM matches WHERE tournament_id = ? AND round = ?`,
                        [match.tournament_id, match.round]
                    );

                    console.log(`Found ${roundMatches.length} matches in round ${match.round}`);

                    const leg1 = roundMatches.find(m => {
                        const d = typeof m.details === 'string' ? JSON.parse(m.details || '{}') : (m.details || {});
                        console.log(`- Checking match ${m.id}: Leg ${d.leg}, GroupId ${d.groupId}`);
                        return d.groupId == details.groupId && d.leg == 1;
                    });

                    if (leg1) {
                        console.log('Leg 1 Found:', leg1.id);
                        console.log('Leg 1 Scores:', leg1.home_score, '-', leg1.away_score);
                    } else {
                        console.log('Leg 1 NOT FOUND');
                    }
                }
            }
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        process.exit();
    }
}

debugMatch();
