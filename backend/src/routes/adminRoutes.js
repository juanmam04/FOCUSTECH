import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';

const router = Router();

router.get('/dashboard', authMiddleware, adminMiddleware, adminController.getDashboard);

export default router;
