import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';

import { getRecolte, Recolte } from '../api/recoltes';

export default function RecoltesScreen() {
  const { cultureId } = useLocalSearchParams<{ cultureId: string }>();

  const [recolte, setRecolte] = React.useState<Recolte | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const chargerRecolte = useCallback(async () => {
    if (!cultureId) {
      setLoading(false);
      return;
    }

    try {
      const data = await getRecolte(cultureId);
      
      console.log('🌾 RÉCOLTE COMPLÈTE:', JSON.stringify(data, null, 2));
      console.log('📷 PHOTOS:', data.photos);
      console.log(
  '🔗 URL PHOTOS:',
  data.photos?.map((photo) => photo.url),
);
      
      setRecolte(data);
    } catch (error: any) {
      // 404 = aucune récolte enregistrée
      if (error?.response?.status === 404) {
        setRecolte(null);
      } else {
        console.error('Erreur récupération récolte:', error);
        Alert.alert(
          'Erreur',
          'Impossible de récupérer les informations de récolte.',
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [cultureId]);

  useFocusEffect(
    useCallback(() => {
      chargerRecolte();
    }, [chargerRecolte]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await chargerRecolte();
  };

  const formaterDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          Chargement de la récolte...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      <Text style={styles.title}>🌾 Récolte</Text>

      {!recolte ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🌾</Text>

          <Text style={styles.emptyTitle}>
            Aucune récolte enregistrée
          </Text>

          <Text style={styles.emptyText}>
            Cette culture ne possède pas encore d'informations
            de récolte.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              router.push({
                pathname: '/ajout-recolte',
                params: { cultureId },
              })
            }
          >
            <Text style={styles.primaryButtonText}>
              Enregistrer la récolte
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Informations générales */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Informations de récolte
            </Text>

            <View style={styles.infoRow}>
              <Text style={styles.label}>📅 Date</Text>
              <Text style={styles.value}>
                {formaterDate(recolte.dateRecolte)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>⚖️ Quantité</Text>
              <Text style={styles.value}>
                {recolte.quantite} {recolte.unite}
              </Text>
            </View>

            {recolte.prixVente != null && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>💰 Prix de vente</Text>
                <Text style={styles.value}>
                  {recolte.prixVente.toLocaleString('fr-FR')} Ar
                </Text>
              </View>
            )}

            {recolte.coutRecolte != null && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>💵 Coût de récolte</Text>
                <Text style={styles.value}>
                  {recolte.coutRecolte.toLocaleString('fr-FR')} Ar
                </Text>
              </View>
            )}

            {recolte.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.label}>📝 Description</Text>
                <Text style={styles.description}>
                  {recolte.description}
                </Text>
              </View>
            )}
          </View>

          {/* Photos */}
          {recolte.photos && recolte.photos.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                📷 Photos de la récolte
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {recolte.photos.map((photo) => (
                  <Image
                    key={photo.id}
                    source={{ uri: photo.url }}
                    style={styles.photo}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Statut */}
          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>
              Statut de la culture
            </Text>

            <Text style={styles.status}>
              🌾 RECOLTÉE
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6f7',
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f6f7',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 15,
    color: '#666',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  label: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },

  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    maxWidth: '55%',
    textAlign: 'right',
  },

  descriptionContainer: {
    marginTop: 16,
  },

  description: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
  },

  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },

  emptyIcon: {
    fontSize: 50,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },

  primaryButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  photo: {
    width: 180,
    height: 180,
    borderRadius: 10,
    marginRight: 12,
  },

  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },

  statusLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },

  status: {
    fontSize: 18,
    fontWeight: '700',
  },
});