import type { FichierPhoto } from '@/types';

import { compresserImageSiBesoin } from './image';

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

export async function preparerFichierPhoto(uri: string): Promise<FichierPhoto> {
  const { uri: uriFinale } = await compresserImageSiBesoin(uri);
  return fichierDepuisUri(uriFinale);
}

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
