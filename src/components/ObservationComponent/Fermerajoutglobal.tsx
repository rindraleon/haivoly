import { styles } from '@/screens/ObservationScreen/ObservationListScreen.styles';


import type { UseQueryResult } from '@tanstack/react-query';

import type { Dispatch, SetStateAction } from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Fermerajoutglobal2 } from '@/components/ObservationComponent/Fermerajoutglobal2';
import type { Culture, Paginated, Parcelle } from '@/types';
type Props = {
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

export function Fermerajoutglobal({
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
}: Readonly<Props>) {
  return (
<View
  style={
    styles.modalOverlay
  }
>
  <TouchableOpacity
    style={
      styles.modalBackdrop
    }
    activeOpacity={1}
    onPress={
      fermerAjoutGlobal
    }
  />

  <Fermerajoutglobal2
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
</View>
  );
}
