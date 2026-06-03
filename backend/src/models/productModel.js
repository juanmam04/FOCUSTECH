import pool from '../config/db.js';

export async function getProductImages(productId) {
  const [images] = await pool.query(
    'SELECT * FROM product_images WHERE product_id = ? ORDER BY is_main DESC, position ASC',
    [productId]
  );
  return images;
}

export async function attachImagesToProducts(products) {
  if (!products.length) return [];
  const ids = products.map((p) => p.id);
  const [images] = await pool.query(
    `SELECT * FROM product_images WHERE product_id IN (${ids.map(() => '?').join(',')})
     ORDER BY is_main DESC, position ASC`,
    ids
  );
  return products.map((p) => ({
    ...p,
    images: images.filter((img) => img.product_id === p.id),
    main_image: images.find((img) => img.product_id === p.id && img.is_main)?.image_url
      || images.find((img) => img.product_id === p.id)?.image_url
      || null,
  }));
}

export async function findProducts({
  activeOnly = true,
  featured,
  categorySlug,
  search,
  sort = 'newest',
  limit,
  offset,
  excludeSlug,
}) {
  let sql = `
    SELECT p.*, c.name AS category_name, c.slug AS category_slug
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE 1=1
  `;
  const params = [];

  if (activeOnly) {
    sql += ' AND p.is_active = TRUE AND c.is_active = TRUE';
  }
  if (featured === true || featured === 'true') {
    sql += ' AND p.is_featured = TRUE';
  }
  if (categorySlug) {
    sql += ' AND c.slug = ?';
    params.push(categorySlug);
  }
  if (search) {
    sql += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }
  if (excludeSlug) {
    sql += ' AND p.slug != ?';
    params.push(excludeSlug);
  }

  switch (sort) {
    case 'price_asc':
      sql += ' ORDER BY p.price ASC';
      break;
    case 'price_desc':
      sql += ' ORDER BY p.price DESC';
      break;
    default:
      sql += ' ORDER BY p.created_at DESC';
  }

  if (limit) {
    sql += ' LIMIT ?';
    params.push(Number(limit));
    if (offset) {
      sql += ' OFFSET ?';
      params.push(Number(offset));
    }
  }

  const [rows] = await pool.query(sql, params);
  return attachImagesToProducts(rows);
}

export async function findProductBySlug(slug, activeOnly = true) {
  let sql = `
    SELECT p.*, c.name AS category_name, c.slug AS category_slug
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE p.slug = ?
  `;
  if (activeOnly) {
    sql += ' AND p.is_active = TRUE AND c.is_active = TRUE';
  }
  const [rows] = await pool.query(sql, [slug]);
  if (!rows.length) return null;
  const images = await getProductImages(rows[0].id);
  return {
    ...rows[0],
    images,
    main_image: images.find((i) => i.is_main)?.image_url || images[0]?.image_url || null,
  };
}

export async function findProductById(id) {
  const [rows] = await pool.query(
    `SELECT p.*, c.name AS category_name, c.slug AS category_slug
     FROM products p JOIN categories c ON c.id = p.category_id WHERE p.id = ?`,
    [id]
  );
  if (!rows.length) return null;
  const images = await getProductImages(id);
  return { ...rows[0], images };
}
