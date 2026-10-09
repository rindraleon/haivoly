
/** Photo renvoyée par l'API. */
export interface Photo {
  id: string;
  /** URL absolue (le serveur normalise les chemins d'upload). */
  url: string;
  /** Horodatage ISO-8601. */
  dateAjout: string;
  description?: string | null;
}

export type PhotoObservation = Photo;
export type PhotoIntervention = Photo;
export type PhotoRecolte = Photo;

/** Fichier local prêt à téléverser (issu d'`expo-image-picker`). */
export interface FichierPhoto {
  uri: string;
  name: string;
  type: string;
}

/** Charge utile de création d'une photo (sans fichier). */
export interface PhotoPayload {
  url: string;
  description?: string | null;
}

