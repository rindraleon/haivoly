import { ScreenHeader } from '@/components/CommonComponent/ScreenHeader';

import { CultureGlobale, ObservationGlobale } from '@/screens/ObservationScreen/ObservationListScreen.helpers';
import { styles } from '@/screens/ObservationScreen/ObservationListScreen.styles';



import type { UseQueryResult } from '@tanstack/react-query';

import type { Dispatch, SetStateAction } from 'react';
import { View } from 'react-native';

import { ModalAjout } from '@/components/ObservationComponent/ModalAjout';
import { ModalFiltre } from '@/components/ObservationComponent/ModalFiltre';
import { Liste } from '@/components/ObservationComponent/Liste';
import { VueObservations1 } from '@/components/ObservationComponent/VueObservations1';
import type { Culture, Paginated, Parcelle } from '@/types';
type Props = {
  actualiser: () => Promise<void>;
  ajoutOuvert: boolean;
  appliquerFiltre: () => void;
  chargementGlobal: boolean;
  confirmerSuppressionGlobale: (item: ObservationGlobale) => void;
  continuerAjoutGlobal: () => void;
  cultureAjout: string;
  culturePourSelection: Culture | undefined;
  cultureSelectionnee: string;
  cultureTemporaire: string;
  culturesAjout: NoInfer<Culture[]>;
  culturesAjoutQuery: UseQueryResult<NoInfer<Culture[]>, Error>;
  culturesFiltre: NoInfer<Culture[]>;
  culturesGlobales: CultureGlobale[];
  culturesQuery: UseQueryResult<NoInfer<Culture[]>, Error>;
  erreurGlobal: boolean;
  fermerAjoutGlobal: () => void;
  fermerFiltre: () => void;
  filtreActif: boolean;
  filtreOuvert: boolean;
  observationsGlobalesFiltrees: ObservationGlobale[];
  ouvrirAjoutGlobal: () => void;
  ouvrirFiltre: () => void;
  ouvrirModificationGlobale: (item: ObservationGlobale) => void;
  parcelleAjout: string;
  parcellePourSelection: Parcelle | undefined;
  parcelleSelectionnee: string;
  parcelleTemporaire: string;
  parcelles: NoInfer<Parcelle[]>;
  parcellesQuery: UseQueryResult<NoInfer<Paginated<Parcelle>>, Error>;
  recherche: string;
  reinitialiserFiltre: () => void;
  selectionCultureAjoutOuverte: boolean;
  selectionCultureOuverte: boolean;
  selectionParcelleAjoutOuverte: boolean;
  selectionParcelleOuverte: boolean;
  setCultureAjout: Dispatch<SetStateAction<string>>;
  setCultureTemporaire: Dispatch<SetStateAction<string>>;
  setParcelleAjout: Dispatch<SetStateAction<string>>;
  setParcelleTemporaire: Dispatch<SetStateAction<string>>;
  setRecherche: Dispatch<SetStateAction<string>>;
  setSelectionCultureAjoutOuverte: Dispatch<SetStateAction<boolean>>;
  setSelectionCultureOuverte: Dispatch<SetStateAction<boolean>>;
  setSelectionParcelleAjoutOuverte: Dispatch<SetStateAction<boolean>>;
  setSelectionParcelleOuverte: Dispatch<SetStateAction<boolean>>;
  statistiquesGlobales: { total: number; recentes: number; };
  voirSuivi: () => void;
};

export function VueObservations({
  actualiser,
  ajoutOuvert,
  appliquerFiltre,
  chargementGlobal,
  confirmerSuppressionGlobale,
  continuerAjoutGlobal,
  cultureAjout,
  culturePourSelection,
  cultureSelectionnee,
  cultureTemporaire,
  culturesAjout,
  culturesAjoutQuery,
  culturesFiltre,
  culturesGlobales,
  culturesQuery,
  erreurGlobal,
  fermerAjoutGlobal,
  fermerFiltre,
  filtreActif,
  filtreOuvert,
  observationsGlobalesFiltrees,
  ouvrirAjoutGlobal,
  ouvrirFiltre,
  ouvrirModificationGlobale,
  parcelleAjout,
  parcellePourSelection,
  parcelleSelectionnee,
  parcelleTemporaire,
  parcelles,
  parcellesQuery,
  recherche,
  reinitialiserFiltre,
  selectionCultureAjoutOuverte,
  selectionCultureOuverte,
  selectionParcelleAjoutOuverte,
  selectionParcelleOuverte,
  setCultureAjout,
  setCultureTemporaire,
  setParcelleAjout,
  setParcelleTemporaire,
  setRecherche,
  setSelectionCultureAjoutOuverte,
  setSelectionCultureOuverte,
  setSelectionParcelleAjoutOuverte,
  setSelectionParcelleOuverte,
  statistiquesGlobales,
  voirSuivi,
}: Props) {
  return (
<View
          style={
            styles.root
          }
        >
          <ScreenHeader
            title="Observations"
            subtitle={`${statistiquesGlobales.total} observation${
              statistiquesGlobales.total >
              1
                ? 's'
                : ''
            } • ${
              statistiquesGlobales.recentes
            } récentes`}
          />


          <VueObservations1
            appliquerFiltre={appliquerFiltre}
            culturePourSelection={culturePourSelection}
            cultureTemporaire={cultureTemporaire}
            culturesFiltre={culturesFiltre}
            culturesQuery={culturesQuery}
            fermerFiltre={fermerFiltre}
            filtreActif={filtreActif}
            filtreOuvert={filtreOuvert}
            observationsGlobalesFiltrees={observationsGlobalesFiltrees}
            ouvrirFiltre={ouvrirFiltre}
            parcellePourSelection={parcellePourSelection}
            parcelleTemporaire={parcelleTemporaire}
            parcelles={parcelles}
            parcellesQuery={parcellesQuery}
            recherche={recherche}
            reinitialiserFiltre={reinitialiserFiltre}
            selectionCultureOuverte={selectionCultureOuverte}
            selectionParcelleOuverte={selectionParcelleOuverte}
            setCultureTemporaire={setCultureTemporaire}
            setParcelleTemporaire={setParcelleTemporaire}
            setRecherche={setRecherche}
            setSelectionCultureOuverte={setSelectionCultureOuverte}
            setSelectionParcelleOuverte={setSelectionParcelleOuverte}
          />


          <Liste
            actualiser={actualiser}
            chargementGlobal={chargementGlobal}
            confirmerSuppressionGlobale={confirmerSuppressionGlobale}
            cultureSelectionnee={cultureSelectionnee}
            culturesGlobales={culturesGlobales}
            erreurGlobal={erreurGlobal}
            filtreActif={filtreActif}
            observationsGlobalesFiltrees={observationsGlobalesFiltrees}
            ouvrirAjoutGlobal={ouvrirAjoutGlobal}
            ouvrirModificationGlobale={ouvrirModificationGlobale}
            parcelleSelectionnee={parcelleSelectionnee}
            parcelles={parcelles}
            reinitialiserFiltre={reinitialiserFiltre}
          />


          <ModalFiltre
            appliquerFiltre={appliquerFiltre}
            culturePourSelection={culturePourSelection}
            cultureTemporaire={cultureTemporaire}
            culturesFiltre={culturesFiltre}
            culturesQuery={culturesQuery}
            fermerFiltre={fermerFiltre}
            filtreOuvert={filtreOuvert}
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


          <ModalAjout
            ajoutOuvert={ajoutOuvert}
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
