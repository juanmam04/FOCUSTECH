import { Router } from 'express';
import * as productController from '../controllers/productController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';
import { productValidation } from '../middlewares/validators.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = Router();

const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return authMiddleware(req, res, next);
  }
  next();
};

router.get('/', optionalAuth, productController.listProducts);

router.patch(
  '/images/:imageId/main',
  authMiddleware,
  adminMiddleware,
  productController.setMainImage
);
router.delete(
  '/images/:imageId',
  authMiddleware,
  adminMiddleware,
  productController.deleteProductImage
);

router.get('/:slug', optionalAuth, productController.getProductBySlug);

router.post('/', authMiddleware, adminMiddleware, productValidation, productController.createProduct);
router.put('/:id', authMiddleware, adminMiddleware, productValidation, productController.updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, productController.deleteProduct);

router.post(
  '/:id/images',
  authMiddleware,
  adminMiddleware,
  upload.array('images', 10),
  productController.uploadProductImages
);

export default router;
