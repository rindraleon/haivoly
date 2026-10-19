import { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ImagePlus, RefreshCw, X } from 'lucide-react-native';

import { radius } from '@/theme';
import { useTheme } from '@/hooks/common/useTheme';
import type { Jetons } from '@/theme/jetons';

export interface PhotoBrouillon {
  /** URI locale (caméra ou galerie), affichée en aperçu puis envoyée. */
  uri: string;
}

export interface PhotosSelectionProps {
  /** Photos mises en attente localement (envoyées après création de l'entité). */
  photos: PhotoBrouillon[];
  onChange: (photos: PhotoBrouillon[]) => void;
  /** Nombre maximal de photos jointes (défaut : 5). */
  maxPhotos?: number;
  /** Désactive l'ajout/la suppression (envoi en cours…). */
  disabled?: boolean;
}

/**
 * Sélection de photos à la création d'une intervention ou d'une observation :
 * prise de photo (caméra) ou import depuis la galerie, aperçu avant
 * enregistrement, remplacement et suppression. Les fichiers ne sont envoyés
 * qu'après la création de l'entité (voir `envoyerPhotosEnAttente`).
 */
export function PhotosSelection({
  photos,
  onChange,
  maxPhotos = 5,
  disabled = false,
}: Readonly<PhotosSelectionProps>) {
  const { t } = useTranslation();
  const { jetons } = useTheme();
  const styles = useMemo(() => creerStyles(jetons), [jetons]);
  const [apercu, setApercu] = useState<string | null>(null);

  const ajouter = (uri: string) => {
    if (photos.length >= maxPhotos) {
      Alert.alert(
        t('photos.limiteAtteinte', { defaultValue: 'Limite atteinte' }),
        t('photos.limiteTexte', {
          max: maxPhotos,
          defaultValue: `Vous pouvez joindre jusqu'à ${maxPhotos} photos.`,
        }),
      );
      return;
    }
    onChange([...photos, { uri }]);
  };

  const choisirGalerie = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t('photos.permissionGalerie.titre'), t('photos.permissionGalerie.texte'));
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });
      if (result.canceled || !result.assets?.length) return;
      ajouter(result.assets[0].uri);
    } catch {
      Alert.alert(t('photos.erreur'), t('photos.selectionImpossible'));
    }
  };

  const prendrePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t('photos.permissionCamera.titre'), t('photos.permissionCamera.texte'));
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });
      if (result.canceled || !result.assets?.length) return;
      ajouter(result.assets[0].uri);
    } catch {
      Alert.alert(
        t('domaine.erreur'),
        t('photos.captureImpossible', { defaultValue: 'Impossible de prendre la photo.' }),
      );
    }
  };

  const proposerAjout = () => {
    if (disabled) return;
    Alert.alert(
      t('photos.ajouterPhoto', { defaultValue: 'Ajouter une photo' }),
      t('photos.choisirSource', { defaultValue: 'Choisissez une source.' }),
      [
        { text: t('photos.source.camera'), onPress: () => void prendrePhoto() },
        {
          text: t('photos.source.galerie', { defaultValue: 'Galerie' }),
          onPress: () => void choisirGalerie(),
        },
        { text: t('commun.actions.annuler'), style: 'cancel' },
      ],
    );
  };

  const remplacer = (index: number) => {
    if (disabled) return;
    Alert.alert(
      t('photos.remplacerPhoto', { defaultValue: 'Remplacer la photo' }),
      t('photos.choisirSource', { defaultValue: 'Choisissez une source.' }),
      [
        {
          text: t('photos.source.camera'),
          onPress: async () => {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
              Alert.alert(t('photos.permissionCamera.titre'), t('photos.permissionCamera.texte'));
              return;
            }
            const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 });
            if (result.canceled || !result.assets?.length) return;
            onChange(photos.map((photo, rang) => (rang === index ? { uri: result.assets[0].uri } : photo)));
          },
        },
        {
          text: t('photos.source.galerie', { defaultValue: 'Galerie' }),
          onPress: async () => {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
              Alert.alert(t('photos.permissionGalerie.titre'), t('photos.permissionGalerie.texte'));
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              quality: 0.8,
            });
            if (result.canceled || !result.assets?.length) return;
            onChange(photos.map((photo, rang) => (rang === index ? { uri: result.assets[0].uri } : photo)));
          },
        },
        { text: t('commun.actions.annuler'), style: 'cancel' },
      ],
    );
  };

  const supprimer = (index: number) => {
    if (disabled) return;
    Alert.alert(
      t('photos.supprimerPhoto', { defaultValue: 'Supprimer la photo' }),
      t('photos.voulezVraimentSupprimerPhoto'),
      [
        { text: t('commun.actions.annuler'), style: 'cancel' },
        {
          text: t('libelles.supprimer'),
          style: 'destructive',
          onPress: () => onChange(photos.filter((_, rang) => rang !== index)),
        },
      ],
    );
  };

  return (
    <View style={styles.conteneur}>
      <View style={styles.entete}>
        <Camera size={15} color={jetons.primaire.base} strokeWidth={2.2} />
        <Text style={styles.titre}>{t('photos.titre')}</Text>
        <Text style={styles.compteur}>
          {photos.length}/{maxPhotos}
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.liste}>
        {photos.map((photo, index) => (
          <View key={`${photo.uri}-${index}`} style={styles.vignetteConteneur}>
            {/* Aperçu avant enregistrement : toucher agrandit l'image. */}
            <Pressable
              accessibilityRole="imagebutton"
              accessibilityLabel={t('photos.apercuPhoto', {
                numero: index + 1,
                defaultValue: `Aperçu de la photo ${index + 1}`,
              })}
              onPress={() => setApercu(photo.uri)}
            >
              <Image source={{ uri: photo.uri }} style={styles.vignette} resizeMode="cover" />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('photos.remplacerPhoto', { defaultValue: 'Remplacer la photo' })}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.boutonRemplacer}
              onPress={() => remplacer(index)}
              disabled={disabled}
            >
              <RefreshCw size={13} color="#FFFFFF" strokeWidth={2.6} />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('libelles.supprimerPhoto')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.boutonSupprimer}
              onPress={() => supprimer(index)}
              disabled={disabled}
            >
              <X size={13} color="#FFFFFF" strokeWidth={2.8} />
            </Pressable>
          </View>
        ))}

        {photos.length < maxPhotos ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('libelles.ajouterPhoto')}
            style={[styles.tuileAjout, disabled && styles.tuileAjoutDesactivee]}
            onPress={proposerAjout}
            disabled={disabled}
          >
            <ImagePlus size={24} color={jetons.primaire.base} strokeWidth={2} />
            <Text style={styles.tuileAjoutTexte}>
              {t('photos.ajouterPhoto', { defaultValue: 'Ajouter' })}
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>

      {photos.length === 0 ? (
        <Text style={styles.aide}>
          {t('photos.aideSelection', {
            defaultValue:
              'Aucune photo. Prenez une photo ou importez-la depuis votre appareil : elle sera jointe à l’enregistrement.',
          })}
        </Text>
      ) : (
        <Text style={styles.aide}>
          {t('photos.aideApresSelection', {
            defaultValue:
              'Touchez une photo pour l’agrandir. Les photos sont compressées puis envoyées avec l’enregistrement.',
          })}
        </Text>
      )}

      {/* Aperçu plein écran avant enregistrement */}
      <Modal visible={apercu != null} transparent animationType="fade" onRequestClose={() => setApercu(null)}>
        <View style={styles.apercuFond}>
          {apercu ? <Image source={{ uri: apercu }} style={styles.apercuImage} resizeMode="contain" /> : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('commun.actions.fermer')}
            style={styles.apercuFermer}
            onPress={() => setApercu(null)}
          >
            <X size={20} color="#FFFFFF" strokeWidth={2.4} />
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

function creerStyles(jetons: Jetons) {
  return StyleSheet.create({
    conteneur: { gap: 10 },
    entete: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    titre: { flex: 1, fontSize: 13.5, fontWeight: '600', color: jetons.texte.principal },
    compteur: { fontSize: 12, fontWeight: '700', color: jetons.texte.secondaire },
    liste: { gap: 10, alignItems: 'center' },
    vignetteConteneur: { position: 'relative' },
    vignette: {
      width: 86,
      height: 86,
      borderRadius: radius.md,
      backgroundColor: jetons.fond.attenue,
      borderWidth: 1,
      borderColor: jetons.bordure.defaut,
    },
    boutonSupprimer: {
      position: 'absolute',
      top: -6,
      right: -6,
      width: 24,
      height: 24,
      borderRadius: radius.full,
      backgroundColor: jetons.erreur.base,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: jetons.fond.carte,
    },
    boutonRemplacer: {
      position: 'absolute',
      bottom: -6,
      right: -6,
      width: 24,
      height: 24,
      borderRadius: radius.full,
      backgroundColor: jetons.primaire.base,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: jetons.fond.carte,
    },
    tuileAjout: {
      width: 86,
      height: 86,
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: jetons.primaire.base,
      backgroundColor: jetons.primaire.clair,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
    tuileAjoutDesactivee: { opacity: 0.5 },
    tuileAjoutTexte: { fontSize: 10.5, fontWeight: '700', color: jetons.primaire.base },
    aide: { fontSize: 12, color: jetons.texte.secondaire, lineHeight: 17 },
    apercuFond: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.92)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    apercuImage: { width: '100%', height: '80%' },
    apercuFermer: {
      position: 'absolute',
      top: 48,
      right: 20,
      width: 40,
      height: 40,
      borderRadius: radius.full,
      backgroundColor: 'rgba(255,255,255,0.16)',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}

export default PhotosSelection;
