import { getDistance } from 'geolib';

export interface PositionGPS {
  latitude: number;
  longitude: number;
}

export interface VilleMadagascar {
  nom: string;
  latitude: number;
  longitude: number;
}

export const VILLES_MADAGASCAR: VilleMadagascar[] = [
  { nom: 'Antananarivo', latitude: -18.8792, longitude: 47.5079 },
  { nom: 'Antsirabe', latitude: -19.8659, longitude: 47.0325 },
  { nom: 'Ambatolampy', latitude: -19.3815, longitude: 47.4322 },
  { nom: 'Toamasina', latitude: -18.1443, longitude: 49.3958 },
  { nom: 'Mahajanga', latitude: -15.7167, longitude: 46.3167 },
  { nom: 'Fianarantsoa', latitude: -21.4531, longitude: 47.0857 },
  { nom: 'Toliara', latitude: -23.35, longitude: 43.6667 },
  { nom: 'Antsiranana', latitude: -12.3135, longitude: 49.2901 },
  { nom: 'Taolagnaro', latitude: -25.0324, longitude: 46.9988 },
  { nom: 'Morondava', latitude: -20.2934, longitude: 44.2635 },
  { nom: 'Ambatondrazaka', latitude: -17.8333, longitude: 48.4167 },
  { nom: 'Moramanga', latitude: -18.9486, longitude: 48.2227 },
  { nom: 'Sambava', latitude: -14.2667, longitude: 50.1667 },
  { nom: 'Nosy Be', latitude: -13.4, longitude: 48.27 },
  { nom: 'Manakara', latitude: -22.1477, longitude: 48.0104 },
  { nom: 'Farafangana', latitude: -22.8167, longitude: 47.8167 },
  { nom: 'Maintirano', latitude: -18.0667, longitude: 44.0167 },
  { nom: 'Ambovombe', latitude: -25.1749, longitude: 46.0918 },
  { nom: 'Ihosy', latitude: -22.4046, longitude: 46.1284 },
  { nom: 'Miandrivazo', latitude: -19.5294, longitude: 45.4624 },
  { nom: 'Maroantsetra', latitude: -15.4339, longitude: 49.7374 },
  { nom: 'Antalaha', latitude: -14.9, longitude: 50.2833 },
  { nom: 'Ambanja', latitude: -13.6667, longitude: 48.45 },
  { nom: 'Ambilobe', latitude: -13.2, longitude: 49.05 },
  { nom: 'Betioky', latitude: -23.69, longitude: 44.4 },
  { nom: 'Ambalavao', latitude: -21.82, longitude: 46.94 },
  { nom: 'Vangaindrano', latitude: -23.35, longitude: 47.6 },
  { nom: 'Ankazobe', latitude: -18.32, longitude: 47.12 },
  { nom: 'Soavinandriana', latitude: -19.16, longitude: 46.74 },
  { nom: 'Brickaville', latitude: -18.8167, longitude: 49.0667 },
];

/** Distance en mètres entre deux positions. */
export function distanceEntre(
  a: PositionGPS,
  b: PositionGPS,
): number {
  return getDistance(
    { latitude: a.latitude, longitude: a.longitude },
    { latitude: b.latitude, longitude: b.longitude },
  );
}

/** Ville de Madagascar la plus proche d'une position donnée. */
export function villeLaPlusProche(position: PositionGPS): VilleMadagascar {
  return VILLES_MADAGASCAR.reduce((plusProche, ville) => {
    const distance = distanceEntre(position, ville);
    const distanceActuelle = distanceEntre(position, plusProche);

    return distance < distanceActuelle ? ville : plusProche;
  }, VILLES_MADAGASCAR[0]);
}