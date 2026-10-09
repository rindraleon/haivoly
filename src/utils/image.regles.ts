export const DIMENSION_MAX_PX = 1920;
export const QUALITE_JPEG = 0.82;
/** En dessous de ce poids, une JPEG n'est pas ré-encodée. */
export const OCTETS_SANS_RECOMPRESSION = 300 * 1024;

const EXTENSIONS_JPEG = ['jpg', 'jpeg'];

export interface MetaImage {
  largeur: number | null;
  hauteur: number | null;
  /** Poids du fichier sur le disque, `null` si illisible. */
  octets: number | null;
  /** Extension sans le point, en minuscules (`jpg`, `heic`…). */
  extension: string;
}

export interface ResultatCompression extends MetaImage {
  /** URI du fichier à téléverser (compressé, ou l'original si inutile/échec). */
  uri: string;
  compressee: boolean;
  /** Poids avant compression, pour la journalisation et les mesures. */
  octetsAvant: number | null;
}

/** Extension d'un chemin ou d'une URI, sans paramètres de requête. */
export function extensionDuFichier(uri: string): string {
  const sansParametres = uri.split('?')[0];
  const nom = sansParametres.split('/').pop() ?? '';
  const point = nom.lastIndexOf('.');

  if (point <= 0 || point === nom.length - 1) return '';
  return nom.slice(point + 1).toLowerCase();
}

export function calculerDimensions(
  largeur: number,
  hauteur: number,
  max: number = DIMENSION_MAX_PX,
): { width: number; height: number } {
  if (largeur <= 0 || hauteur <= 0) return { width: largeur, height: hauteur };

  const plusGrandCote = Math.max(largeur, hauteur);
  if (plusGrandCote <= max) return { width: largeur, height: hauteur };

  const ratio = max / plusGrandCote;
  return {
    width: Math.max(1, Math.round(largeur * ratio)),
    height: Math.max(1, Math.round(hauteur * ratio)),
  };
}

export function doitRecompresser(meta: MetaImage): boolean {
  const estJpeg = EXTENSIONS_JPEG.includes(meta.extension);

  if (!estJpeg) return true;

  if (meta.largeur === null || meta.hauteur === null) return true;
  if (Math.max(meta.largeur, meta.hauteur) > DIMENSION_MAX_PX) return true;

  if (meta.octets === null) return true;
  return meta.octets > OCTETS_SANS_RECOMPRESSION;
}

/** Réduction en pourcentage, arrondie (« 84 % d'espace économisé »). */
export function pourcentageGain(avant: number | null, apres: number | null): number | null {
  if (!avant || avant <= 0 || apres === null) return null;
  if (apres >= avant) return 0;
  return Math.round((1 - apres / avant) * 100);
}

/** Ligne de journal, lisible en développement. */
export function resumeCompression(resultat: ResultatCompression): string {
  const gain = pourcentageGain(resultat.octetsAvant, resultat.octets);
  const poids =
    gain === null
      ? 'poids inconnu'
      : `${Math.round((resultat.octetsAvant ?? 0) / 1024)} Ko → ${Math.round(
          (resultat.octets ?? 0) / 1024,
        )} Ko (−${gain} %)`;

  return `${resultat.largeur}×${resultat.hauteur} · ${poids}`;
}
