/**
 * ParcelleHistoryScreen — implémentation de l’écran.
 *
 * Le fichier de route correspondant (`src/app/(app)/…`) ne fait que
 * réexporter ce composant : toute la logique vit ici.
 */
/* eslint-disable react/no-unescaped-entities */
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';


import { useParcelles } from '@/hooks';

import { styles } from './ParcelleHistoryScreen.styles';
import { VueHistoriqueParcelles } from '@/components/ParcelleComponent/VueHistoriqueParcelles';
import type {
} from '@/types';
const formatSuperficie = (superficie?: number | null) => {
  if (superficie === undefined || superficie === null) {
    return null;
  }

  return {
    m2: superficie,
    are: superficie / 100,
    ha: superficie / 10000,
  };
};

export type StatutHistorique =
  | 'TOUS'
  | 'ABANDONNEE'
  | 'ARCHIVEE'
  | 'SUPPRIMEE';

export type TypeTri =
  | 'DEFAUT'
  | 'DATE_CREATION_RECENTE'
  | 'DATE_CREATION_ANCIENNE'
  | 'DATE_MODIFICATION_RECENTE'
  | 'DATE_MODIFICATION_ANCIENNE'
  | 'SUPERFICIE_CROISSANTE'
  | 'SUPERFICIE_DECROISSANTE'
  | 'NOM_AZ'
  | 'NOM_ZA';

export default function HistoriqueParcellesScreen() {
  const {
    data: parcellesPage,
    isLoading,
    isError,
    refetch,
  } = useParcelles({ limit: 200 });

  /** `useParcelles` renvoie une page paginée : l'écran travaille sur la liste. */
  const parcelles = parcellesPage?.items ?? [];

  const [recherche, setRecherche] = useState('');

  const [statutFiltre, setStatutFiltre] =
    useState<StatutHistorique>('TOUS');

  const [filtreOuvert, setFiltreOuvert] =
    useState(false);

  const [triOuvert, setTriOuvert] =
    useState(false);

  const [tri, setTri] =
    useState<TypeTri>('DEFAUT');

  /*
   * ==========================================
   * PARCELLES HISTORIQUES
   * ==========================================
   *
   * On ne garde PAS :
   *
   * ACTIVE
   *
   * L'historique contient :
   *
   * ABANDONNEE
   * ARCHIVEE
   * SUPPRIMEE
   */

  const parcellesHistoriques = (parcelles ?? [])
    .filter((parcelle) => {
      return (
        parcelle.statut === 'ABANDONNEE' ||
        parcelle.statut === 'ARCHIVEE' ||
        parcelle.statut === 'SUPPRIMEE'
      );
    })
    .filter((parcelle) => {
      /*
       * ==========================================
       * RECHERCHE
       * ==========================================
       */

      const rechercheNormalisee =
        recherche.trim().toLowerCase();

      if (rechercheNormalisee === '') {
        return true;
      }

      return (
        parcelle.nom
          .toLowerCase()
          .includes(rechercheNormalisee) ||
        (parcelle.description ?? '')
          .toLowerCase()
          .includes(rechercheNormalisee) ||
        (parcelle.typeSol ?? '')
          .toLowerCase()
          .includes(rechercheNormalisee) ||
        parcelle.statut
          .toLowerCase()
          .includes(rechercheNormalisee)
      );
    })
    .filter((parcelle) => {
      /*
       * ==========================================
       * FILTRE STATUT
       * ==========================================
       */

      if (statutFiltre === 'TOUS') {
        return true;
      }

      return parcelle.statut === statutFiltre;
    })
    .sort((a, b) => {
      /*
       * ==========================================
       * TRI
       * ==========================================
       */

      switch (tri) {
        case 'DATE_CREATION_RECENTE':
          return (
            new Date(b.creeA ?? 0).getTime() -
            new Date(a.creeA ?? 0).getTime()
          );

        case 'DATE_CREATION_ANCIENNE':
          return (
            new Date(a.creeA ?? 0).getTime() -
            new Date(b.creeA ?? 0).getTime()
          );

        case 'DATE_MODIFICATION_RECENTE':
          return (
            new Date(b.modifieA ?? 0).getTime() -
            new Date(a.modifieA ?? 0).getTime()
          );

        case 'DATE_MODIFICATION_ANCIENNE':
          return (
            new Date(a.modifieA ?? 0).getTime() -
            new Date(b.modifieA ?? 0).getTime()
          );

        case 'SUPERFICIE_CROISSANTE':
          return (
            (a.superficie ?? 0) -
            (b.superficie ?? 0)
          );

        case 'SUPERFICIE_DECROISSANTE':
          return (
            (b.superficie ?? 0) -
            (a.superficie ?? 0)
          );

        case 'NOM_AZ':
          return a.nom.localeCompare(b.nom);

        case 'NOM_ZA':
          return b.nom.localeCompare(a.nom);

        case 'DEFAUT':
        default:
          return 0;
      }
    });

  /*
   * ==========================================
   * CHARGEMENT
   * ==========================================
   */

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Chargement de l'historique...
        </Text>
      </View>
    );
  }

  /*
   * ==========================================
   * ERREUR
   * ==========================================
   */

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          Impossible de récupérer l'historique.
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => refetch()}
        >
          <Text style={styles.retryText}>
            Réessayer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButtonCenter}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>
            Retour
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <VueHistoriqueParcelles
      filtreOuvert={filtreOuvert}
      formatSuperficie={formatSuperficie}
      parcellesHistoriques={parcellesHistoriques}
      recherche={recherche}
      setFiltreOuvert={setFiltreOuvert}
      setRecherche={setRecherche}
      setStatutFiltre={setStatutFiltre}
      setTri={setTri}
      setTriOuvert={setTriOuvert}
      statutFiltre={statutFiltre}
      tri={tri}
      triOuvert={triOuvert}
    />
  );
}
