import { query } from './server/config/db.js';

async function testQuery() {
    try {
        console.log("Testing ad_reward transactions for today...");

        // Find ALL ad_reward transactions
        const allAdRewards = await query(`
            SELECT t.id, t.type, t.category, t.amount, t.created_at, w.user_id 
            FROM transactions t
            JOIN wallets w ON t.wallet_id = w.id
            WHERE t.type = 'ad_reward' OR t.category = 'Ad Reward'
            ORDER BY t.created_at DESC LIMIT 10
        `);
        console.log("Recent ad_reward transactions:", allAdRewards);

    } catch (err) {
        console.error("Error:", err);
    } process.exit(0);
}
testQuery();
