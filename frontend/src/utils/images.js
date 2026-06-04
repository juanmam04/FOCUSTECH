const UPLOADS_BASE = import.meta.env.VITE_UPLOADS_URL || '';

export function imageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${UPLOADS_BASE}${path}`;
}

export function productPlaceholder(name) {
  const label = (name || 'Producto').slice(0, 28);
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480" viewBox="0 0 480 480">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f0eef4"/>
          <stop offset="100%" stop-color="#e8e5ef"/>
        </linearGradient>
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#c026d3" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#e879f9" stop-opacity="0.15"/>
        </linearGradient>
      </defs>
      <rect fill="url(#bg)" width="480" height="480"/>
      <rect x="40" y="40" width="400" height="400" rx="32" fill="url(#accent)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
      <rect x="150" y="130" width="180" height="140" rx="20" fill="none" stroke="rgba(232,121,249,0.35)" stroke-width="2"/>
      <circle cx="240" cy="200" r="28" fill="rgba(192,38,211,0.2)" stroke="rgba(232,121,249,0.4)" stroke-width="1.5"/>
      <text x="240" y="330" text-anchor="middle" fill="#71717a" font-size="18" font-family="system-ui,sans-serif">${label.replace(/[<>&'"]/g, '')}</text>
    </svg>`
  )}`;
}
