import { query } from '../config/db.js';

/**
 * BikinLiga 2.0 Dynamic Coin Pricing Algorithm (Hybrid Model)
 * Combines Polynomial Bonding Curve with Dynamic Surge Pricing
 * 
 * Formula:
 * P(S, C) = [P0 + (α * S) + (β * S^γ)] * max(M_min, 1 + κ * ((C - C_target) / C_target))
 */

// Constants
const P0 = 150; // Base Price (Floor Price) in IDR
const ALPHA = 0.001; // Linear coefficient
const BETA = 0.000001; // Exponential coefficient
const GAMMA = 1.6; // Growth exponent (between 1.5 - 2.0)

const C_TARGET = 50; // Ideal/Target active tournaments
const KAPPA = 0.2; // Crowd sensitivity coefficient
const M_MIN = 1.0; // Minimum multiplier (1.0 means price never drops below pure supply curve)

/**
 * Calculate the dynamic coin price
 * @param {number} S Circulating Supply (Total coins in wallets)
 * @param {number} C Count of Active/Open Tournaments
 * @returns {number} Final price per coin in IDR
 */
export function calculateDynamicCoinPrice(S, C) {
    // 1. Supply Curve Component
    const supplyBase = ALPHA * S;
    const supplyExponential = BETA * Math.pow(S, GAMMA);
    const curvePrice = P0 + supplyBase + supplyExponential;

    // 2. Surge Pricing Component
    const surgeRatio = (C - C_TARGET) / C_TARGET;
    const surgeMultiplier = Math.max(M_MIN, 1 + (KAPPA * surgeRatio));

    // 3. Final Calculation
    let finalPrice = curvePrice * surgeMultiplier;

    // 4. Hardcode Validation: Price can NEVER fall below P0 (150 IDR)
    if (finalPrice < P0) {
        finalPrice = P0;
    }

    // Round to nearest Rupiah
    return Math.round(finalPrice);
}

/**
 * Get the current $S$ (Circulating Supply) and $C$ (Active Tournaments) from DB
 * @returns {Promise<{supply: number, activeTournaments: number}>}
 */
export async function getCurrentMarketMetrics() {
    try {
        // Get S: Sum of all wallet balances
        const [supplyResult] = await query('SELECT COALESCE(SUM(balance), 0) as total_supply FROM wallets');
        const supply = Number(supplyResult?.total_supply || 0);

        // Get C: Count of open/active tournaments
        // Assuming 'open' and 'active' are the statuses that consume server resources
        const [tournamentsResult] = await query("SELECT COUNT(*) as count FROM tournaments WHERE status IN ('open', 'active')");
        const activeTournaments = Number(tournamentsResult?.count || 0);

        return { supply, activeTournaments };
    } catch (error) {
        console.error('Error getting market metrics:', error);
        return { supply: 0, activeTournaments: 0 };
    }
}

/**
 * Fetch current metrics, calculate price, and optionally record it if older than 1 hour
 * @returns {Promise<{price: number, supply: number, activeTournaments: number}>}
 */
export async function getAndRecordCurrentPrice() {
    try {
        const { supply, activeTournaments } = await getCurrentMarketMetrics();
        const currentPrice = calculateDynamicCoinPrice(supply, activeTournaments);

        // Check the last recorded price time to throttle inserts
        const sqlCheck = `SELECT recorded_at FROM coin_price_history ORDER BY recorded_at DESC LIMIT 1`;
        const lastRecord = await query(sqlCheck);

        let shouldRecord = true;
        if (lastRecord && lastRecord.length > 0) {
            const lastTime = new Date(lastRecord[0].recorded_at).getTime();
            const now = new Date().getTime();
            const hoursDiff = (now - lastTime) / (1000 * 60 * 60);

            // Record only if more than 1 hour has passed since the last record
            if (hoursDiff < 1) {
                shouldRecord = false;
            }
        }

        if (shouldRecord) {
            await query(
                `INSERT INTO coin_price_history (price, circulating_supply, active_tournaments) VALUES (?, ?, ?)`,
                [currentPrice, supply, activeTournaments]
            );
        }

        return {
            price: currentPrice,
            supply,
            activeTournaments
        };
    } catch (error) {
        console.error('Error fetching and recording dynamic price:', error);
        // Fallback safely
        return { price: P0, supply: 0, activeTournaments: 0 };
    }
}
