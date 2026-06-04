/**
 * Fotos de stock por categoría cuando el producto aún no tiene imagen subida.
 * URLs estables de Unsplash (uso en demo / hasta cargar fotos reales en el panel).
 */
const CATEGORY_PHOTOS = {
  auriculares:
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=640&h=640&fit=crop&q=80',
  cargadores:
    'https://images.unsplash.com/photo-1591290619762-c588fafe69c2?w=640&h=640&fit=crop&q=80',
  cables:
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=640&h=640&fit=crop&q=80',
  accesorios:
    'https://images.unsplash.com/photo-1587825141308-601058ac0206?w=640&h=640&fit=crop&q=80',
};

const DEFAULT_PHOTO = CATEGORY_PHOTOS.accesorios;

export function getStockPhoto(categorySlug) {
  if (categorySlug && CATEGORY_PHOTOS[categorySlug]) {
    return CATEGORY_PHOTOS[categorySlug];
  }
  return DEFAULT_PHOTO;
}

export function resolveProductImageSrc(path, categorySlug) {
  if (path) {
    if (path.startsWith('http')) return path;
    return path.startsWith('/') ? path : `/${path}`;
  }
  return getStockPhoto(categorySlug);
}
