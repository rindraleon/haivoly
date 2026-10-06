/**
 * Utilitaires et types de `RegisterScreen`.
 *
 * Extraits de l'écran : ces fonctions ne dépendent pas de l'état de
 * l'interface et peuvent donc être testées ou réutilisées isolément.
 */


export type Errors = {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  password?: string;
  general?: string;
};
