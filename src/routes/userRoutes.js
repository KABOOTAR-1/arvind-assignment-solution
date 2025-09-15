import express from 'express';
import validateMiddleware from '../middlewares/validate.js';
import userController from '../controllers/userController.js';
const router = express.Router();

router.post('/', validateMiddleware.validateUser, userController.createUser);
router.post('/login', validateMiddleware.validateUserLogin, userController.loginUser);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.get('/:id/history', userController.getUserHistory);
router.put('/:id', validateMiddleware.validateUser, userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
