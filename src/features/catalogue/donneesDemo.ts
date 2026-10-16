import type { Culture, Intervention, Observation, Parcelle, PointGPS, Recolte } from '@/types';

/**
 * Jeu de démonstration (catalogue UI et pitch) : parcelles des Hautes Terres.
 * Données fictives, jamais envoyées au serveur.
 */
export const PARCELLES_DEMO = [
  {
    id: 'demo-1',
    nom: 'Rizière Ambohidratrimo',
    meta: '1,20 ha · 2 cultures',
    points: [
      { latitude: -18.8001, longitude: 47.4501, ordre: 1 },
      { latitude: -18.7998, longitude: 47.4516, ordre: 2 },
      { latitude: -18.8009, longitude: 47.4524, ordre: 3 },
      { latitude: -18.8016, longitude: 47.4507, ordre: 4 },
    ],
  },
  {
    id: 'demo-2',
    nom: 'Champ de manioc Andranovelona',
    meta: '0,80 ha · 1 culture',
    points: [] as { latitude: number; longitude: number; ordre?: number }[],
  },
];

export const RECOMMANDATIONS_DEMO = [
  {
    id: 'r1',
    title: 'Traitement contre la pyriculture',
    message: 'Appliquer le traitement sur la rizière avant jeudi, tôt le matin.',
    priority: 'HIGH' as const,
    kind: 'WARNING' as const,
    unread: true,
    date: '14/10/2026',
  },
  {
    id: 'r2',
    title: 'Réunion de la coopérative samedi',
    message: 'Rendez-vous à 9 h au magasin de Behenjy pour la collecte.',
    priority: 'MEDIUM' as const,
    kind: 'INFO' as const,
    unread: false,
    date: '12/10/2026',
  },
];

// ── Recette des écrans Parcelles V2 (lot 2) ──────────────────────────────
// Entités complètes au format de l'API (dont `nombreCultures`, renvoyé par
// GET /parcelles avec le patch backend), injectées dans un cache React Query
// isolé (jamais dans celui de l'application, jamais envoyées au serveur).

const MODELE_PARCELLE: Pick<Parcelle, 'utilisateurId' | 'latitude' | 'longitude' | 'creeA'> = {
  utilisateurId: 'demo-utilisateur',
  latitude: null,
  longitude: null,
  creeA: '2026-03-02T07:30:00.000Z',
};

function contour(latitude: number, longitude: number, decalages: [number, number][]): PointGPS[] {
  return decalages.map(([dLat, dLon], index) => ({
    latitude: latitude + dLat,
    longitude: longitude + dLon,
    ordre: index + 1,
  }));
}

/** Date AAAA-MM-JJ décalée de n jours par rapport à aujourd'hui : les textes
 * relatifs (« dans 5 jours », « en retard de 6 jours ») restent stables. */
function dansJours(n: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + n);
  return date.toISOString().slice(0, 10);
}

export const PARCELLES_RECETTE: Parcelle[] = [
  {
    ...MODELE_PARCELLE,
    id: 'demo-p1',
    nombreCultures: 4,
    nom: 'Rizière Ambohidratrimo',
    superficie: 12_040,
    typeSol: 'Humifère',
    description: 'Irrigation par canal, accès par la piste nord.',
    statut: 'ACTIVE',
    modifieA: '2026-10-13T16:20:00.000Z',
    pointsGPS: contour(-18.8001, 47.4501, [
      [0, 0],
      [0.0003, 0.0015],
      [-0.0008, 0.0023],
      [-0.0015, 0.0006],
    ]),
  },
  {
    ...MODELE_PARCELLE,
    id: 'demo-p2',
    nombreCultures: 0,
    nom: 'Tanety Andranovelona',
    superficie: null,
    typeSol: 'Latéritique',
    description: null,
    statut: 'ACTIVE',
    modifieA: '2026-10-14T06:05:00.000Z',
    pointsGPS: [],
    // Créée hors ligne : en attente de synchronisation (F-24).
    _localOnly: true,
    _syncStatus: 'PENDING',
  },
  {
    ...MODELE_PARCELLE,
    id: 'demo-p3',
    nombreCultures: 2,
    nom: 'Bas-fond d’Ambatolampy',
    superficie: 25_310,
    typeSol: 'Argileux',
    description: 'Inondable en février, contre-saison possible.',
    statut: 'ACTIVE',
    modifieA: '2026-10-09T10:00:00.000Z',
    pointsGPS: contour(-19.385, 47.426, [
      [0, 0],
      [0.0009, 0.0011],
      [0.0002, 0.0027],
      [-0.0012, 0.0021],
      [-0.0010, 0.0004],
    ]),
  },
  {
    ...MODELE_PARCELLE,
    id: 'demo-p4',
    nombreCultures: 1,
    nom: 'Pépinière de Mahitsy',
    superficie: 860,
    typeSol: 'Humifère',
    description: null,
    statut: 'ACTIVE',
    modifieA: '2026-10-11T08:45:00.000Z',
    pointsGPS: contour(-18.758, 47.36, [
      [0, 0],
      [0.0002, 0.0003],
      [-0.0001, 0.0005],
      [-0.0003, 0.0002],
    ]),
    _syncStatus: 'FAILED',
  },
  {
    ...MODELE_PARCELLE,
    id: 'demo-p5',
    nombreCultures: 0,
    nom: 'Champ de manioc Arivonimamo',
    superficie: 15_000,
    typeSol: 'Sableux',
    description: 'Laissé en jachère après la saison 2025.',
    statut: 'ABANDONNEE',
    modifieA: '2026-08-21T09:00:00.000Z',
    pointsGPS: contour(-19.02, 47.18, [
      [0, 0],
      [0.0011, 0.0009],
      [-0.0004, 0.0019],
    ]),
  },
  {
    ...MODELE_PARCELLE,
    id: 'demo-p6',
    nombreCultures: 3,
    nom: 'Verger d’Antsirabe',
    superficie: 6_400,
    typeSol: 'Volcanique',
    description: null,
    statut: 'ARCHIVEE',
    modifieA: '2026-05-30T09:00:00.000Z',
    pointsGPS: contour(-19.866, 47.033, [
      [0, 0],
      [0.0005, 0.0008],
      [-0.0002, 0.0014],
      [-0.0007, 0.0005],
    ]),
  },
];

const MODELE_CULTURE: Pick<Culture, 'description' | 'stade' | 'pointsGPS' | 'creeA' | 'modifieA'> = {
  description: null,
  stade: null,
  pointsGPS: [],
  creeA: '2026-03-02T07:30:00.000Z',
  modifieA: '2026-10-01T07:30:00.000Z',
};

export const CULTURES_RECETTE: Record<string, Culture[]> = {
  'demo-p1': [
    {
      ...MODELE_CULTURE,
      id: 'demo-c1',
      nom: 'Riz',
      type: 'Céréale',
      variete: 'X265',
      datePlantation: dansJours(-88),
      datePrevueRecolte: dansJours(5),
      statut: 'EN_COURS',
      parcelleId: 'demo-p1',
    },
    {
      ...MODELE_CULTURE,
      id: 'demo-c2',
      nom: 'Haricot',
      type: 'Légumineuse',
      variete: 'Ranjonomby',
      datePlantation: '2026-09-02',
      datePrevueRecolte: '2026-11-28',
      statut: 'EN_COURS',
      parcelleId: 'demo-p1',
    },
    {
      ...MODELE_CULTURE,
      id: 'demo-c3',
      nom: 'Maïs',
      type: 'Céréale',
      variete: null,
      datePlantation: '2026-11-05',
      datePrevueRecolte: '2027-02-20',
      statut: 'PLANIFIEE',
      parcelleId: 'demo-p1',
    },
    {
      ...MODELE_CULTURE,
      id: 'demo-c4',
      nom: 'Pomme de terre',
      type: 'Tubercule',
      variete: 'Spunta',
      datePlantation: '2026-03-10',
      datePrevueRecolte: '2026-06-15',
      statut: 'RECOLTEE',
      parcelleId: 'demo-p1',
    },
  ],
};

// ── Recette des écrans Cultures V2 (lot 3) ───────────────────────────────
// Cultures de plusieurs parcelles, au format de `GET /cultures` (relations
// `parcelle` et `recolte`), couvrant chaque puce : en croissance, prête à
// récolter, alerte (retard, échec d'envoi, dates manquantes), planifiée,
// récoltée, abandonnée, supprimée, créée hors ligne.
function parcelleDe(id: string): Culture['parcelle'] {
  const parcelle = PARCELLES_RECETTE.find((item) => item.id === id);
  return parcelle
    ? {
        id: parcelle.id,
        nom: parcelle.nom,
        superficie: parcelle.superficie,
        latitude: parcelle.latitude,
        longitude: parcelle.longitude,
        statut: parcelle.statut,
      }
    : undefined;
}

/** Récolte de la pomme de terre (culture récoltée du jeu). */
const RECOLTE_POMME_DE_TERRE: NonNullable<Culture['recolte']> = {
  id: 'demo-r4',
  dateRecolte: '2026-06-12',
  quantite: 1850,
  unite: 'kg',
  description: 'Calibre moyen, bonne tenue.',
  prixVente: 2_590_000,
  coutRecolte: 180_000,
  cultureId: 'demo-c4',
};

export const CULTURES_COMPTE_RECETTE: Culture[] = [
  ...(CULTURES_RECETTE['demo-p1'] ?? []).map((culture) => ({
    ...culture,
    parcelle: parcelleDe('demo-p1'),
    recolte: culture.id === 'demo-c4' ? RECOLTE_POMME_DE_TERRE : null,
  })),
  {
    ...MODELE_CULTURE,
    id: 'demo-c5',
    nom: 'Riz de contre-saison',
    type: 'Céréale',
    variete: 'Makalioka',
    datePlantation: '2026-06-20',
    datePrevueRecolte: dansJours(-6),
    statut: 'EN_COURS',
    parcelleId: 'demo-p3',
    parcelle: parcelleDe('demo-p3'),
    modifieA: '2026-10-12T09:00:00.000Z',
  },
  {
    ...MODELE_CULTURE,
    id: 'demo-c6',
    nom: 'Manioc',
    type: 'Tubercule',
    variete: null,
    datePlantation: '2026-04-10',
    datePrevueRecolte: null,
    statut: 'EN_COURS',
    parcelleId: 'demo-p3',
    parcelle: parcelleDe('demo-p3'),
  },
  {
    ...MODELE_CULTURE,
    id: 'demo-c7',
    nom: 'Tomate',
    type: 'Légume',
    variete: 'Roma',
    datePlantation: '2026-11-20',
    datePrevueRecolte: '2027-02-15',
    statut: 'PLANIFIEE',
    parcelleId: 'demo-p4',
    parcelle: parcelleDe('demo-p4'),
    // Saisie hors ligne refusée par le serveur.
    _syncStatus: 'FAILED',
  },
  {
    ...MODELE_CULTURE,
    id: 'demo-c8',
    nom: 'Arachide',
    type: 'Légumineuse',
    variete: null,
    datePlantation: '2026-02-01',
    datePrevueRecolte: '2026-06-01',
    statut: 'ABANDONNEE',
    parcelleId: 'demo-p3',
    parcelle: parcelleDe('demo-p3'),
    description: 'Semis détruit par la grêle de mars.',
  },
  {
    ...MODELE_CULTURE,
    id: 'demo-c9',
    nom: 'Blé',
    type: 'Céréale',
    variete: null,
    datePlantation: '2026-05-02',
    datePrevueRecolte: '2026-09-01',
    statut: 'SUPPRIMEE',
    parcelleId: 'demo-p4',
    parcelle: parcelleDe('demo-p4'),
    raisonSuppression: 'Saisie en double.',
  },
  {
    ...MODELE_CULTURE,
    id: 'demo-c10',
    nom: 'Voanjobory',
    type: 'Légumineuse',
    variete: null,
    datePlantation: '2026-10-01',
    datePrevueRecolte: '2027-01-10',
    statut: 'EN_COURS',
    parcelleId: 'demo-p1',
    // Créée hors ligne : pas encore de relation `parcelle` (nom lu dans le cache des parcelles).
    _localOnly: true,
    _syncStatus: 'PENDING',
  },
];

export const INTERVENTIONS_RECETTE: Record<string, Intervention[]> = {
  'demo-c1': [
    {
      id: 'demo-i1',
      type: 'TRAITEMENT',
      description: 'Prévention pyriculture',
      date: '2026-10-16T05:30:00.000Z',
      produit: 'Fongicide',
      quantite: 2,
      unite: 'L',
      cout: 45_000,
      statut: 'PLANIFIEE',
      cultureId: 'demo-c1',
      creeA: '2026-10-12T05:30:00.000Z',
      modifieA: '2026-10-12T05:30:00.000Z',
    },
    {
      id: 'demo-i2',
      type: 'IRRIGATION',
      description: null,
      date: '2026-10-10T06:00:00.000Z',
      produit: null,
      quantite: null,
      unite: null,
      cout: null,
      statut: 'TERMINEE',
      cultureId: 'demo-c1',
      creeA: '2026-10-10T06:00:00.000Z',
      modifieA: '2026-10-10T06:00:00.000Z',
    },
    {
      id: 'demo-i3',
      type: 'FERTILISATION',
      description: 'Apport de fond',
      date: '2026-09-12T07:00:00.000Z',
      produit: 'NPK 11-22-16',
      quantite: 50,
      unite: 'kg',
      cout: 120_000,
      statut: 'TERMINEE',
      cultureId: 'demo-c1',
      creeA: '2026-09-12T07:00:00.000Z',
      modifieA: '2026-09-12T07:00:00.000Z',
    },
    {
      id: 'demo-i4',
      type: 'DESHERBAGE',
      description: null,
      date: '2026-08-20T07:00:00.000Z',
      produit: null,
      quantite: null,
      unite: null,
      cout: 30_000,
      statut: 'TERMINEE',
      cultureId: 'demo-c1',
      creeA: '2026-08-20T07:00:00.000Z',
      modifieA: '2026-08-20T07:00:00.000Z',
    },
  ],
  'demo-c5': [
    {
      id: 'demo-i5',
      type: 'IRRIGATION',
      description: null,
      date: '2026-09-28T06:00:00.000Z',
      produit: null,
      quantite: null,
      unite: null,
      cout: null,
      statut: 'TERMINEE',
      cultureId: 'demo-c5',
      creeA: '2026-09-28T06:00:00.000Z',
      modifieA: '2026-09-28T06:00:00.000Z',
    },
  ],
};

export const OBSERVATIONS_RECETTE: Record<string, Observation[]> = {
  'demo-c1': [
    {
      id: 'demo-o1',
      description: 'Panicules bien formées, grains en phase laiteuse sur la moitié de la parcelle.',
      date: '2026-10-13T07:15:00.000Z',
      cultureId: 'demo-c1',
      photos: [
        { id: 'demo-ph1', url: '/uploads/observations/demo-1.jpg', dateAjout: '2026-10-13T07:16:00.000Z' },
        { id: 'demo-ph2', url: '/uploads/observations/demo-2.jpg', dateAjout: '2026-10-13T07:16:30.000Z' },
      ],
    },
    {
      id: 'demo-o2',
      description: 'Quelques taches brunes sur les feuilles côté canal : surveiller la pyriculture.',
      date: '2026-10-08T06:40:00.000Z',
      cultureId: 'demo-c1',
      photos: [],
    },
    {
      id: 'demo-o3',
      description: 'Niveau d’eau correct après l’irrigation, 5 cm dans les casiers.',
      date: '2026-09-30T06:10:00.000Z',
      cultureId: 'demo-c1',
      photos: [],
    },
    {
      id: 'demo-o4',
      description: 'Tallage homogène, reprise après repiquage satisfaisante.',
      date: '2026-08-05T08:00:00.000Z',
      cultureId: 'demo-c1',
      photos: [],
    },
  ],
};

/** Tracé de la rizière (culture demo-c1), à l'intérieur de la parcelle demo-p1. */
export const POINTS_CULTURES_RECETTE: Record<string, PointGPS[]> = {
  'demo-c1': contour(-18.8003, 47.4504, [
    [0, 0],
    [0.0002, 0.0009],
    [-0.0005, 0.0014],
    [-0.0009, 0.0004],
  ]),
};

/** Récoltes par culture pour la recette du suivi unifié (lot 4). */
export const RECOLTES_RECETTE: Record<string, Recolte> = {
  'demo-c2': {
    id: 'demo-r1',
    dateRecolte: '2026-09-28',
    quantite: 420,
    unite: 'kg',
    description: 'Récolte de fin de cycle, grains bien remplis.',
    prixVente: 3800,
    coutRecolte: 210,
    cultureId: 'demo-c2',
    _syncStatus: 'SYNCED',
  } as Recolte,
};
