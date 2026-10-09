import { env } from '@/config/env';
import { retirerBarreFinale } from '@/utils/url';

export function getMediaUrl(url?: string | null): string {
  if (!url) {
    return '';
  }

  const baseUrl = retirerBarreFinale(env.apiUrl);

  if (!baseUrl) {
    return url;
  }

  // Chemin relatif venant de la base de données (`/uploads/…`).
  if (url.startsWith('/')) {
    return `${baseUrl}${url}`;
  }

  // Ancienne URL complète (`http://192.168.x.x:3000/uploads/…`) : on ne garde
  // que le chemin, l'hôte étant désormais celui de l'API configurée.
  try {
    const parsed = new URL(url);

    if (parsed.pathname.startsWith('/uploads/')) {
      return `${baseUrl}${parsed.pathname}`;
    }
  } catch {
    // URL invalide : on retombe sur la valeur d'origine.
  }

  return url;
}
