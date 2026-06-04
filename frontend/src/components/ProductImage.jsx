import { useState } from 'react';
import { imageUrl } from '../utils/images';
import { getStockPhoto, resolveProductImageSrc } from '../utils/productStockImages';

export default function ProductImage({ path, name, alt, className, loading, categorySlug }) {
  const [failed, setFailed] = useState(false);
  const resolved = imageUrl(path);
  const stockFallback = getStockPhoto(categorySlug);
  const src = failed
    ? stockFallback
    : (resolved || resolveProductImageSrc(null, categorySlug));

  return (
    <img
      src={src}
      alt={alt || name}
      className={className}
      loading={loading}
      onError={() => setFailed(true)}
    />
  );
}
