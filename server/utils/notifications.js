import { v4 as uuidv4 } from 'uuid';
import db from '../config/db.js';

export const createNotification = async (userId, type, title, message, data = {}, connection = null) => {
    try {
        const id = uuidv4();
        const query = `
            INSERT INTO notifications (id, user_id, type, title, message, data)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const params = [
            id,
            userId,
            type,
            title,
            message,
            JSON.stringify(data)
        ];

        if (connection) {
            await connection.query(query, params);
        } else {
            await db.query(query, params);
        }

        console.log(`[Notification] Created for user ${userId}: ${type}`);
        return id;
    } catch (error) {
        console.error('[Notification] Error creating notification:', error);
        // Don't throw, just log. Notifications shouldn't break the main flow.
        return null;
    }
};

export const createBulkNotifications = async (userIds, type, title, message, data = {}) => {
    if (!userIds || userIds.length === 0) return;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const query = `
            INSERT INTO notifications (id, user_id, type, title, message, data)
            VALUES ?
        `;

        const jsonData = JSON.stringify(data);
        const values = userIds.map(uid => [
            uuidv4(),
            uid,
            type,
            title,
            message,
            jsonData
        ]);

        await connection.query(query, [values]);
        await connection.commit();

        console.log(`[Notification] Bulk created for ${userIds.length} users: ${type}`);
    } catch (error) {
        await connection.rollback();
        console.error('[Notification] Error bulk creating notifications:', error);
    } finally {
        connection.release();
    }
};
