import Session from '../models/Session.js';
import User from '../models/User.js';

const sessionController = {
    async createSession(req, res) {
        try {
            const { userId, sessionData, expiresAt } = req.body;
            
            // Verify user exists
            const user = await User.getUserById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            const session = await Session.createSession(userId, sessionData, expiresAt);
            
            res.status(201).json({
                success: true,
                data: session
            });
        } catch (error) {
            console.error('Error creating session:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create session'
            });
        }
    },

    async getSession(req, res) {
        try {
            const { id } = req.params;
            
            const session = await Session.getSessionById(id);
            
            if (!session) {
                return res.status(404).json({
                    success: false,
                    error: 'Session not found or expired'
                });
            }

            res.json({
                success: true,
                data: session
            });
        } catch (error) {
            console.error('Error getting session:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve session'
            });
        }
    },

    async updateSession(req, res) {
        try {
            const { id } = req.params;
            const { sessionData } = req.body;
            
            const session = await Session.updateSession(id, sessionData);
            
            if (!session) {
                return res.status(404).json({
                    success: false,
                    error: 'Session not found or expired'
                });
            }

            res.json({
                success: true,
                data: session
            });
        } catch (error) {
            console.error('Error updating session:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update session'
            });
        }
    },

    async extendSession(req, res) {
        try {
            const { id } = req.params;
            const { additionalMinutes = 60 } = req.body;
            
            const session = await Session.extendSession(id, additionalMinutes);
            
            if (!session) {
                return res.status(404).json({
                    success: false,
                    error: 'Session not found or expired'
                });
            }

            res.json({
                success: true,
                data: session
            });
        } catch (error) {
            console.error('Error extending session:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to extend session'
            });
        }
    },

    async deleteSession(req, res) {
        try {
            const { id } = req.params;
            
            const session = await Session.deleteSession(id);
            
            if (!session) {
                return res.status(404).json({
                    success: false,
                    error: 'Session not found'
                });
            }

            res.json({
                success: true,
                message: 'Session deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting session:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete session'
            });
        }
    },

    async getUserSessions(req, res) {
        try {
            const { userId } = req.params;
            
            const sessions = await Session.getUserSessions(userId);
            
            res.json({
                success: true,
                data: sessions
            });
        } catch (error) {
            console.error('Error getting user sessions:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve user sessions'
            });
        }
    },

    async cleanupExpiredSessions(req, res) {
        try {
            const deletedCount = await Session.cleanupExpiredSessions();
            
            res.json({
                success: true,
                message: `Cleaned up ${deletedCount} expired sessions`
            });
        } catch (error) {
            console.error('Error cleaning up sessions:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to cleanup expired sessions'
            });
        }
    }
};

export default sessionController;
