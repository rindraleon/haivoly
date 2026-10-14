import { useCallback, useState } from 'react';

import { getCurrentLocation, type GPSPosition } from '@/services';

export interface CapturePosition {
  /** Relève la position courante du téléphone (permission + GPS gérés en amont). */
  capturer: () => Promise<GPSPosition>;
  /** Vrai pendant l'acquisition, pour désactiver le bouton et afficher un état. */
  enCours: boolean;
}

/**
 * Encapsule l'acquisition d'un point GPS pour la délimitation d'une parcelle.
 * Les erreurs remontent au composant appelant (message déjà traduit par `ErreurGPS`).
 */
export function useCapturePosition(): CapturePosition {
  const [enCours, setEnCours] = useState(false);

  const capturer = useCallback(async () => {
    setEnCours(true);
    try {
      return await getCurrentLocation();
    } finally {
      setEnCours(false);
    }
  }, []);

  return { capturer, enCours };
}
