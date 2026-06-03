import { Router } from 'express';
import * as orderController from '../controllers/orderController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';
import { orderValidation, orderStatusValidation } from '../middlewares/validators.js';

const router = Router();

router.post('/', orderValidation, orderController.createOrder);

router.get('/', authMiddleware, adminMiddleware, orderController.listOrders);
router.get('/:id', authMiddleware, adminMiddleware, orderController.getOrder);
router.put('/:id/status', authMiddleware, adminMiddleware, orderStatusValidation, orderController.updateOrderStatus);

export default router;
