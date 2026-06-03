export function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
}

export async function ensureUniqueSlug(pool, table, baseSlug, excludeId = null) {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query =
      excludeId != null
        ? `SELECT id FROM ${table} WHERE slug = ? AND id != ?`
        : `SELECT id FROM ${table} WHERE slug = ?`;
    const params = excludeId != null ? [slug, excludeId] : [slug];
    const [rows] = await pool.query(query, params);
    if (rows.length === 0) return slug;
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
}
