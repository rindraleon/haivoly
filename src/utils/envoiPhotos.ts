import type { PhotoBrouillon } from '@/components/CommonComponent/PhotosSelection';
import type { FichierPhoto } from '@/types';
import { preparerFichierPhoto } from '@/utils/photo';
import { logger } from '@/utils/logger';

export interface ResultatEnvoiPhotos {
  envoyees: number;
  echouees: number;
}

/**
 * Envoie les photos mises en attente à la création d'une intervention ou
 * d'une observation : compression systématique puis téléversement une à une
 * (l'ordre est préservé). Une photo en échec n'empêche pas les suivantes :
 * le bilan est remonté à l'appelant pour afficher un message clair.
 */
export async function envoyerPhotosEnAttente(
  photos: PhotoBrouillon[],
  upload: (fichier: FichierPhoto) => Promise<unknown>,
  onProgression?: (envoyees: number, total: number) => void,
): Promise<ResultatEnvoiPhotos> {
  let envoyees = 0;
  let echouees = 0;

  for (const photo of photos) {
    try {
      const fichier = await preparerFichierPhoto(photo.uri);
      await upload(fichier);
      envoyees += 1;
      onProgression?.(envoyees, photos.length);
    } catch (error) {
      echouees += 1;
      logger.warn('envoiPhotos', "Échec de l'envoi d'une photo jointe", error);
    }
  }

  return { envoyees, echouees };
}
