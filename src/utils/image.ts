/**
 * Compression des photos **avant téléversement**.
 *
 * Une photo prise au téléphone pèse 3 à 8 Mo ; compressée selon les règles de
 * `image.regles.ts` elle pèse 200 à 600 Ko **sans différence visible**, ce qui
 * économise l'espace disque du serveur, le quota réseau de l'utilisateur (souvent
 * en données mobiles) et le temps d'envoi.
 *
 * Garanties :
 *   • jamais d'agrandissement, jamais de recadrage, orientation conservée ;
 *   • une image déjà optimisée (JPEG ≤ 1920 px et ≤ 300 Ko) n'est **pas**
 *     ré-encodée : zéro perte de qualité ;
 *   • en cas d'échec du compresseur, **l'original est envoyé** — la compression
 *     ne peut pas bloquer une fonctionnalité ;
 *   • le résultat est toujours un fichier local exploitable par
 *     `multipart/form-data` (nom et type MIME déduits de l'extension).
 */
import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';


import {
  calculerDimensions,
  doitRecompresser,
  extensionDuFichier,
  QUALITE_JPEG,
  resumeCompression,
  type MetaImage,
  type ResultatCompression,
} from './image.regles';
import { logger } from '@/utils/logger';

/** Poids d'un fichier local, `null` si illisible (autorisations, fichier absent). */
function tailleDuFichier(uri: string): number | null {
  try {
    const fichier = new File(uri);
    return fichier.exists ? fichier.size : null;
  } catch {
    return null;
  }
}

/**
 * Compresse la photo si ses caractéristiques le justifient.
 *
 * Ne lève jamais : en cas d'échec de la manipulation (format exotique, mémoire
 * insuffisante), l'URI d'origine est renvoyée avec `compressee: false`.
 */
export async function compresserImageSiBesoin(uri: string): Promise<ResultatCompression> {
  const octets = tailleDuFichier(uri);
  const extension = extensionDuFichier(uri);

  try {
    // Un seul décodage : `renderAsync` donne les dimensions et un `ImageRef`
    // réutilisable pour le redimensionnement éventuel.
    const rendu = await ImageManipulator.manipulate(uri).renderAsync();
    const meta: MetaImage = {
      largeur: rendu.width,
      hauteur: rendu.height,
      octets,
      extension,
    };

    if (!doitRecompresser(meta)) {
      logger.debug('image', `Photo conservée telle quelle (${extension}, ${rendu.width}×${rendu.height})`);
      return {
        uri,
        ...meta,
        compressee: false,
        octetsAvant: octets,
      };
    }

    const cible = calculerDimensions(rendu.width, rendu.height);
    const redimensionne =
      cible.width === rendu.width && cible.height === rendu.height
        ? rendu
        : await ImageManipulator.manipulate(rendu)
            .resize({ width: cible.width, height: cible.height })
            .renderAsync();

    const resultat = await redimensionne.saveAsync({
      compress: QUALITE_JPEG,
      format: SaveFormat.JPEG,
    });

    const compressee: ResultatCompression = {
      uri: resultat.uri,
      largeur: resultat.width,
      hauteur: resultat.height,
      octets: tailleDuFichier(resultat.uri),
      extension: 'jpg',
      compressee: true,
      octetsAvant: octets,
    };

    logger.debug('image', `Photo compressée : ${resumeCompression(compressee)}`);
    return compressee;
  } catch (erreur) {
    // Le téléversement reste possible : on n'échoue jamais pour une compression.
    logger.warn('image', 'Compression impossible, envoi du fichier original', erreur);
    return {
      uri,
      largeur: null,
      hauteur: null,
      octets,
      extension,
      compressee: false,
      octetsAvant: octets,
    };
  }
}
