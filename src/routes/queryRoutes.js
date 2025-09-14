import express from 'express';
import validateMiddleware from '../middlewares/validate.js';
import queryController from '../controllers/queryController.js';

const router = express.Router();

router.post('/', validateMiddleware.validateQuery, queryController.processQuery);
router.get('/', queryController.getAllQueries);
router.get('/analytics', queryController.getAnalytics);
router.get('/:id', queryController.getQueryById);

export default router;
