import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { loginValidation } from '../middlewares/validators.js';

const router = Router();

router.post('/login', loginValidation, authController.login);
router.get('/me', authMiddleware, authController.me);

export default router;
