# Haivoly — application mobile (Expo / React Native)

Application de gestion agricole : parcelles, cultures, interventions,
observations, récoltes et recommandations, avec **fonctionnement hors-ligne**
et synchronisation idempotente vers l'API NestJS.

---

## 1. Démarrage

```bash
npm install
cp .env.example .env      # renseigner EXPO_PUBLIC_API_URL
npx expo start            # QR code Expo Go / simulateur
```

> L'URL de l'API **n'est jamais codée en dur** : elle vient de
> `EXPO_PUBLIC_API_URL` (`src/config/env.ts`), avec repli en développement sur
> l'hôte du bundler Expo.

La configuration Expo vit dans **`app.config.ts`** (SDK 57, `expo` épinglé à
`57.0.15`) : nom `Haivoly`, slug `haivoly`, schéma d'URL `haivoly`, plugins et
routes typées. `android.edgeToEdgeEnabled` n'y figure pas : l'affichage
bord-à-bord est le comportement par défaut depuis le SDK 54.

### Vérifications

```bash
npx tsc --noEmit                      # typage strict : 0 erreur
npm run lint                          # ESLint + Prettier : 0 erreur / 0 avertissement
npm test                              # Jest : 6 suites / 41 tests (logique pure)
npm run sonar                         # SonarJS : 0 erreur, 3 avertissements
npm run verifier:api                  # appels mobile ↔ routes du backend
npm run verifier:routes               # fichiers de src/app courts, sans logique,
                                      # routes réellement atteignables
npx expo export --platform android    # bundle Metro complet (7,3 Mo)
```

---

## 2. Architecture

```
src/
├── app/                    32 fichiers de route (120 lignes au total)
│   ├── (auth)/             login, register, forgot-password, reset-password
│   ├── (app)/(parcelles)/  liste, ajout, modification, détail, délimitation, historique
│   ├── (app)/(cultures)/   liste, ajout, modification, détail, délimitation, historique
│   ├── (app)/(interventions)/ ajout, modification, interventions d'une culture
│   ├── (app)/(observations)/  liste, ajout, modification
│   ├── (app)/(recoltes)/   liste, ajout
│   └── (app)/(common)/     profil, confirmation de suppression
├── providers/AppProviders.tsx  providers montés une seule fois
│                               (gestes → zones sûres → TanStack Query →
│                                confirmations → synchronisation)
├── screens/<Domaine>Screen/    écrans réels (29 fichiers)
│   ├── <Écran>.tsx             orchestration + rendu
│   ├── <Écran>.helpers.ts      fonctions pures (7 écrans volumineux)
│   ├── <Écran>.styles.ts       agrégateur de styles
│   └── <Écran><Groupe>.ts      styles par section (26 feuilles)
├── components/<Domaine>Component/  sous-composants d'écran (93 fichiers)
│   ├── CommonComponent/     Button, Input, AppSelect, DateInput, DateTimeInput,
│   │                        Card, Badge, Chip, EmptyState, ErrorState,
│   │                        LoadingState, ScreenHeader, OfflineBanner…
│   ├── ParcelleComponent/   ParcelleMap, ParcelleWizard, ParcelleFormShell, …
│   ├── CultureComponent/    LifecycleTimeline, DateField, VueCreationCulture…
│   ├── InterventionComponent/ InterventionCard, FilterModal, VueInterventions, …
│   └── SyncComponent/       SyncBanner
│
│   `CommonComponent/ScreenContainer.tsx` est le squelette d'écran partagé
│   (fond applicatif, zone sûre, clavier, en-tête, pied d'actions) : la création
│   et la modification d'une parcelle passent par le même, d'où un fond identique.
├── hooks/
│   ├── queryKeys.ts         toutes les clés de cache (source unique)
│   └── {auth,common,culture,dashboard,intervention,observation,
│         parcelle,profile,recolte,recommendation}/
├── services/
│   ├── http.ts              client axios unique (JWT, enveloppe, ApiError, 401)
│   ├── *.service.ts         un fichier par domaine, typé de bout en bout
│   └── offline/             file persistante, moteur de synchronisation
├── providers/               QueryClientProvider + contexte de synchronisation
├── storage/                 SecureStore (jeton) + AsyncStorage (file, méta)
├── types/                   contrat partagé avec l'API (*.types.ts par domaine)
├── utils/                   date, erreur, intervention, formatNombre, parcelle, photo
└── theme/                   jetons de design (colors, typography, spacing, radius…)
```

**TanStack Query est la seule couche d'état serveur** : aucun `useEffect` de
chargement manuel, aucun cache maison. Chaque mutation invalide explicitement
les ressources concernées (`useInvalidateDomain`).

### Contrats de données (source de vérité : le serveur)

| Cas                              | Format envoyé     | Colonne PostgreSQL |
| -------------------------------- | ----------------- | ------------------ |
| Date de plantation / récolte prévue / date de récolte | `YYYY-MM-DD` | `date` |
| Intervention (`date`), observation (`date`) | instant ISO-8601 (`…Z`) | `timestamp(3)` |

* `DateInput` (date seule) et `DateTimeInput` (date **et** heure) ouvrent le
  sélecteur natif : **l'utilisateur ne tape plus jamais un format technique**.
* `src/utils/date.ts` est l'unique convertisseur (`toDateOnly`,
  `dateOnlyVersIso`, `formatDate`…). Aucune date n'est retraitée à la main dans
  les écrans, ce qui supprime les `Invalid Date` et les décalages de fuseau.

### Statuts calculés par le serveur

* **Intervention** — `PLANIFIEE` (date à venir) / `EN_COURS` (date atteinte) :
  le mobile n'envoie jamais de statut, il affiche celui de l'API (`statutInterventionPrevu`
  ne sert qu'à l'aperçu pendant la saisie).
* **Culture** — le serveur réconcilie `PLANIFIEE → EN_COURS` dès que la date de
  plantation est atteinte, et passe la culture en `RECOLTEE` lors de la récolte
  (transaction). Le mobile affiche le cycle de vie (`LifecycleTimeline`).

### Découpage des fichiers volumineux

Les écrans historiques de 1 000 à 5 000 lignes ont été découpés en déplaçant les
blocs **à l'identique** (analyse AST + vérificateur de types), sans réécriture :

```bash
bash scripts/decouper-tout.sh      # découpage complet, idempotent
```

`scripts/` contient le pipeline : `decouper-ecran.js` (utilitaires et
sous-composants), `extraire-sections.js` (grands blocs JSX), `extraire-imbriquees.js`
(fonctions pures imbriquées), `decouper-styles.js` (styles par section),
`nettoyer-composants.js`, `echapper-entites.js`, `ajouter-gardes.js`,
`nettoyer-imports.js`. Les fichiers produits sont listés dans
`src/components/sections-generees.json` (40 entrées, toutes résolues) — seul ce
manifeste autorise une suppression.

---

## 3. Corrections apportées

| # | Correction | Où |
| - | ---------- | -- |
| 1 | **Carte centrée sur la parcelle enregistrée** (`animateToRegion` avec un point, `fitToCoordinates` au-delà), jamais sur la position de l'utilisateur ; position courante **uniquement** à la création | `ParcelleComponent/ParcelleMap.tsx` |
| 2 | Bouton **« Modifier »** explicite (icône Lucide) sur le détail de parcelle | `ParcelleScreen/ParcelleDetailScreen.tsx` |
| 3 | **Même fond et même structure** pour création et modification (shell partagé : fond applicatif, `SafeAreaView`, `KeyboardAvoidingView`, en-tête, barre d'actions) | `ParcelleComponent/ParcelleFormShell.tsx` |
| 4 | **Assistant en étapes** Informations → Localisation → Délimitation → Résumé → Enregistrement, titres par étape, validation, « Suivant » désactivé si l'étape est invalide, pré-remplissage en modification | `ParcelleComponent/ParcelleWizard.tsx` |
| 5 | **Délimitation** : mode visible, `Polygon`, sommets déplaçables, action « Délimiter » avec icône et libellé | `ParcelleScreen/ParcelleDelimiterScreen.tsx`, `CultureScreen/CultureDelimiterScreen.tsx` |
| 6 | **Cycle de vie de la culture** : étape courante / précédente / suivante, dates, progression | `CultureComponent/LifecycleTimeline.tsx` |
| 7 | **Dates fiables** : `YYYY-MM-DD` envoyé tel quel, instants ISO-8601, aucune conversion manuelle | `utils/date.ts`, `CommonComponent/DateInput.tsx` |
| 8 | **Saisie des horodatages** : date **et** heure choisies dans le sélecteur natif (interventions, observations) — plus aucun champ texte ISO | `CommonComponent/DateTimeInput.tsx` |
| 9 | **Listes déroulantes réelles** (feuille modale) pour type, parcelle, culture, produit, unité, statut — libellés lisibles, identifiants réels envoyés | `CommonComponent/AppSelect.tsx`, `utils/intervention.ts` |
| 10 | **Statut d'intervention** calculé par le serveur, seulement affiché | `InterventionScreen/*`, `InterventionComponent/VueInterventions.tsx` |
| 11 | **Récolte** : aucun statut envoyé ; le serveur bascule la culture en `RECOLTEE` ; caches culture/dashboard invalidés | `hooks/recolte`, `RecolteScreen/RecolteCreateScreen.tsx` |
| 12 | **Hors-ligne** : file persistante, `clientId` unique (idempotence), `deviceId`, reprise progressive (1 s → 60 s), statuts `PENDING/SYNCING/SYNCED/FAILED/DUPLICATE/INVALID`, bandeau « Échec de synchronisation / Réessayer » | `services/offline/*`, `CommonComponent/OfflineBanner` |
| 13 | **Contrat de synchronisation aligné sur l'API** : `actionType ∈ {CREATE, UPDATE, DELETE}` × `entityType ∈ {PARCELLE, POINT_GPS, CULTURE, INTERVENTION, OBSERVATION, PHOTO, RECOLTE}`. Une action hors contrat est marquée `INVALID` et n'est jamais renvoyée | `types/offline.types.ts`, `services/offline/syncEngine.ts` |

---

## 4. Synchronisation hors-ligne

1. Toute écriture hors connexion est placée dans une file persistante
   (`AsyncStorage`), avec un `clientId` (UUID v4) qui sert de **clé
   d'idempotence**.
2. Au retour du réseau, la file est envoyée en un seul `POST /sync` (batch)
   accompagnée du `deviceId` et de l'horodatage d'origine (`timestamp`).
3. Le serveur répond par action : `SYNCED`, `DUPLICATE` (déjà traitée — succès),
   `CONFLICT` (aucun écrasement silencieux), `FAILED`, `INVALID`.
4. Les échecs sont rejoués avec un **délai progressif** puis exposés à
   l'utilisateur, qui peut relancer manuellement (« Réessayer »).
5. Une action dont le couple `actionType`/`entityType` n'est pas accepté par
   l'API est marquée `INVALID` **avant** l'envoi : elle ne boucle plus
   indéfiniment et ne fausse plus le compteur d'éléments en attente.

---

## 5. Qualité

* TypeScript strict, aucun `any` implicite dans le code applicatif ;
* réponses API typées (`src/types/*.types.ts`, `src/services/*.service.ts`) ;
* états de chargement, vides et d'erreur (« Réessayer ») sur les listes ;
* jetons de design centralisés (`src/theme`) : aucune couleur ni espacement
  codé en dur dans les écrans ;
* `npx tsc --noEmit`, `npm run lint` et `npx expo export` sont verts.

### Outillage de qualité

| Commande | Ce qu'elle vérifie |
| -------- | ------------------ |
| `npm test` | Tests unitaires de la **logique pure** (Jest 29, environnement Node) : conversions de dates `YYYY-MM-DD` ↔ `Date` ↔ ISO, statut d'intervention, formatage des nombres, polygones (nettoyage, aire, centroïde), contrat hors-ligne, clés TanStack Query. `jest-expo` n'est **pas** installé : il entre en conflit de versions avec `react-native@0.86.2` — les tests de rendu se font sur appareil. |
| `npm run sonar` | Règles SonarJS (fiabilité + code smells) via `eslint.sonar.config.js`. Les fichiers générés (`components/sections-generees.json`) et les tests sont exclus : ils ne doivent pas être corrigés à la main. |
| `npm run verifier:api` | Compare chaque appel sortant des `*.service.ts` aux routes déclarées par les contrôleurs NestJS (`../backend/src/**/*.controller.ts`). Échoue si un appel n'a pas de route. |
| `npm run verifier:routes` | Contrôle que `src/app/**` reste une **couche de routage** : ≤ 12 lignes de code utiles (commentaires exclus), aucune logique (hook, HTTP, styles), imports résolus ; signale tout écran non atteint depuis une route **et toute route jamais ciblée par une navigation** (dead route / lien profond uniquement). |

Journalisation : les écrans n'appellent plus `console.log` directement, mais
`logger.debug(domaine, …)` (`src/utils/logger.ts`) — actif en développement
uniquement, donc aucune trace en production.
