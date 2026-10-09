import {
  ActivityIndicator,
  FlatList,
 
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';

import { useParcelles } from '@/hooks';

import { styles } from './CultureParcellePickerScreen.styles';
import { logger } from '@/utils/logger';

export default function ChoisirParcelleCultureScreen() {
  const {
    data: parcellesPage,
    isLoading,
    isError,
    refetch,
  } = useParcelles({ limit: 200 });

  /** `useParcelles` renvoie une page paginée : l'écran travaille sur la liste. */
  const parcelles = parcellesPage?.items ?? [];


  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text>Chargement des parcelles...</Text>
      </View>
    );
  }


  if (isError) {
    return (
      <View style={styles.center}>
        <Text>
          Impossible de récupérer les parcelles.
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
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }


  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Les parcelles
      </Text>

      <Text style={styles.subtitle}>
        Choisissez une parcelle pour voir ses cultures
      </Text>

      <FlatList
        data={parcelles || []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>
              Aucune parcelle disponible.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => {
  logger.debug('CultureParcellePickerScreen', 'PARCELLE SÉLECTIONNÉE :', item);
  logger.debug('CultureParcellePickerScreen', 'PARCELLE ID :', item.id);
  logger.debug('CultureParcellePickerScreen', 'PARCELLE NOM :', item.nom);

  router.push({
    pathname: '/cultures',
    params: {
      parcelleId: item.id,
      parcelleNom: item.nom,
    },
  });
}}
          >
            <Text style={styles.cardTitle}>
              {item.nom}
            </Text>

            {item.typeSol && (
              <Text style={styles.cardText}>
                Type de sol : {item.typeSol}
              </Text>
            )}

            {item.superficie != null && (
  <Text style={styles.cardText}>
    Superficie : {Number(item.superficie).toFixed(2)} m²
  </Text>
)}

            <Text style={styles.cultureLink}>
               Voir les cultures →
            </Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.backButtonBottom}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>
          Retour
        </Text>
      </TouchableOpacity>
    </View>
  );
}
