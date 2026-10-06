/**
 * Section `ModalFiltre` extraite de `VueObservations`.
 *
 * Le rendu est repris à l’identique : seules les valeurs et les actions
 * du composant parent sont reçues en props, ce qui évite de faire
 * transiter toute la logique de l’écran dans un seul fichier.
 */




import type { UseQueryResult } from '@tanstack/react-query';

import type { Dispatch, SetStateAction } from 'react';
import { Modal } from 'react-native';

import { Fermerfiltre } from '@/components/ObservationComponent/Fermerfiltre';
import type { Culture, Paginated, Parcelle } from '@/types';
type Props = {
  appliquerFiltre: () => void;
  culturePourSelection: Culture | undefined;
  cultureTemporaire: string;
  culturesFiltre: NoInfer<Culture[]>;
  culturesQuery: UseQueryResult<NoInfer<Culture[]>, Error>;
  fermerFiltre: () => void;
  filtreOuvert: boolean;
  parcellePourSelection: Parcelle | undefined;
  parcelleTemporaire: string;
  parcelles: NoInfer<Parcelle[]>;
  parcellesQuery: UseQueryResult<NoInfer<Paginated<Parcelle>>, Error>;
  reinitialiserFiltre: () => void;
  selectionCultureOuverte: boolean;
  selectionParcelleOuverte: boolean;
  setCultureTemporaire: Dispatch<SetStateAction<string>>;
  setParcelleTemporaire: Dispatch<SetStateAction<string>>;
  setSelectionCultureOuverte: Dispatch<SetStateAction<boolean>>;
  setSelectionParcelleOuverte: Dispatch<SetStateAction<boolean>>;
  voirSuivi: () => void;
};

export function ModalFiltre({
  appliquerFiltre,
  culturePourSelection,
  cultureTemporaire,
  culturesFiltre,
  culturesQuery,
  fermerFiltre,
  filtreOuvert,
  parcellePourSelection,
  parcelleTemporaire,
  parcelles,
  parcellesQuery,
  reinitialiserFiltre,
  selectionCultureOuverte,
  selectionParcelleOuverte,
  setCultureTemporaire,
  setParcelleTemporaire,
  setSelectionCultureOuverte,
  setSelectionParcelleOuverte,
  voirSuivi,
}: Props) {
  return (
<Modal
              visible={
                filtreOuvert
              }
              transparent
              animationType="slide"
              onRequestClose={
                fermerFiltre
              }
            >
              <Fermerfiltre
                appliquerFiltre={appliquerFiltre}
                culturePourSelection={culturePourSelection}
                cultureTemporaire={cultureTemporaire}
                culturesFiltre={culturesFiltre}
                culturesQuery={culturesQuery}
                fermerFiltre={fermerFiltre}
                parcellePourSelection={parcellePourSelection}
                parcelleTemporaire={parcelleTemporaire}
                parcelles={parcelles}
                parcellesQuery={parcellesQuery}
                reinitialiserFiltre={reinitialiserFiltre}
                selectionCultureOuverte={selectionCultureOuverte}
                selectionParcelleOuverte={selectionParcelleOuverte}
                setCultureTemporaire={setCultureTemporaire}
                setParcelleTemporaire={setParcelleTemporaire}
                setSelectionCultureOuverte={setSelectionCultureOuverte}
                setSelectionParcelleOuverte={setSelectionParcelleOuverte}
                voirSuivi={voirSuivi}
              />
            </Modal>
  );
}
