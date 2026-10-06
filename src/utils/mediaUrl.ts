import { api } from '@/api/client';

export function getMediaUrl(url?: string | null): string {
  if (!url) {
    return '';
  }

  const baseURL =
    api.defaults.baseURL?.replace(/\/+$/, '') ?? '';

  if (!baseURL) {
    return url;
  }

  // URL relative venant de la base
  if (url.startsWith('/')) {
    return `${baseURL}${url}`;
  }

  // Ancienne URL complète :
  // http://192.168.x.x:3000/uploads/...
  // On récupère seulement le chemin /uploads/...
  try {
    const parsed = new URL(url);

    if (parsed.pathname.startsWith('/uploads/')) {
      return `${baseURL}${parsed.pathname}`;
    }
  } catch {
    // URL invalide : on continue avec le traitement ci-dessous
  }

  return url;
}