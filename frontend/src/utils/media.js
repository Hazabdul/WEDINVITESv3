export function normalizeMediaUrl(src = '') {
  if (!src || typeof src !== 'string') return '';
  if (src.startsWith('blob:')) return '';

  try {
    const url = new URL(src);
    if (url.protocol === 'http:' && /(?:^|\.)onrender\.com$/i.test(url.hostname)) {
      url.protocol = 'https:';
      return url.toString();
    }
    return src;
  } catch {
    return src;
  }
}

export function resolveMediaSource(item) {
  if (!item) return '';
  if (typeof item === 'string') return normalizeMediaUrl(item);
  if (typeof item === 'object') {
    return normalizeMediaUrl(item.src || item.url || item.image || item.path || item.poster || '');
  }
  return '';
}
