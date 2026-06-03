import { Router } from 'express';
import * as categoryController from '../controllers/categoryController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';
import { categoryValidation } from '../middlewares/validators.js';

const router = Router();

const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return authMiddleware(req, res, next);
  }
  next();
};

router.get('/', optionalAuth, categoryController.listCategories);
router.get('/:slug', optionalAuth, categoryController.getCategoryBySlug);

router.post('/', authMiddleware, adminMiddleware, categoryValidation, categoryController.createCategory);
router.put('/:id', authMiddleware, adminMiddleware, categoryValidation, categoryController.updateCategory);
router.delete('/:id', authMiddleware, adminMiddleware, categoryController.deleteCategory);

export default router;
