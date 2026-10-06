/**
 * Photos locales : préparation d'un fichier pour le téléversement.
 *
 * `expo-image-picker` ne renvoie qu'une URI ; l'API attend un
 * `multipart/form-data` avec un nom de fichier et un type MIME. La déduction
 * vit ici pour que chaque écran n'ait pas sa propre heuristique.
 *
 * **La photo est compressée avant l'envoi** (`compresserImageSiBesoin`) : c'est
 * le seul point d'entrée des téléversements, donc aucune route ne peut
 * l'oublier.
 */
import type { FichierPhoto } from '@/types';

import { compresserImageSiBesoin } from './image';

/**
 * Étapes d'un envoi de photo, du point de vue de l'utilisateur.
 *
 * Elles sont **partagées** par les écrans (photos d'intervention, d'observation,
 * de récolte) pour que le retour visuel soit identique partout : « Compression… »
 * pendant le traitement local, « Envoi… » pendant le téléversement, rien une fois
 * terminé. L'état non terminal sert aussi de verrou anti double-envoi.
 */
export type EtapeEnvoiPhoto = 'inactif' | 'compression' | 'envoi';

/** Libellé affiché pour chaque étape. */
export const LIBELLE_ETAPE_ENVOI: Record<EtapeEnvoiPhoto, string> = {
  inactif: '',
  compression: 'Compression de la photo…',
  envoi: 'Envoi en cours…',
};

const MIME_PAR_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
};

/**
 * Prépare une photo choisie par l'utilisateur : compression raisonnée, puis
 * description du fichier attendue par `http.upload`.
 */
export async function preparerFichierPhoto(uri: string): Promise<FichierPhoto> {
  const { uri: uriFinale } = await compresserImageSiBesoin(uri);
  return fichierDepuisUri(uriFinale);
}

/**
 * Construit la description du fichier attendue par `http.upload`.
 *
 * Le serveur vérifie **le nom (extension) et le type MIME** : un fichier sans
 * extension (`…/photo`, chemin fréquent dans le cache iOS) serait refusé avec un
 * 415 alors que c'est une image. On normalise donc le nom sur l'extension
 * correspondant réellement au type déclaré.
 */
export function fichierDepuisUri(uri: string): FichierPhoto {
  const nomBrut = uri.split('/').pop()?.split('?')[0] ?? '';
  const extension = nomBrut.includes('.')
    ? nomBrut.split('.').pop()!.toLowerCase()
    : '';
  const mime = MIME_PAR_EXTENSION[extension];

  // Extension absente ou inconnue : on la déduit du type réellement envoyé.
  const nom = mime
    ? nomBrut
    : `${nomBrut || `photo-${Date.now()}`}.jpg`;

  return {
    uri,
    name: nom,
    type: mime ?? 'image/jpeg',
  };
}
