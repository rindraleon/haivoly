/**
 * Photos locales : préparation d'un fichier pour le téléversement.
 *
 * `expo-image-picker` ne renvoie qu'une URI ; l'API attend un
 * `multipart/form-data` avec un nom de fichier et un type MIME. La déduction
 * vit ici pour que chaque écran n'ait pas sa propre heuristique.
 */
import type { FichierPhoto } from '@/types';

const MIME_PAR_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
};

/** Construit la description du fichier attendue par `http.upload`. */
export function fichierDepuisUri(uri: string): FichierPhoto {
  const nom = uri.split('/').pop()?.split('?')[0] || `photo-${Date.now()}.jpg`;
  const extension = nom.split('.').pop()?.toLowerCase() ?? 'jpg';

  return {
    uri,
    name: nom,
    type: MIME_PAR_EXTENSION[extension] ?? 'image/jpeg',
  };
}
