# Haivoly — Application mobile (Expo / React Native)

Application de gestion agricole : parcelles, cultures, interventions,
observations, récoltes et recommandations, avec fonctionnement hors-ligne et
synchronisation vers l'API NestJS.

---

## Démarrage

```bash
npm install
cp .env.example .env      # renseigner EXPO_PUBLIC_API_URL
npx expo start            # QR code Expo Go / simulateur
```

Cibles et qualité :

```bash
npm run android           # émulateur / appareil Android
npm run ios               # simulateur iOS
npm run web               # version navigateur
npm run lint              # ESLint (expo lint)
npx tsc --noEmit          # typage strict
```

> L'URL de l'API n'est jamais codée en dur : elle vient de `EXPO_PUBLIC_API_URL`
> (`src/config`), avec repli en développement sur l'hôte du bundler Expo.
> La configuration Expo vit dans `app.config.ts` (SDK 57).

---

## Architecture

```
src/
├── app/                    routes expo-router (fichiers de route uniquement)
│   ├── (auth)/             login, register, forgot-password, reset-password
│   └── (app)/              parcours protégés
│       ├── (tabs)/         barre d'onglets permanente
│       ├── (parcelles)/    liste, détail, ajout, modification, délimitation, historique
│       ├── (cultures)/     liste, détail, ajout, modification, délimitation, historique
│       ├── (interventions)/ liste, ajout, modification, interventions d'une culture
│       ├── (observations)/ liste, ajout, modification
│       ├── (recoltes)/     liste, ajout
│       └── (common)/       profil, confirmation de suppression
├── screens/<Domaine>Screen/  écrans réels (orchestration + rendu)
│   ├── <Écran>.tsx           composant d'écran
│   ├── <Écran>.helpers.ts    fonctions pures de l'écran
│   ├── <Écran>.styles.ts     agrégateur de styles
│   └── <Écran><Groupe>.ts    styles par section
├── components/<Domaine>Component/  sous-composants d'écran
│   ├── CommonComponent/     design system (Button, Input, Card, Badge, Chip,
│   │                        EmptyState, ErrorState, LoadingState, ScreenHeader,
│   │                        DateInput, DateTimeInput, AppSelect, OfflineBanner…)
│   ├── ParcelleComponent/   ParcelleMap, ParcelleWizard, ParcelleFormShell…
│   ├── CultureComponent/    LifecycleTimeline, VueCreationCulture…
│   ├── InterventionComponent/ InterventionCard, FilterModal, VueInterventions…
│   └── SyncComponent/       SyncBanner
├── features/               logique métier par domaine (règles pures, sélecteurs)
├── hooks/                  queryKeys.ts (clés de cache) + hooks par domaine
├── services/
│   ├── http.ts             client axios unique (JWT, enveloppe, ApiError, 401)
│   ├── *.service.ts        un fichier par domaine, typé de bout en bout
│   └── offline/            file persistante + moteur de synchronisation
├── providers/              AppProviders : gestes, safe-area, TanStack Query,
│                           confirmations, synchronisation
├── storage/                SecureStore (jeton) + AsyncStorage (file, méta)
├── types/                  contrat partagé avec l'API (*.types.ts par domaine)
├── utils/                  date, erreur, intervention, formatNombre, parcelle, photo
├── i18n/                   traductions fr / en / mg
├── ui/                     design system (tokens, primitives, layout, charts)
├── theme/                  jetons de design (couleurs, typographie, espacements)
├── data/                   données statiques (villes, référentiels)
└── config/                 configuration de l'application
```

**Couches clés**

- `app/` ne contient que du routage : aucun écran réel ni logique.
- `screens/` porte l'orchestration et le rendu des écrans.
- `components/` contient deux familles : le **design system** réutilisable
  (`CommonComponent`, tout reçu par propriétés) et les **sections d'écran**
  propres à un domaine.
- `features/` regroupe la logique métier pure (règles, sélecteurs), testable
  sans React Native.
- **TanStack Query est la seule couche d'état serveur** : aucune gestion de
  cache maison, chaque mutation invalide les ressources concernées.
- `services/offline/` implémente la file persistante et la synchronisation
  idempotente (`clientId` comme clé d'idempotence).
