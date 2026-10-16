import { createContext, useContext } from 'react';

/**
 * Vrai quand une barre permanente (barre d'onglets V2) occupe le bas de
 * l'écran sous la pile : elle porte déjà la zone sûre du bas (barre de gestes,
 * indicateur d'accueil), les pieds collants ne la réappliquent donc pas.
 * Les feuilles modales (BottomSheet, DateField) recouvrent la barre et gardent,
 * elles, la zone sûre réelle.
 */
export const BarreBasContext = createContext(false);

export function useBarreBasPresente(): boolean {
  return useContext(BarreBasContext);
}
