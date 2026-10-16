# Design system Haivoly V2 (`src/ui`)

Migration progressive, écran par écran, derrière le drapeau V1/V2 (`src/features/shell/versionUi.tsx`).
Compatible **Expo Go** (aucune dépendance native ajoutée).

## Règles

- `ui/` n'importe ni `features/`, ni `screens/`, ni `services/`.
- Aucune couleur hexadécimale dans les écrans V2 : `useTheme().couleurs.*` ou `makeStyles((t) => …)`.
- Toute couleur de fond a sa couleur « sur » (`primaire` / `surPrimaire`…). Les contrastes WCAG AA sont verrouillés par `tokens/__tests__/contraste.test.ts`.
- Texte : `<Text variant="h2" color="texteSecondaire">`. L'échelle va de `display`, `h1`, `h2`, `h3` à `body`, `bodySmall`, `label`, `caption`, `micro` et `kpi`. La police est Inter (4 graisses chargées au démarrage) ; si elle est indisponible, l'app retombe sur la police système.
- Un état ne s'exprime jamais par la couleur seule : icône et texte, ou libellé accessible.
- Cible tactile ≥ 48 dp ; chaque bouton icône a un `accessibilityLabel`.

## Composants

| Composant | Usage |
|---|---|
| `PrimaryButton` | 6 variantes (`primary`, `secondary`, `cta`, `outline`, `ghost`, `danger`), 3 tailles, `loading` accessible |
| `Card` | Surface de radius 16–20, bordure fine, ombre douce, pressable si `onPress` |
| `KpiCard` | Indicateur à chiffres tabulaires, icône teintée, squelette de chargement |
| `CropCard`, `CropStatusBadge` | Culture : pictogramme selon la famille, statut, progression, échéance |
| `FieldMapCard` | Parcelle : contour GPS dessiné en SVG, hors ligne, sans WebView |
| `AlertCard` | Bandeaux info, succès, alerte, erreur, hors ligne (annoncés aux lecteurs d'écran) |
| `RecommendationCard` | Recommandation du propriétaire (remplace la WeatherCard) |
| `FormInput`, `DateField`, `ChoiceChips` | Champs de formulaire (libellé visible, erreur, aide, unité) |
| `DonutChart` | Répartition avec légende textuelle |
| `Skeleton`, `EmptyState`, `SectionHeader`, `IconButton`, `Avatar`, `Badge`, `ProgressBar` | Briques communes |
| `Screen`, `FormScreen`, `StickyFooter`, `TopAppBar`, `BottomTabBar` | Gabarits d'écran |

## Contrat clavier (`FormScreen`)

1. `KeyboardAvoidingView` en `behavior="padding"` sur iOS **et** Android : en mode bord-à-bord, `adjustResize` ne fonctionne pas sur Android.
2. Le pied d'action (`footer`) est dans la zone évitée : le bouton « Enregistrer » reste toujours au-dessus du clavier.
3. Le champ actif est ramené à ≥ 16 px au-dessus du pied, au focus et quand la zone visible rétrécit. Le calcul se trouve dans `layout/visibilite.ts` et il est testé.
4. Un tap hors champ ou un glissement ferme le clavier.
5. `keyboardVerticalOffset` = position réelle de l'écran dans la fenêtre : le calcul reste juste quand un bandeau s'affiche au-dessus.
6. Erreurs : react-hook-form focalise la première erreur. `DateField` et `ChoiceChips` exposent `focus()`, qui ramène le champ à l'écran.

Limite connue dans Expo Go : sur Android, le pied rejoint le clavier une fois celui-ci ouvert (pas d'animation image par image). Le passage à `react-native-keyboard-controller` (build de développement) ne changera que `FormScreen`.

## Recette

- Catalogue : route `/catalogue`, disponible en développement ou si `EXPO_PUBLIC_CATALOGUE=1`. Il couvre le clair et le sombre, et tous les états des composants.
- Basculer V1/V2 : écran **Apparence** (`/theme`), rubrique « Design de l'application ». La valeur par défaut est `EXPO_PUBLIC_UI_VERSION` (`v2` si absent).
