import { validationResult } from 'express-validator';
import pool from '../config/db.js';
import { isDuplicateKeyError } from '../utils/dbError.js';
import { slugify, ensureUniqueSlug } from '../utils/slugify.js';
import * as productModel from '../models/productModel.js';

export async function listProducts(req, res, next) {
  try {
    const activeOnly = !req.user;
    const products = await productModel.findProducts({
      activeOnly,
      featured: req.query.featured,
      categorySlug: req.query.category,
      search: req.query.search,
      sort: req.query.sort || 'newest',
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
}

export async function getProductBySlug(req, res, next) {
  try {
    const activeOnly = !req.user;
    const product = await productModel.findProductBySlug(req.params.slug, activeOnly);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    const related = await productModel.findProducts({
      activeOnly: true,
      categorySlug: product.category_slug,
      limit: 4,
      excludeSlug: product.slug,
    });

    res.json({ success: true, data: product, related });
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      name, slug, description, price, compare_at_price, stock, sku,
      category_id, is_active, is_featured,
    } = req.body;

    const baseSlug = slugify(slug || name);
    const uniqueSlug = await ensureUniqueSlug(pool, 'products', baseSlug);

    const [result] = await pool.query(
      `INSERT INTO products (category_id, name, slug, description, price, compare_at_price, stock, sku, is_active, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id, name, uniqueSlug, description || null,
        price, compare_at_price || null, stock, sku,
        is_active !== false,
        Boolean(is_featured),
      ]
    );

    const product = await productModel.findProductById(result.insertId);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      return res.status(400).json({ success: false, message: 'SKU o slug duplicado' });
    }
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const id = req.params.id;
    const existing = await productModel.findProductById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    const {
      name, slug, description, price, compare_at_price, stock, sku,
      category_id, is_active, is_featured,
    } = req.body;

    const baseSlug = slugify(slug || name);
    const uniqueSlug = await ensureUniqueSlug(pool, 'products', baseSlug, id);

    await pool.query(
      `UPDATE products SET category_id=?, name=?, slug=?, description=?, price=?, compare_at_price=?,
       stock=?, sku=?, is_active=?, is_featured=? WHERE id=?`,
      [
        category_id, name, uniqueSlug, description || null,
        price, compare_at_price || null, stock, sku,
        is_active !== false,
        Boolean(is_featured),
        id,
      ]
    );

    const product = await productModel.findProductById(id);
    res.json({ success: true, data: product });
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      return res.status(400).json({ success: false, message: 'SKU o slug duplicado' });
    }
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }
    res.json({ success: true, message: 'Producto eliminado' });
  } catch (err) {
    next(err);
  }
}

export async function uploadProductImages(req, res, next) {
  try {
    const productId = req.params.id;
    const product = await productModel.findProductById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    if (!req.files?.length) {
      return res.status(400).json({ success: false, message: 'No se enviaron imágenes' });
    }

    const isMain = req.body.is_main === 'true' || req.body.is_main === true;
    const [existing] = await pool.query(
      'SELECT COUNT(*) AS count FROM product_images WHERE product_id = ?',
      [productId]
    );
    const startPosition = existing[0].count;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      if (isMain) {
        await connection.query(
          'UPDATE product_images SET is_main = FALSE WHERE product_id = ?',
          [productId]
        );
      }

      const inserted = [];
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imageUrl = `/uploads/${file.filename}`;
        const mainFlag = Boolean((isMain && i === 0) || (startPosition === 0 && i === 0));

        const [r] = await connection.query(
          'INSERT INTO product_images (product_id, image_url, is_main, position) VALUES (?, ?, ?, ?)',
          [productId, imageUrl, mainFlag, startPosition + i]
        );
        inserted.push({ id: r.insertId, image_url: imageUrl, is_main: mainFlag });
      }

      await connection.commit();
      const images = await productModel.getProductImages(productId);
      res.status(201).json({ success: true, data: images });
    } catch (e) {
      await connection.rollback();
      throw e;
    } finally {
      connection.release();
    }
  } catch (err) {
    next(err);
  }
}

export async function deleteProductImage(req, res, next) {
  try {
    const imageId = req.params.imageId;
    const [rows] = await pool.query('SELECT * FROM product_images WHERE id = ?', [imageId]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Imagen no encontrada' });
    }

    await pool.query('DELETE FROM product_images WHERE id = ?', [imageId]);

    if (rows[0].is_main) {
      const [nextImg] = await pool.query(
        'SELECT id FROM product_images WHERE product_id = ? ORDER BY position ASC LIMIT 1',
        [rows[0].product_id]
      );
      if (nextImg.length) {
        await pool.query('UPDATE product_images SET is_main = TRUE WHERE id = ?', [nextImg[0].id]);
      }
    }

    res.json({ success: true, message: 'Imagen eliminada' });
  } catch (err) {
    next(err);
  }
}

export async function setMainImage(req, res, next) {
  try {
    const { imageId } = req.params;
    const [rows] = await pool.query('SELECT * FROM product_images WHERE id = ?', [imageId]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Imagen no encontrada' });
    }

    await pool.query('UPDATE product_images SET is_main = FALSE WHERE product_id = ?', [rows[0].product_id]);
    await pool.query('UPDATE product_images SET is_main = TRUE WHERE id = ?', [imageId]);

    const images = await productModel.getProductImages(rows[0].product_id);
    res.json({ success: true, data: images });
  } catch (err) {
    next(err);
  }
}
