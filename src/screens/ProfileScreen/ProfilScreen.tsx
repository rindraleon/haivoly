import React from 'react';

import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { router } from 'expo-router';

import { Sprout, User } from 'lucide-react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useProfile } from '@/hooks/profile/useProfile';
import { removeToken } from '@/storage/authStorage';
import { queryClient } from '@/providers/AppProviders';

import { colors } from '@/theme';

import { styles } from './ProfilScreen.styles';
import { AgricultureBackground } from '@/components/ProfileComponent/AgricultureBackground';


import { VueProfil } from '@/components/ProfileComponent/VueProfil';
import { logger } from '@/utils/logger';

export default function ProfilScreen() {
  const insets = useSafeAreaInsets();

  const {
    data: profile,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useProfile();


  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },

        {
          text: 'Se déconnecter',
          style: 'destructive',

          onPress: async () => {
            try {
              await removeToken();

              // Purge du cache : sans cela, un autre compte connecté ensuite
              // verrait brièvement les données du précédent.
              queryClient.clear();

              router.replace(
                '/(auth)/login',
              );
            } catch {
              logger.warn(
                'ProfilScreen',
                'Échec de la déconnexion',
              );

              Alert.alert(
                'Déconnexion impossible',
                'Veuillez réessayer dans un instant.',
              );
            }
          },
        },
      ],
    );
  };


  if (isLoading) {
    return (
      <View style={styles.screen}>
        <AgricultureBackground />

        <View
          style={[
            styles.loadingContainer,
            {
              paddingTop:
                Math.max(
                  insets.top,
                  20,
                ),
            },
          ]}
        >
          <View
            style={
              styles.loadingIcon
            }
          >
            <Sprout
              size={28}
              color={
                colors.primary[700]
              }
            />
          </View>

          <ActivityIndicator
            size="small"
            color={
              colors.primary[600]
            }
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Chargement du profil...
          </Text>
        </View>
      </View>
    );
  }


  if (isError || !profile) {
    return (
      <View style={styles.screen}>
        <AgricultureBackground />

        <ScrollView
          contentContainerStyle={[
            styles.errorContainer,
            {
              paddingTop:
                Math.max(
                  insets.top,
                  24,
                ),
              paddingBottom: 120,
            },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={() =>
                refetch()
              }
              tintColor={
                colors.primary[600]
              }
            />
          }
          showsVerticalScrollIndicator={
            false
          }
        >
          <View
            style={
              styles.errorIcon
            }
          >
            <User
              size={28}
              color={
                colors.primary[700]
              }
            />
          </View>

          <Text
            style={
              styles.errorTitle
            }
          >
            Impossible de charger le profil
          </Text>

          <Text
            style={
              styles.errorText
            }
          >
            Vérifiez votre connexion puis
            faites glisser vers le bas pour
            réessayer.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.retryButton,
              pressed &&
                styles.retryButtonPressed,
            ]}
            onPress={() =>
              refetch()
            }
            accessibilityRole="button"
            accessibilityLabel="Réessayer de charger le profil"
          >
            <Text
              style={
                styles.retryButtonText
              }
            >
Réessayer
          </Text>
        </Pressable>
      </ScrollView>
      </View>
    );
  }


  const fullName = [
    profile.prenom,
    profile.nom,
  ]
    .filter(Boolean)
    .join(' ')
    .trim() || 'Utilisateur';

  const roleLabel =
    profile.role ===
    'AGRICULTEUR'
      ? 'Agriculteur'
      : 'Propriétaire';

  const initials =
    `${profile.prenom?.charAt(0) ?? ''}${profile.nom?.charAt(0) ?? ''}`
      .toUpperCase() || 'U';


  return (
    <VueProfil
      fullName={fullName}
      handleLogout={handleLogout}
      initials={initials}
      insets={insets}
      isFetching={isFetching}
      profile={profile}
      refetch={refetch}
      roleLabel={roleLabel}
    />
  );
}




