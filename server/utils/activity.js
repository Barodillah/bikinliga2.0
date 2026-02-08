import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Log user activity to user_logs table
 * @param {string} userId - ID of the user performing the action
 * @param {string} action - Short action name (e.g. 'Register', 'Join Community')
 * @param {string} description - Detailed description
 * @param {string} referenceId - Optional related entity ID
 * @param {string} referenceType - Optional related entity type
 */
export async function logActivity(userId, action, description, referenceId = null, referenceType = null) {
    try {
        const id = uuidv4();
        await query(
            'INSERT INTO user_logs (id, user_id, action, description, reference_id, reference_type) VALUES (?, ?, ?, ?, ?, ?)',
            [id, userId, action, description, referenceId, referenceType]
        );
        console.log(`[Activity Logged] User: ${userId}, Action: ${action}`);
    } catch (error) {
        console.error('[Activity Log Error]:', error.message);
        // Don't throw error to prevent blocking the main flow
    }
}
