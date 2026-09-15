import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';

import { useParcelles } from '@/hooks/useParcelles';

export default function ChoisirParcelleCultureScreen() {
  const {
    data: parcelles,
    isLoading,
    isError,
    refetch,
  } = useParcelles();

  // ==============================
  // CHARGEMENT
  // ==============================

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text>Chargement des parcelles...</Text>
      </View>
    );
  }

  // ==============================
  // ERREUR
  // ==============================

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

  // ==============================
  // LISTE
  // ==============================

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
  console.log('PARCELLE SÉLECTIONNÉE :', item);
  console.log('PARCELLE ID :', item.id);
  console.log('PARCELLE NOM :', item.nom);

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 15,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },

  list: {
    paddingBottom: 100,
  },

  card: {
    padding: 18,
    borderRadius: 12,
    backgroundColor: '#e8f5e9',
    marginBottom: 12,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  cardText: {
    fontSize: 15,
    marginTop: 4,
  },

  cultureLink: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2e7d32',
  },

  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2e7d32',
  },

  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  backButtonBottom: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
  },

  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});