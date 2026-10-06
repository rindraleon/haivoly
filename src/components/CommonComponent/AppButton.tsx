/**
 * Alias public du bouton du design system.
 *
 * L'implémentation vit dans `Button.tsx` (une seule source de vérité) ;
 * `AppButton` est le nom attendu par l'architecture des composants
 * (`components/CommonComponent/AppButton`).
 */
export { Button as AppButton, type ButtonProps as AppButtonProps } from './Button';
