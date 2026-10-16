import { createContext, useContext } from 'react';
import type { TextInput, View } from 'react-native';

export type NoeudMesurable = View | TextInput | null;

export interface FormScrollContextValue {
  /** Marque le champ comme actif et l'amène au-dessus du clavier. */
  surFocus: (noeud: NoeudMesurable) => void;
  surBlur: (noeud: NoeudMesurable) => void;
  /** Amène un élément à l'écran (ex. première erreur d'un champ non textuel). */
  assurerVisible: (noeud: NoeudMesurable) => void;
}

export const FormScrollContext = createContext<FormScrollContextValue | null>(null);

/** `null` hors d'un `FormScreen` : les champs restent utilisables ailleurs. */
export function useFormScroll(): FormScrollContextValue | null {
  return useContext(FormScrollContext);
}
