import { body, param } from 'express-validator';

export const loginValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Contraseña requerida'),
];

export const categoryValidation = [
  body('name').trim().notEmpty().withMessage('Nombre requerido'),
  body('slug').optional().trim(),
  body('description').optional().trim(),
  body('is_active').optional().isBoolean(),
];

export const productValidation = [
  body('name').trim().notEmpty().withMessage('Nombre requerido'),
  body('slug').optional().trim(),
  body('description').optional().trim(),
  body('price').isFloat({ min: 0 }).withMessage('Precio inválido'),
  body('compare_at_price').optional({ nullable: true }).isFloat({ min: 0 }),
  body('stock').isInt({ min: 0 }).withMessage('Stock inválido'),
  body('sku').trim().notEmpty().withMessage('SKU requerido'),
  body('category_id').isInt().withMessage('Categoría requerida'),
  body('is_active').optional().isBoolean(),
  body('is_featured').optional().isBoolean(),
];

export const orderValidation = [
  body('customer_name').trim().notEmpty(),
  body('customer_email').isEmail(),
  body('customer_phone').trim().notEmpty(),
  body('department').trim().notEmpty(),
  body('city').trim().notEmpty(),
  body('address').trim().notEmpty(),
  body('shipping_method').trim().notEmpty(),
  body('payment_method').trim().notEmpty(),
  body('notes').optional().trim(),
  body('items').isArray({ min: 1 }),
  body('items.*.product_id').isInt(),
  body('items.*.quantity').isInt({ min: 1 }),
];

export const orderStatusValidation = [
  param('id').isInt(),
  body('status').notEmpty(),
];
