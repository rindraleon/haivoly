/**
 * RecolteListScreen — implémentation de l’écran.
 *
 * Le fichier de route correspondant (`src/app/(app)/…`) ne fait que
 * réexporter ce composant : toute la logique vit ici.
 */

import { formatMontant } from '@/utils/formatNombre';
import { formatDate } from '@/utils/date';
/* eslint-disable react/no-unescaped-entities */
import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';

import type { Recolte } from '@/types';

import { getMediaUrl } from '@/utils/mediaUrl';


import { styles } from './RecolteListScreen.styles';
import { recoltesApi } from '@/services';
import { logger } from '@/utils/logger';
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
      const data = await recoltesApi.getByCulture(cultureId);
      
      logger.debug('RecolteListScreen', '🌾 RÉCOLTE COMPLÈTE:', JSON.stringify(data, null, 2));
      logger.debug('RecolteListScreen', '📷 PHOTOS:', data.photos);
      logger.debug('RecolteListScreen', 
  '🔗 URL PHOTOS:',
  data.photos?.map((photo) => getMediaUrl(photo.url)),
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
                {formatDate(recolte.dateRecolte)}
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
                  {formatMontant(recolte.prixVente)}
                </Text>
              </View>
            )}

            {recolte.coutRecolte != null && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>💵 Coût de récolte</Text>
                <Text style={styles.value}>
                  {formatMontant(recolte.coutRecolte)}
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
                    source={{ uri: getMediaUrl(photo.url) }}
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
