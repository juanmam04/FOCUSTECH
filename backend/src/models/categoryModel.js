import pool from '../config/db.js';

export async function findCategories(activeOnly = true) {
  let sql = 'SELECT * FROM categories';
  if (activeOnly) sql += ' WHERE is_active = TRUE';
  sql += ' ORDER BY name ASC';
  const [rows] = await pool.query(sql);
  return rows;
}

export async function findCategoryBySlug(slug, activeOnly = true) {
  let sql = 'SELECT * FROM categories WHERE slug = ?';
  const params = [slug];
  if (activeOnly) {
    sql += ' AND is_active = TRUE';
  }
  const [rows] = await pool.query(sql, params);
  return rows[0] || null;
}

export async function findCategoryById(id) {
  const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
  return rows[0] || null;
}
