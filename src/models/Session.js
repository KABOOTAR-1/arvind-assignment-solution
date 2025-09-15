import pool from '../config/database.js';

class Session {
    static async createSession(userId, sessionData = {}, expiresAt = null) {
        try {
            const defaultExpiry = expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
            
            const result = await pool.query(
                'INSERT INTO user_sessions (user_id, session_data, expires_at) VALUES ($1, $2, $3) RETURNING *',
                [userId, JSON.stringify(sessionData), defaultExpiry]
            );
            
            return result.rows[0];
        } catch (error) {
            console.error('Error creating session:', error);
            throw error;
        }
    }

    static async getSessionById(sessionId) {
        try {
            const result = await pool.query(
                'SELECT * FROM user_sessions WHERE id = $1 AND expires_at > NOW()',
                [sessionId]
            );
            
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error getting session:', error);
            throw error;
        }
    }

    static async updateSession(sessionId, sessionData) {
        try {
            const result = await pool.query(
                'UPDATE user_sessions SET session_data = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND expires_at > NOW() RETURNING *',
                [JSON.stringify(sessionData), sessionId]
            );
            
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error updating session:', error);
            throw error;
        }
    }

    static async extendSession(sessionId, additionalMinutes = 60) {
        try {
            const result = await pool.query(
                'UPDATE user_sessions SET expires_at = expires_at + INTERVAL \'$1 minutes\' WHERE id = $2 AND expires_at > NOW() RETURNING *',
                [additionalMinutes, sessionId]
            );
            
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error extending session:', error);
            throw error;
        }
    }

    static async deleteSession(sessionId) {
        try {
            const result = await pool.query(
                'DELETE FROM user_sessions WHERE id = $1 RETURNING *',
                [sessionId]
            );
            
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error deleting session:', error);
            throw error;
        }
    }

    static async getUserSessions(userId) {
        try {
            const result = await pool.query(
                'SELECT * FROM user_sessions WHERE user_id = $1 AND expires_at > NOW() ORDER BY created_at DESC',
                [userId]
            );
            
            return result.rows;
        } catch (error) {
            console.error('Error getting user sessions:', error);
            throw error;
        }
    }

    static async cleanupExpiredSessions() {
        try {
            const result = await pool.query(
                'DELETE FROM user_sessions WHERE expires_at <= NOW() RETURNING COUNT(*)'
            );
            
            return result.rowCount;
        } catch (error) {
            console.error('Error cleaning up expired sessions:', error);
            throw error;
        }
    }
}

export default Session;
