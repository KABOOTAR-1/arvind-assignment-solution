import express from 'express';
import validateMiddleware from '../middlewares/validate.js';
import sessionController from '../controllers/sessionController.js';

const router = express.Router();

router.post('/', validateMiddleware.validateSession, sessionController.createSession);
router.get('/:id', sessionController.getSession);
router.put('/:id', validateMiddleware.validateSessionUpdate, sessionController.updateSession);
router.put('/:id/extend', sessionController.extendSession);
router.delete('/:id', sessionController.deleteSession);
router.get('/user/:userId', sessionController.getUserSessions);
router.delete('/cleanup/expired', sessionController.cleanupExpiredSessions);

export default router;
