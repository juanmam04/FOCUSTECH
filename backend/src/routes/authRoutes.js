import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { loginValidation, oauthValidation, registerValidation } from '../middlewares/validators.js';

const router = Router();

router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/oauth', oauthValidation, authController.oauth);
router.get('/me', authMiddleware, authController.me);

export default router;
