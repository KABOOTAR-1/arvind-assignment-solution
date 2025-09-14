import express from 'express';
import validateMiddleware from '../middlewares/validate.js';
import faqController from '../controllers/faqController.js';
const router = express.Router();

router.get('/', faqController.getAllFAQs);

router.get('/:id', faqController.getFAQById);

router.post('/', validateMiddleware.validateFAQ, faqController.createFAQ);

router.put('/:id', validateMiddleware.validateFAQ, faqController.updateFAQ);

router.delete('/:id', faqController.deleteFAQ);


export default router;
