export const FALLBACK_EVENT_IMAGE =
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';

/**
 * Resolves an event imageUrl so it displays properly across all environments
 * (Vercel production, Render backend, local dev, Base64 uploads, or Web URLs).
 */
export function resolveImageUrl(url) {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return FALLBACK_EVENT_IMAGE;
  }

  const trimmed = url.trim();

  // Data URLs, Blobs, and Absolute Web URLs
  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  ) {
    return trimmed;
  }

  // Uploaded server assets: /uploads/...
  if (trimmed.startsWith('/uploads')) {
    const apiBase = import.meta.env.VITE_API_URL;
    if (apiBase && apiBase.trim()) {
      const serverOrigin = apiBase.trim().replace(/\/api\/?$/, '');
      return `${serverOrigin}${trimmed}`;
    }
    return trimmed;
  }

  // Relative public assets or local paths
  return trimmed;
}
