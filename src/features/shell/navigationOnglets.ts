/**
 * Logique pure de la barre d'onglets permanente (V2). Sans React Native.
 *
 * La barre est rendue une seule fois par `AppLayout`, sous la pile : elle
 * reste visible sur les détails, formulaires et écrans communs. L'onglet en
 * surbrillance est l'onglet d'ORIGINE (celui du navigateur `(tabs)` resté sous
 * la pile) : un détail de culture ouvert depuis une parcelle garde « Parcelles »
 * actif, comme sur iOS et Android.
 */

export type NomOnglet = 'home' | 'parcelles' | 'cultures' | 'observations' | 'profil';

/** Ordre de la barre (décision du 14/10 : 5 onglets, sans bouton « + »). */
export const NOMS_ONGLETS: readonly NomOnglet[] = ['home', 'parcelles', 'cultures', 'observations', 'profil'];

/** URL publique de chaque onglet (le groupe `(tabs)` n'apparaît pas dans l'URL). */
export const HREF_ONGLET: Readonly<Record<NomOnglet, `/${NomOnglet}`>> = {
  home: '/home',
  parcelles: '/parcelles',
  cultures: '/cultures',
  observations: '/observations',
  profil: '/profil',
};

/** Forme minimale d'un état React Navigation (racine ou imbriqué). */
export interface EtatNavigation {
  index?: number;
  routes: readonly { name: string; state?: EtatNavigation }[];
}

const NOM_GROUPE_APP = '(app)';
const NOM_GROUPE_ONGLETS = '(tabs)';
/** Profondeur maximale explorée (expo-router enveloppe l'arbre dans `__root`). */
const PROFONDEUR_MAX = 4;

function estOnglet(nom: string | undefined): nom is NomOnglet {
  return (NOMS_ONGLETS as readonly string[]).includes(nom ?? '');
}

function routeFocalisee(etat: EtatNavigation | undefined) {
  if (!etat || etat.routes.length === 0) return undefined;
  const index = etat.index ?? etat.routes.length - 1;
  return etat.routes[Math.min(Math.max(index, 0), etat.routes.length - 1)];
}

/**
 * Route du groupe `(app)` sur le chemin focalisé. Expo Router enveloppe l'état
 * dans une route `__root` (état observé : `__root` → `(app)` → pile →
 * `(tabs)`) : on descend donc les routes focalisées jusqu'au groupe.
 */
function groupeAppFocalise(racine: EtatNavigation | undefined) {
  let etat = racine;
  for (let profondeur = 0; profondeur < PROFONDEUR_MAX && etat; profondeur += 1) {
    const route = routeFocalisee(etat);
    if (!route) return undefined;
    if (route.name === NOM_GROUPE_APP) return route;
    etat = route.state;
  }
  return undefined;
}

/** Chemin sans paramètres ni barre finale (`/detail-culture?id=1` → `/detail-culture`). */
function cheminNormalise(chemin: string): string {
  const sansRequete = chemin.split(/[?#]/)[0] ?? '';
  return sansRequete.length > 1 ? sansRequete.replace(/\/+$/, '') : sansRequete;
}

/** Onglet dont le chemin est la racine (`/cultures` → `cultures`). */
export function ongletDuChemin(chemin: string): NomOnglet | null {
  const nom = cheminNormalise(chemin).replace(/^\//, '');
  return estOnglet(nom) ? nom : null;
}

/**
 * Famille d'un écran empilé, quand l'onglet d'origine est inconnu (ouverture
 * par lien profond, état pas encore restauré).
 */
const FAMILLES: readonly [RegExp, NomOnglet][] = [
  [/^\/(detail|ajout|modifier|delimiter)-parcelle$|^\/historique-parcelles$|^\/confirmation-suppression$/, 'parcelles'],
  [
    /^\/(detail|ajout|modifier|delimiter)-culture$|^\/historique-cultures$|^\/(ajout-recolte|recoltes)$|^\/(ajout|modifier)-intervention$|^\/interventions-culture$/,
    'cultures',
  ],
  [/^\/(ajout|modifier)-observation$/, 'observations'],
  [/^\/notifications$/, 'home'],
  [/^\/(modifier-profil|langue|theme)$/, 'profil'],
];

export function ongletParFamille(chemin: string): NomOnglet | null {
  const normalise = cheminNormalise(chemin);
  return FAMILLES.find(([motif]) => motif.test(normalise))?.[1] ?? null;
}

export interface PositionOnglets {
  /** Onglet à mettre en surbrillance (`null` si aucun ne correspond). */
  onglet: NomOnglet | null;
  /** Vrai sur la racine d'un onglet ; faux sur un écran empilé au-dessus. */
  surOnglet: boolean;
}

/**
 * Onglet actif à partir de l'état de navigation racine et du chemin courant.
 * Le chemin sert de repli quand l'état n'est pas (encore) disponible.
 */
export function positionOnglets(racine: EtatNavigation | undefined, chemin: string): PositionOnglets {
  const ongletChemin = ongletDuChemin(chemin);
  const repli: PositionOnglets = {
    onglet: ongletChemin ?? ongletParFamille(chemin),
    surOnglet: ongletChemin !== null,
  };

  const app = groupeAppFocalise(racine);
  if (!app?.state) return repli;

  const focalisee = routeFocalisee(app.state);
  if (!focalisee) return repli;

  if (focalisee.name === NOM_GROUPE_ONGLETS) {
    const onglet = routeFocalisee(focalisee.state)?.name;
    return { onglet: estOnglet(onglet) ? onglet : (ongletChemin ?? 'home'), surOnglet: true };
  }

  // Écran empilé : l'onglet d'origine est celui resté ouvert sous la pile.
  const onglets = app.state.routes.find((route) => route.name === NOM_GROUPE_ONGLETS);
  const origine = routeFocalisee(onglets?.state)?.name;
  return { onglet: estOnglet(origine) ? origine : ongletParFamille(chemin), surOnglet: false };
}

export type ActionOnglet =
  /** Déjà sur la racine de cet onglet : rien à faire. */
  | { type: 'aucune' }
  /** Sur un onglet : changer d'onglet, sans rien empiler. */
  | { type: 'changer'; href: `/${NomOnglet}` }
  /** Sur un écran empilé : dépiler jusqu'aux onglets, puis afficher la cible. */
  | { type: 'revenir'; href: `/${NomOnglet}` };

/**
 * Effet d'un appui sur un onglet. Depuis un écran empilé, l'appui ramène
 * toujours à la racine de l'onglet visé (y compris l'onglet d'origine) : le
 * retour reste prévisible et la pile ne grossit jamais.
 */
export function actionPourOnglet(cible: NomOnglet, position: PositionOnglets): ActionOnglet {
  if (!position.surOnglet) return { type: 'revenir', href: HREF_ONGLET[cible] };
  if (position.onglet === cible) return { type: 'aucune' };
  return { type: 'changer', href: HREF_ONGLET[cible] };
}
