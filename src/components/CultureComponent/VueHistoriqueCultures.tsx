import type { CultureAvecPoints } from '@/screens/CultureScreen/CultureHistoryScreen';
import { styles } from '@/screens/CultureScreen/CultureHistoryScreen.styles';



import type { Dispatch, SetStateAction } from 'react';
import { View } from 'react-native';


import { VueHistoriqueCultures1 } from '@/components/CultureComponent/VueHistoriqueCultures1';
import type {
  Culture,
  Parcelle,
} from '@/types';
type Props = {
  culturesAvecPoints: CultureAvecPoints[];
  culturesFiltreesEtTriees: Culture[];
  culturesHistorique: Culture[];
  delimitationFiltre: string;
  filtreOuvert: boolean;
  loadingPoints: boolean;
  mapHtml: string;
  nombreCulturesDelimitees: number;
  parcelle: NoInfer<Parcelle> | undefined;
  parcelleId: string | undefined;
  parcelleNom: string | undefined;
  recherche: string;
  setDelimitationFiltre: Dispatch<SetStateAction<string>>;
  setFiltreOuvert: Dispatch<SetStateAction<boolean>>;
  setRecherche: Dispatch<SetStateAction<string>>;
  setStatutFiltre: Dispatch<SetStateAction<string>>;
  setTri: Dispatch<SetStateAction<string>>;
  setTriOuvert: Dispatch<SetStateAction<boolean>>;
  setTypeFiltre: Dispatch<SetStateAction<string>>;
  statutFiltre: string;
  tri: string;
  triOuvert: boolean;
  typeFiltre: string;
  typesDisponibles: string[];
};

export function VueHistoriqueCultures({
  culturesAvecPoints,
  culturesFiltreesEtTriees,
  culturesHistorique,
  delimitationFiltre,
  filtreOuvert,
  loadingPoints,
  mapHtml,
  nombreCulturesDelimitees,
  parcelle,
  parcelleId,
  parcelleNom,
  recherche,
  setDelimitationFiltre,
  setFiltreOuvert,
  setRecherche,
  setStatutFiltre,
  setTri,
  setTriOuvert,
  setTypeFiltre,
  statutFiltre,
  tri,
  triOuvert,
  typeFiltre,
  typesDisponibles,
}: Props) {
  return (
<View
        style={
          styles.container
        }
      >

        <VueHistoriqueCultures1
          culturesAvecPoints={culturesAvecPoints}
          culturesFiltreesEtTriees={culturesFiltreesEtTriees}
          culturesHistorique={culturesHistorique}
          delimitationFiltre={delimitationFiltre}
          filtreOuvert={filtreOuvert}
          loadingPoints={loadingPoints}
          mapHtml={mapHtml}
          nombreCulturesDelimitees={nombreCulturesDelimitees}
          parcelle={parcelle}
          parcelleId={parcelleId}
          parcelleNom={parcelleNom}
          recherche={recherche}
          setDelimitationFiltre={setDelimitationFiltre}
          setFiltreOuvert={setFiltreOuvert}
          setRecherche={setRecherche}
          setStatutFiltre={setStatutFiltre}
          setTri={setTri}
          setTriOuvert={setTriOuvert}
          setTypeFiltre={setTypeFiltre}
          statutFiltre={statutFiltre}
          tri={tri}
          triOuvert={triOuvert}
          typeFiltre={typeFiltre}
          typesDisponibles={typesDisponibles}
        />

      </View>
  );
}
