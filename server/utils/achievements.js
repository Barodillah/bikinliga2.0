
import db from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Unlock an achievement for a user
 * @param {string} userId - The ID of the user
 * @param {string} achievementId - The ID of the achievement (e.g., 'tour_champ')
 * @param {object} metadata - Optional metadata about the achievement context
 * @returns {Promise<boolean>} - True if newly unlocked, False if already unlocked or error
 */
export const unlockAchievement = async (userId, achievementId, metadata = {}) => {
    try {
        // 1. Check if achievement exists
        const [achievements] = await db.query(
            'SELECT * FROM achievements WHERE id = ?',
            [achievementId]
        );

        if (achievements.length === 0) {
            console.warn(`Achievement ID ${achievementId} not found.`);
            return false;
        }

        const achievementName = achievements[0].name;

        // 2. Check if user already has it
        const [existing] = await db.query(
            'SELECT id FROM user_achievements WHERE user_id = ? AND achievement_id = ?',
            [userId, achievementId]
        );

        if (existing.length > 0) {
            return false; // Already unlocked
        }

        // 3. Unlock it
        const id = uuidv4();
        await db.query(
            `INSERT INTO user_achievements (id, user_id, achievement_id, metadata, unlocked_at)
             VALUES (?, ?, ?, ?, NOW())`,
            [id, userId, achievementId, JSON.stringify(metadata)]
        );

        console.log(`🏆 Achievement Unlocked: ${achievementName} for User ${userId}`);

        // TODO: Send real-time notification to user (Socket.io / OneSignal)

        return true;

    } catch (error) {
        console.error('Error unlocking achievement:', error);
        return false;
    }
};

/**
 * Get all available achievements with user's progress
 * @param {string} userId 
 * @returns {Promise<Array>}
 */
export const getUserAchievements = async (userId) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                a.*,
                ua.unlocked_at,
                ua.is_showcased,
                ua.metadata,
                CASE WHEN ua.id IS NOT NULL THEN TRUE ELSE FALSE END as is_unlocked
            FROM achievements a
            LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
            ORDER BY ua.unlocked_at DESC, a.created_at ASC
        `, [userId]);

        return rows;
    } catch (error) {
        console.error('Error fetching user achievements:', error);
        return [];
    }
};

/**
 * Set showcased achievements for a user
 * @param {string} userId 
 * @param {Array<string>} achievementIds - Array of achievement IDs (max 3)
 */
export const setShowcasedAchievements = async (userId, achievementIds) => {
    if (!Array.isArray(achievementIds) || achievementIds.length > 3) {
        throw new Error('Invalid achievements list. Max 3 allowed.');
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Reset all to false
        await connection.query(
            'UPDATE user_achievements SET is_showcased = FALSE WHERE user_id = ?',
            [userId]
        );

        // Set selected to true
        if (achievementIds.length > 0) {
            // Validate user owns these achievements
            const placeholders = achievementIds.map(() => '?').join(',');

            // Only update if the user actually possesses these achievements
            await connection.query(
                `UPDATE user_achievements 
                 SET is_showcased = TRUE 
                 WHERE user_id = ? AND achievement_id IN (${placeholders})`,
                [userId, ...achievementIds]
            );
        }

        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}
