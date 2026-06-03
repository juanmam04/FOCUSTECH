import { validationResult } from 'express-validator';
import pool from '../config/db.js';
import { slugify, ensureUniqueSlug } from '../utils/slugify.js';
import * as categoryModel from '../models/categoryModel.js';

export async function listCategories(req, res, next) {
  try {
    const activeOnly = !req.user;
    const categories = await categoryModel.findCategories(activeOnly);
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}

export async function getCategoryBySlug(req, res, next) {
  try {
    const activeOnly = !req.user;
    const category = await categoryModel.findCategoryBySlug(req.params.slug, activeOnly);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    }
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, slug, description, is_active } = req.body;
    const baseSlug = slugify(slug || name);
    const uniqueSlug = await ensureUniqueSlug(pool, 'categories', baseSlug);

    const [result] = await pool.query(
      'INSERT INTO categories (name, slug, description, is_active) VALUES (?, ?, ?, ?)',
      [name, uniqueSlug, description || null, is_active !== false]
    );

    const category = await categoryModel.findCategoryById(result.insertId);
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const id = req.params.id;
    const existing = await categoryModel.findCategoryById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    }

    const { name, slug, description, is_active } = req.body;
    const baseSlug = slugify(slug || name);
    const uniqueSlug = await ensureUniqueSlug(pool, 'categories', baseSlug, id);

    await pool.query(
      'UPDATE categories SET name = ?, slug = ?, description = ?, is_active = ? WHERE id = ?',
      [name, uniqueSlug, description || null, is_active !== false, id]
    );

    const category = await categoryModel.findCategoryById(id);
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    const id = req.params.id;
    const [products] = await pool.query('SELECT id FROM products WHERE category_id = ? LIMIT 1', [id]);
    if (products.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar: hay productos asociados',
      });
    }

    const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    }
    res.json({ success: true, message: 'Categoría eliminada' });
  } catch (err) {
    next(err);
  }
}
