


import type { UseQueryResult } from '@tanstack/react-query';

import type { Dispatch, SetStateAction } from 'react';
import { Modal } from 'react-native';

import { Fermerajoutglobal } from '@/components/ObservationComponent/Fermerajoutglobal';
import type { Culture, Paginated, Parcelle } from '@/types';
type Props = {
  ajoutOuvert: boolean;
  continuerAjoutGlobal: () => void;
  cultureAjout: string;
  culturesAjout: NoInfer<Culture[]>;
  culturesAjoutQuery: UseQueryResult<NoInfer<Culture[]>, Error>;
  fermerAjoutGlobal: () => void;
  parcelleAjout: string;
  parcelles: NoInfer<Parcelle[]>;
  parcellesQuery: UseQueryResult<NoInfer<Paginated<Parcelle>>, Error>;
  selectionCultureAjoutOuverte: boolean;
  selectionParcelleAjoutOuverte: boolean;
  setCultureAjout: Dispatch<SetStateAction<string>>;
  setParcelleAjout: Dispatch<SetStateAction<string>>;
  setSelectionCultureAjoutOuverte: Dispatch<SetStateAction<boolean>>;
  setSelectionParcelleAjoutOuverte: Dispatch<SetStateAction<boolean>>;
};

export function ModalAjout({
  ajoutOuvert,
  continuerAjoutGlobal,
  cultureAjout,
  culturesAjout,
  culturesAjoutQuery,
  fermerAjoutGlobal,
  parcelleAjout,
  parcelles,
  parcellesQuery,
  selectionCultureAjoutOuverte,
  selectionParcelleAjoutOuverte,
  setCultureAjout,
  setParcelleAjout,
  setSelectionCultureAjoutOuverte,
  setSelectionParcelleAjoutOuverte,
}: Props) {
  return (
<Modal
              visible={
                ajoutOuvert
              }
              transparent
              animationType="slide"
              onRequestClose={
                fermerAjoutGlobal
              }
            >
              <Fermerajoutglobal
                continuerAjoutGlobal={continuerAjoutGlobal}
                cultureAjout={cultureAjout}
                culturesAjout={culturesAjout}
                culturesAjoutQuery={culturesAjoutQuery}
                fermerAjoutGlobal={fermerAjoutGlobal}
                parcelleAjout={parcelleAjout}
                parcelles={parcelles}
                parcellesQuery={parcellesQuery}
                selectionCultureAjoutOuverte={selectionCultureAjoutOuverte}
                selectionParcelleAjoutOuverte={selectionParcelleAjoutOuverte}
                setCultureAjout={setCultureAjout}
                setParcelleAjout={setParcelleAjout}
                setSelectionCultureAjoutOuverte={setSelectionCultureAjoutOuverte}
                setSelectionParcelleAjoutOuverte={setSelectionParcelleAjoutOuverte}
              />
            </Modal>
  );
}
