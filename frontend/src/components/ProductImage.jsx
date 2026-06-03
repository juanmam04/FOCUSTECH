import { useState } from 'react';
import { imageUrl, productPlaceholder } from '../utils/images';

export default function ProductImage({ path, name, alt, className, loading }) {
  const [failed, setFailed] = useState(false);
  const resolved = imageUrl(path);
  const src = failed || !resolved ? productPlaceholder(name) : resolved;

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
