/**
 * Section `ModalChoixParcelle` extraite de `CultureListScreen`.
 *
 * Le rendu est repris à l’identique : seules les valeurs et les actions
 * du composant parent sont reçues en props, ce qui évite de faire
 * transiter toute la logique de l’écran dans un seul fichier.
 */
import { AppBottomBar } from '@/components/CommonComponent/AppBottomBar';





import { CultureToutesParcelles, FiltreCulture } from '@/screens/CultureScreen/CultureListScreen.helpers';
import { styles } from '@/screens/CultureScreen/CultureListScreen.styles';




import { Plus } from 'lucide-react-native';
import type { Dispatch, RefObject, SetStateAction } from 'react';
import { Pressable, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { ModalChoixParcelle1 } from '@/components/CultureComponent/ModalChoixParcelle1';
import type {
  Culture,
  Parcelle,
} from '@/types';
type Props = {
  FILTRES: FiltreCulture[];
  cultures: NoInfer<Culture[]> | undefined;
  culturesFiltrees: CultureToutesParcelles[];
  filtreOuvert: boolean;
  loadingPoints: boolean;
  mapHtml: string;
  modalChoixParcelle: React.JSX.Element;
  nombreCulturesDelimitees: number;
  onRefresh: () => Promise<void>;
  ouvrirModalAjoutCulture: () => void;
  parcelle: NoInfer<Parcelle> | undefined;
  parcelleId: string | undefined;
  parcelleNom: string | undefined;
  recherche: string;
  refreshing: boolean;
  setFiltreOuvert: Dispatch<SetStateAction<boolean>>;
  setMapReady: Dispatch<SetStateAction<boolean>>;
  setRecherche: Dispatch<SetStateAction<string>>;
  setStatutFiltre: Dispatch<SetStateAction<FiltreCulture>>;
  statutFiltre: FiltreCulture;
  // `{}` est le type générique par défaut de `WebView` dans react-native-webview.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  webViewRef: RefObject<WebView<{}> | null>;
};

export function ModalChoixParcelle({
  FILTRES,
  cultures,
  culturesFiltrees,
  filtreOuvert,
  loadingPoints,
  mapHtml,
  modalChoixParcelle,
  nombreCulturesDelimitees,
  onRefresh,
  ouvrirModalAjoutCulture,
  parcelle,
  parcelleId,
  parcelleNom,
  recherche,
  refreshing,
  setFiltreOuvert,
  setMapReady,
  setRecherche,
  setStatutFiltre,
  statutFiltre,
  webViewRef,
}: Props) {
  return (
<View
        style={
          styles.root
        }
      >

        <ModalChoixParcelle1
          FILTRES={FILTRES}
          cultures={cultures}
          culturesFiltrees={culturesFiltrees}
          filtreOuvert={filtreOuvert}
          loadingPoints={loadingPoints}
          mapHtml={mapHtml}
          nombreCulturesDelimitees={nombreCulturesDelimitees}
          onRefresh={onRefresh}
          ouvrirModalAjoutCulture={ouvrirModalAjoutCulture}
          parcelle={parcelle}
          parcelleId={parcelleId}
          parcelleNom={parcelleNom}
          recherche={recherche}
          refreshing={refreshing}
          setFiltreOuvert={setFiltreOuvert}
          setMapReady={setMapReady}
          setRecherche={setRecherche}
          setStatutFiltre={setStatutFiltre}
          statutFiltre={statutFiltre}
          webViewRef={webViewRef}
        />

        {/* FAB */}

        <Pressable
          onPress={
            ouvrirModalAjoutCulture
          }
          style={({ pressed }) => [
            styles.fab,

            pressed && {
              opacity: 0.9,
              transform: [
                {
                  scale: 0.94,
                },
              ],
            },
          ]}
        >

          <Plus
            size={27}
            color="#FFFFFF"
            strokeWidth={2.7}
          />

        </Pressable>

        <AppBottomBar />

        {modalChoixParcelle}

      </View>
  );
}
