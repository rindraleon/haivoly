/**
 * Composants `CommonComponent` — **design system** de l'application.
 *
 * Ce dossier est le seul dont les composants sont réellement réutilisables :
 * ils ne dépendent ni d'un écran ni des styles d'un écran, et reçoivent leurs
 * données par propriétés. Les autres dossiers (`CultureComponent`,
 * `ObservationComponent`…) contiennent des **sections d'écran** : elles
 * présentent le même aspect qu'un composant, mais importent les styles et les
 * utilitaires de leur écran d'origine et ne sont donc pas réutilisables.
 *
 * Règle vérifiée automatiquement (`npm run verifier:composants`) : un composant
 * de ce dossier est utilisé au moins une fois, et aucun composant du projet
 * n'est orphelin.
 */
export * from './AppBottomBar';
export * from './AppSelect';
export * from './AppText';
export * from './Badge';
export * from './Button';
export * from './Card';
export * from './Chip';
export * from './ConfirmDialog';
export * from './ConfirmProvider';
export * from './DateInput';
export * from './DateTimeInput';
export * from './EmptyState';
export * from './ErrorState';
export * from './Input';
export * from './LoadingState';
export * from './OfflineBanner';
export * from './PasswordInput';
export * from './ScreenContainer';
export * from './ScreenHeader';
export * from './SearchBar';
