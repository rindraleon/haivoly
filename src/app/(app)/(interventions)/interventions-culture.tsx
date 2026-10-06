/* eslint-disable react/no-unescaped-entities */

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  FileText,
  FlaskConical,
  MapPin,
  Package,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Sprout,
  Trash2,
  X,
} from 'lucide-react-native';

import * as ImagePicker from 'expo-image-picker';

import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';

import { useQueries } from '@tanstack/react-query';

import { getInterventions } from '@/api/interventions';
import { getCultures, type Culture } from '@/api/cultures';

import {
  useCreateIntervention,
  useDeleteIntervention,
  useInterventions,
  useUpdateIntervention,
} from '@/hooks/useInterventions';

import {
  useDeletePhotoIntervention,
  usePhotosIntervention,
  useUploadPhotoIntervention,
} from '@/hooks/usePhotosInterventions';

import { useParcelles } from '@/hooks/useParcelles';
import { useCultures } from '@/hooks/useCultures';

import { AppBottomBar } from '@/components/layout/AppBottomBar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';

import {
  colors,
  radius,
} from '@/design/tokens';

import { getMediaUrl } from '@/utils/mediaUrl';
import { getToken } from '@/storage/authStorage';

// ======================================================
// TYPES
// ======================================================

type StatutCulture =
  | 'PLANIFIEE'
  | 'EN_COURS'
  | 'RECOLTEE'
  | 'ABANDONNEE'
  | 'SUPPRIMEE';

interface Intervention {
  id: string;
  type?: string | null;
  date?: string | null;
  dateIntervention?: string | null;
  description?: string | null;
  produit?: string | null;
  quantite?: number | null;
  unite?: string | null;
  cout?: number | null;
}

interface InterventionGlobale {
  intervention: Intervention;
  parcelleId: string;
  parcelleNom: string;
  cultureId: string;
  cultureNom: string;
  statutCulture: StatutCulture;
}

interface CultureGlobale extends Culture {
  parcelleId: string;
  parcelleNom: string;
}

interface ContexteFormulaire {
  parcelleId: string;
  cultureId: string;
  statut: StatutCulture;
}

// ======================================================
// OUTILS
// ======================================================

function libelleStatut(statut?: string) {
  switch (statut) {
    case 'PLANIFIEE':
      return 'PLANIFIÉE';
    case 'EN_COURS':
      return 'EN COURS';
    case 'RECOLTEE':
      return 'RÉCOLTÉE';
    case 'ABANDONNEE':
      return 'ABANDONNÉE';
    case 'SUPPRIMEE':
      return 'SUPPRIMÉE';
    default:
      return statut ?? '';
  }
}

function badgeVariant(statut?: string): any {
  switch (statut) {
    case 'EN_COURS':
      return 'success';
    case 'PLANIFIEE':
      return 'warning';
    case 'RECOLTEE':
      return 'success';
    case 'ABANDONNEE':
      return 'warning';
    case 'SUPPRIMEE':
      return 'neutral';
    default:
      return 'neutral';
  }
}

function interventionDate(intervention?: Intervention | null): string | null {
  if (!intervention) {
    return null;
  }

  return intervention.date ?? intervention.dateIntervention ?? null;
}

function formaterDate(date?: string | null): string {
  if (!date) {
    return 'Date inconnue';
  }

  const valeur = new Date(date);

  if (Number.isNaN(valeur.getTime())) {
    return date;
  }

  return valeur.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formaterMontant(cout?: number | null): string {
  if (cout === undefined || cout === null) {
    return 'Non renseigné';
  }

  return `${new Intl.NumberFormat('fr-FR').format(cout)} Ar`;
}

function normaliserErreur(error: any): string {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Une erreur est survenue."
  );
}

// ======================================================
// PHOTOS INTERVENTION
// ======================================================

function PhotosIntervention({
  parcelleId,
  cultureId,
  interventionId,
  modificationAutorisee,
}: {
  parcelleId: string;
  cultureId: string;
  interventionId: string;
  modificationAutorisee: boolean;
}) {
  const photosQuery = usePhotosIntervention(
    parcelleId,
    cultureId,
    interventionId,
  );

  const uploadPhoto = useUploadPhotoIntervention(
    parcelleId,
    cultureId,
    interventionId,
  );

  const deletePhoto = useDeletePhotoIntervention(
    parcelleId,
    cultureId,
    interventionId,
  );

  const [photoEnCours, setPhotoEnCours] =
    useState(false);

  // Les photos sont chargées directement par React Native <Image>.
  // Contrairement à Axios, <Image> ne récupère pas automatiquement
  // le JWT ajouté par l'interceptor Axios. On lui transmet donc le
  // token lorsque le backend protège également l'accès aux fichiers.
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let actif = true;

    const chargerToken = async () => {
      try {
        const valeur = await getToken();

        if (actif) {
          setToken(valeur ?? null);
        }
      } catch (error) {
        console.error(
          'ERREUR LECTURE TOKEN POUR PHOTO INTERVENTION:',
          error,
        );

        if (actif) {
          setToken(null);
        }
      }
    };

    void chargerToken();

    return () => {
      actif = false;
    };
  }, []);

  const envoyerPhoto = async (uri: string) => {
    if (!modificationAutorisee) {
      return;
    }

    setPhotoEnCours(true);

    try {
      await uploadPhoto.mutateAsync(uri);
      await photosQuery.refetch();
      Alert.alert('Succès', 'Photo ajoutée avec succès.');
    } catch (error: any) {
      console.error(
        'ERREUR UPLOAD PHOTO INTERVENTION:',
        error?.response?.data || error,
      );

      Alert.alert('Erreur', normaliserErreur(error));
    } finally {
      setPhotoEnCours(false);
    }
  };

  const choisirGalerie = async () => {
    if (!modificationAutorisee) {
      return;
    }

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission refusée',
          "L'accès à la galerie est nécessaire pour sélectionner une photo.",
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.8,
        });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      await envoyerPhoto(result.assets[0].uri);
    } catch (error) {
      console.error('ERREUR GALERIE INTERVENTION:', error);
      Alert.alert('Erreur', "Impossible de sélectionner l'image.");
    }
  };

  const prendrePhoto = async () => {
    if (!modificationAutorisee) {
      return;
    }

    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission refusée',
          "L'accès à la caméra est nécessaire pour prendre une photo.",
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      await envoyerPhoto(result.assets[0].uri);
    } catch (error) {
      console.error('ERREUR CAMERA INTERVENTION:', error);
      Alert.alert('Erreur', 'Impossible de prendre la photo.');
    }
  };

  const choisirPhoto = () => {
    if (!modificationAutorisee) {
      return;
    }

    Alert.alert('Ajouter une photo', 'Choisissez une source.', [
      { text: 'Galerie', onPress: choisirGalerie },
      { text: 'Caméra', onPress: prendrePhoto },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const confirmerSuppressionPhoto = (photoId: string) => {
    if (!modificationAutorisee) {
      return;
    }

    Alert.alert(
      'Supprimer la photo',
      'Voulez-vous vraiment supprimer cette photo ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePhoto.mutateAsync(photoId);
              await photosQuery.refetch();
              Alert.alert('Succès', 'Photo supprimée.');
            } catch (error: any) {
              console.error(
                'ERREUR SUPPRESSION PHOTO INTERVENTION:',
                error,
              );
              Alert.alert('Erreur', normaliserErreur(error));
            }
          },
        },
      ],
    );
  };

  const photos = photosQuery.data ?? [];

  return (
    <View style={styles.photoSection}>
      <View style={styles.photoTitleRow}>
        <View style={styles.infoCardIcon}>
          <Camera
            size={15}
            color={colors.primary[600]}
            strokeWidth={2}
          />
        </View>

        <Text style={styles.photoTitle}>PHOTOS</Text>
        <Text style={styles.photoCount}>{photos.length}</Text>
      </View>

      {photosQuery.isLoading ? (
        <View style={styles.photoLoading}>
          <ActivityIndicator
            size="small"
            color={colors.primary[600]}
          />
          <Text style={styles.photoLoadingText}>
            Chargement des photos...
          </Text>
        </View>
      ) : (
        <>
          {photos.length === 0 ? (
            <Text style={styles.noPhotoText}>
              Aucune photo.
            </Text>
          ) : null}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photoList}
          >
            {photos.map(photo => (
              <View key={photo.id} style={styles.photoContainer}>
                <Image
                  source={{
                    uri: (() => {
                      const mediaUrl = getMediaUrl(photo.url);

                      if (!mediaUrl) {
                        return '';
                      }

                      const separator = mediaUrl.includes('?')
                        ? '&'
                        : '?';

                      // Évite qu'une ancienne image mise en cache soit
                      // conservée lorsque le même enregistrement est actualisé.
                      return `${mediaUrl}${separator}v=${encodeURIComponent(photo.id)}`;
                    })(),
                    headers: token
                      ? {
                          Authorization: `Bearer ${token}`,
                        }
                      : undefined,
                  }}
                  style={styles.photo}
                  resizeMode="cover"
                  onLoad={() => {
                    console.log('PHOTO INTERVENTION AFFICHÉE:', {
                      photoId: photo.id,
                      originalUrl: photo.url,
                      mediaUrl: getMediaUrl(photo.url),
                    });
                  }}
                  onError={event => {
                    console.error(
                      'ERREUR AFFICHAGE PHOTO INTERVENTION:',
                      {
                        photoId: photo.id,
                        originalUrl: photo.url,
                        mediaUrl: getMediaUrl(photo.url),
                        error: event.nativeEvent.error,
                      },
                    );
                  }}
                />

                {modificationAutorisee ? (
                  <TouchableOpacity
                    style={styles.deletePhotoButton}
                    onPress={() =>
                      confirmerSuppressionPhoto(photo.id)
                    }
                    disabled={deletePhoto.isPending}
                    activeOpacity={0.8}
                  >
                    <X
                      size={15}
                      color="#FFFFFF"
                      strokeWidth={2.8}
                    />
                  </TouchableOpacity>
                ) : null}
              </View>
            ))}

            {modificationAutorisee ? (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Ajouter une photo"
                style={styles.photoAddTile}
                onPress={choisirPhoto}
                disabled={photoEnCours}
                activeOpacity={0.8}
              >
                {photoEnCours ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.primary[600]}
                  />
                ) : (
                  <View style={styles.photoAddIcon}>
                    <Plus
                      size={28}
                      color={colors.primary[600]}
                      strokeWidth={2.2}
                    />
                  </View>
                )}
              </TouchableOpacity>
            ) : null}
          </ScrollView>
        </>
      )}

      {!modificationAutorisee ? (
        <Text style={styles.readOnlyFooterText}>
          Les photos ne peuvent pas être modifiées pour cette culture.
        </Text>
      ) : null}
    </View>
  );
}

// ======================================================
// CARTE INTERVENTION
// ======================================================

function InterventionCard({
  intervention,
  parcelleId,
  cultureId,
  cultureNom,
  parcelleNom,
  statutCulture,
  modificationAutorisee,
  onModifier,
  onSupprimer,
}: {
  intervention: Intervention;
  parcelleId: string;
  cultureId: string;
  cultureNom: string;
  parcelleNom: string;
  statutCulture?: StatutCulture;
  modificationAutorisee: boolean;
  onModifier: (intervention: Intervention) => void;
  onSupprimer: (intervention: Intervention) => void;
}) {
  return (
    <Card style={styles.interventionCard}>
      <View style={styles.interventionHeader}>
        <View style={styles.interventionHeaderLeft}>
          <View style={styles.interventionIcon}>
            <Sprout
              size={21}
              color={colors.primary[600]}
              strokeWidth={2}
            />
          </View>

          <View style={styles.interventionHeaderContent}>
            <Text
              numberOfLines={1}
              style={styles.interventionType}
            >
              {intervention.type || 'Intervention'}
            </Text>

            <View style={styles.interventionSubtitleRow}>
              <Sprout
                size={11}
                color={colors.neutral[500]}
                strokeWidth={2}
              />
              <Text
                numberOfLines={1}
                style={styles.interventionSubtitle}
              >
                {cultureNom || 'Culture'}
              </Text>

              <MapPin
                size={11}
                color={colors.neutral[500]}
                strokeWidth={2}
              />
              <Text
                numberOfLines={1}
                style={styles.interventionSubtitle}
              >
                {parcelleNom || 'Parcelle'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <Badge
            label={libelleStatut(statutCulture)}
            variant={badgeVariant(statutCulture)}
            dot
          />
        </View>
      </View>

      <View style={styles.cardSeparator} />

      <View style={styles.infoGrid}>
        <View style={styles.infoCard}>
          <View style={styles.infoCardIcon}>
            <CalendarDays
              size={16}
              color={colors.primary[600]}
              strokeWidth={2}
            />
          </View>
          <View style={styles.infoCardContent}>
            <Text style={styles.infoCardLabel}>DATE</Text>
            <Text style={styles.infoCardValue}>
              {formaterDate(interventionDate(intervention))}
            </Text>
          </View>
        </View>

        {intervention.produit ? (
          <View style={styles.infoCard}>
            <View style={styles.infoCardIcon}>
              <FlaskConical
                size={16}
                color={colors.primary[600]}
                strokeWidth={2}
              />
            </View>
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardLabel}>PRODUIT</Text>
              <Text
                style={styles.infoCardValue}
                numberOfLines={2}
              >
                {intervention.produit}
              </Text>
            </View>
          </View>
        ) : null}

        {intervention.quantite !== undefined &&
        intervention.quantite !== null ? (
          <View style={styles.infoCard}>
            <View style={styles.infoCardIcon}>
              <Package
                size={16}
                color={colors.primary[600]}
                strokeWidth={2}
              />
            </View>
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardLabel}>QUANTITÉ</Text>
              <Text style={styles.infoCardValue}>
                {intervention.quantite}{' '}
                {intervention.unite || ''}
              </Text>
            </View>
          </View>
        ) : null}

        {intervention.cout !== undefined &&
        intervention.cout !== null ? (
          <View style={styles.infoCard}>
            <View style={styles.infoCardIcon}>
              <Text style={styles.currencyIcon}>Ar</Text>
            </View>
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardLabel}>COÛT</Text>
              <Text style={styles.infoCardValue}>
                {formaterMontant(intervention.cout)}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.descriptionCard}>
        <View style={styles.descriptionHeader}>
          <View style={styles.infoCardIcon}>
            <FileText
              size={15}
              color={colors.primary[600]}
              strokeWidth={2}
            />
          </View>
          <Text style={styles.infoCardLabel}>DESCRIPTION</Text>
        </View>

        <Text style={styles.interventionDescription}>
          {intervention.description || 'Aucune description.'}
        </Text>
      </View>

      <PhotosIntervention
        parcelleId={parcelleId}
        cultureId={cultureId}
        interventionId={intervention.id}
        modificationAutorisee={modificationAutorisee}
      />

      <View style={styles.cardFooter}>
        <View style={styles.modifiedInfo}>
          <Clock3
            size={14}
            color={colors.neutral[400]}
            strokeWidth={1.9}
          />
          <Text style={styles.modifiedText} numberOfLines={1}>
            Enregistrée le {formaterDate(interventionDate(intervention))}
          </Text>
        </View>

        <View style={styles.detailsButton}>
          <Text style={styles.detailsButtonText}>Détails</Text>
          <ChevronRight
            size={16}
            color={colors.primary[700]}
            strokeWidth={2.2}
          />
        </View>
      </View>

      {modificationAutorisee ? (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onModifier(intervention)}
            activeOpacity={0.8}
          >
            <Pencil
              size={16}
              color="#166534"
              strokeWidth={2.1}
            />
            <Text style={styles.editButtonText}>Modifier</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onSupprimer(intervention)}
            activeOpacity={0.8}
          >
            <Trash2
              size={16}
              color="#DC2626"
              strokeWidth={2.1}
            />
            <Text style={styles.deleteButtonText}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.readOnlyFooter}>
          <Text style={styles.readOnlyFooterText}>
            Lecture seule
          </Text>
        </View>
      )}
    </Card>
  );
}

// ======================================================
// FILTRE
// ======================================================

function FilterModal({
  visible,
  onClose,
  parcelles,
  parcellesLoading,
  cultures,
  culturesLoading,
  parcelleTemporaire,
  cultureTemporaire,
  selectionParcelleOuverte,
  selectionCultureOuverte,
  onToggleParcelle,
  onToggleCulture,
  onSelectParcelle,
  onSelectCulture,
  onApply,
  onReset,
  onViewFollow,
  modeAjout,
  onContinueAjout,
}: {
  visible: boolean;
  onClose: () => void;
  parcelles: any[];
  parcellesLoading: boolean;
  cultures: any[];
  culturesLoading: boolean;
  parcelleTemporaire: string;
  cultureTemporaire: string;
  selectionParcelleOuverte: boolean;
  selectionCultureOuverte: boolean;
  onToggleParcelle: () => void;
  onToggleCulture: () => void;
  onSelectParcelle: (id: string) => void;
  onSelectCulture: (id: string) => void;
  onApply: () => void;
  onReset: () => void;
  onViewFollow: () => void;
  modeAjout: boolean;
  onContinueAjout: () => void;
}) {
  const parcellePourSelection =
    parcelles.find(item => item.id === parcelleTemporaire);

  const culturePourSelection =
    cultures.find(item => item.id === cultureTemporaire);

  const culturesDisponibles = cultures.filter(
    culture => culture.statut !== 'SUPPRIMEE',
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.filterSheet}>
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>
                {modeAjout
                  ? 'Ajouter une intervention'
                  : 'Filtrer les interventions'}
              </Text>
              <Text style={styles.sheetSubtitle}>
                {modeAjout
                  ? 'Choisissez une parcelle et une culture'
                  : 'Parcelle puis culture'}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              style={styles.sheetCloseButton}
            >
              <X size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}
          >
            <Text style={styles.filterLabel}>PARCELLE</Text>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.filterSelectModal,
                selectionParcelleOuverte &&
                  styles.filterSelectOpen,
              ]}
              onPress={onToggleParcelle}
            >
              <View style={styles.filterSelectLeft}>
                <View style={styles.filterSelectIcon}>
                  <MapPin size={18} color="#166534" />
                </View>

                <Text
                  style={[
                    styles.filterSelectText,
                    !parcelleTemporaire &&
                      styles.filterSelectPlaceholder,
                  ]}
                  numberOfLines={1}
                >
                  {parcellePourSelection?.nom ??
                    'Sélectionner une parcelle'}
                </Text>
              </View>

              <ChevronDown
                size={19}
                color="#6B7280"
                style={
                  selectionParcelleOuverte
                    ? styles.chevronRotated
                    : undefined
                }
              />
            </TouchableOpacity>

            {selectionParcelleOuverte ? (
              <View style={styles.filterDropdown}>
                {parcellesLoading ? (
                  <View style={styles.dropdownLoading}>
                    <ActivityIndicator color="#166534" />
                    <Text style={styles.dropdownLoadingText}>
                      Chargement des parcelles...
                    </Text>
                  </View>
                ) : parcelles.length === 0 ? (
                  <Text style={styles.dropdownEmpty}>
                    Aucune parcelle disponible.
                  </Text>
                ) : (
                  <ScrollView
                    nestedScrollEnabled
                    style={styles.filterDropdownScroll}
                  >
                    {parcelles.map(item => (
                      <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.7}
                        style={[
                          styles.filterDropdownItem,
                          parcelleTemporaire === item.id &&
                            styles.filterDropdownItemSelected,
                        ]}
                        onPress={() => onSelectParcelle(item.id)}
                      >
                        <View style={styles.dropdownItemLeft}>
                          <MapPin
                            size={16}
                            color={
                              parcelleTemporaire === item.id
                                ? '#166534'
                                : '#9CA3AF'
                            }
                          />
                          <Text
                            style={[
                              styles.filterDropdownItemText,
                              parcelleTemporaire === item.id &&
                                styles.filterDropdownItemTextSelected,
                            ]}
                            numberOfLines={1}
                          >
                            {item.nom}
                          </Text>
                        </View>

                        {parcelleTemporaire === item.id ? (
                          <Check
                            size={18}
                            color="#166534"
                            strokeWidth={2.5}
                          />
                        ) : null}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            ) : null}

            <Text style={[styles.filterLabel, styles.filterLabelCulture]}>
              CULTURE
            </Text>

            <TouchableOpacity
              activeOpacity={parcelleTemporaire ? 0.8 : 1}
              disabled={!parcelleTemporaire}
              style={[
                styles.filterSelectModal,
                !parcelleTemporaire &&
                  styles.filterSelectDisabled,
                selectionCultureOuverte &&
                  styles.filterSelectOpen,
              ]}
              onPress={onToggleCulture}
            >
              <View style={styles.filterSelectLeft}>
                <View
                  style={[
                    styles.filterSelectIcon,
                    !parcelleTemporaire &&
                      styles.filterSelectIconDisabled,
                  ]}
                >
                  <Sprout
                    size={18}
                    color={
                      parcelleTemporaire
                        ? '#166534'
                        : '#9CA3AF'
                    }
                  />
                </View>

                <Text
                  style={[
                    styles.filterSelectText,
                    !cultureTemporaire &&
                      styles.filterSelectPlaceholder,
                  ]}
                  numberOfLines={1}
                >
                  {parcelleTemporaire
                    ? culturePourSelection?.nom ??
                      'Sélectionner une culture'
                    : 'Choisissez d’abord une parcelle'}
                </Text>
              </View>

              <ChevronDown
                size={19}
                color={
                  parcelleTemporaire
                    ? '#6B7280'
                    : '#9CA3AF'
                }
                style={
                  selectionCultureOuverte
                    ? styles.chevronRotated
                    : undefined
                }
              />
            </TouchableOpacity>

            {selectionCultureOuverte && parcelleTemporaire ? (
              <View style={styles.filterDropdown}>
                {culturesLoading ? (
                  <View style={styles.dropdownLoading}>
                    <ActivityIndicator color="#166534" />
                    <Text style={styles.dropdownLoadingText}>
                      Chargement des cultures...
                    </Text>
                  </View>
                ) : culturesDisponibles.length === 0 ? (
                  <Text style={styles.dropdownEmpty}>
                    Aucune culture disponible.
                  </Text>
                ) : (
                  <ScrollView
                    nestedScrollEnabled
                    style={styles.filterDropdownScroll}
                  >
                    {culturesDisponibles.map(culture => {
                      const autorisee =
                        culture.statut !== 'RECOLTEE' &&
                        culture.statut !== 'ABANDONNEE';

                      return (
                        <TouchableOpacity
                          key={culture.id}
                          activeOpacity={autorisee ? 0.7 : 1}
                          disabled={!autorisee}
                          style={[
                            styles.filterCultureItem,
                            cultureTemporaire === culture.id &&
                              styles.filterCultureItemSelected,
                            !autorisee &&
                              styles.filterCultureItemDisabled,
                          ]}
                          onPress={() =>
                            onSelectCulture(culture.id)
                          }
                        >
                          <View style={styles.filterCultureInfo}>
                            <View style={styles.filterCultureNameRow}>
                              <Sprout
                                size={16}
                                color={
                                  autorisee
                                    ? '#166534'
                                    : '#9CA3AF'
                                }
                              />
                              <Text
                                style={[
                                  styles.filterCultureName,
                                  !autorisee &&
                                    styles.disabledCultureText,
                                ]}
                                numberOfLines={1}
                              >
                                {culture.nom}
                              </Text>
                            </View>

                            <Text style={styles.filterCultureStatus}>
                              {libelleStatut(culture.statut)}
                            </Text>
                          </View>

                          {cultureTemporaire === culture.id ? (
                            <View style={styles.selectedCheckCircle}>
                              <Check
                                size={15}
                                color="#FFFFFF"
                                strokeWidth={2.8}
                              />
                            </View>
                          ) : null}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
            ) : null}

            {!modeAjout ? (
              <>
                <TouchableOpacity
                  activeOpacity={
                    parcelleTemporaire && cultureTemporaire
                      ? 0.85
                      : 1
                  }
                  disabled={!parcelleTemporaire || !cultureTemporaire}
                  onPress={onViewFollow}
                  style={[
                    styles.followButton,
                    (!parcelleTemporaire || !cultureTemporaire) &&
                      styles.followButtonDisabled,
                  ]}
                >
                  <View style={styles.followButtonIcon}>
                    <Sprout
                      size={19}
                      color="#FFFFFF"
                      strokeWidth={2.2}
                    />
                  </View>
                  <View style={styles.followButtonContent}>
                    <Text style={styles.followButtonTitle}>
                      Voir le suivi
                    </Text>
                    <Text
                      style={styles.followButtonSubtitle}
                      numberOfLines={1}
                    >
                      {cultureTemporaire
                        ? `${culturePourSelection?.nom ?? 'Culture'} • ${parcellePourSelection?.nom ?? 'Parcelle'}`
                        : 'Sélectionnez une parcelle et une culture'}
                    </Text>
                  </View>
                  <ChevronRight
                    size={20}
                    color={
                      parcelleTemporaire && cultureTemporaire
                        ? '#FFFFFF'
                        : '#9CA3AF'
                    }
                  />
                </TouchableOpacity>
              </>
            ) : null}

            <View style={styles.filterPanelActions}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.resetSmallButton}
                onPress={onClose}
              >
                <Text style={styles.resetSmallButtonText}>
                  {modeAjout ? 'Annuler' : 'Réinitialiser'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.applySmallButton}
                onPress={modeAjout ? onContinueAjout : onApply}
              >
                <Check
                  size={16}
                  color="#FFFFFF"
                  strokeWidth={2.5}
                />
                <Text style={styles.applySmallButtonText}>
                  {modeAjout ? 'Continuer' : 'Appliquer'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ======================================================
// ÉCRAN PRINCIPAL
// ======================================================

export default function InterventionsCultureScreen() {
  const params = useLocalSearchParams<{
    parcelleId?: string;
    cultureId?: string;
    parcelleNom?: string;
    cultureNom?: string;
    statut?: string;
  }>();

  const parcelleId =
    typeof params.parcelleId === 'string'
      ? params.parcelleId
      : '';

  const cultureId =
    typeof params.cultureId === 'string'
      ? params.cultureId
      : '';

  const parcelleNom =
    typeof params.parcelleNom === 'string'
      ? params.parcelleNom
      : '';

  const cultureNom =
    typeof params.cultureNom === 'string'
      ? params.cultureNom
      : '';

  const statut =
    typeof params.statut === 'string'
      ? (params.statut as StatutCulture)
      : undefined;

  const modeGlobal = !parcelleId || !cultureId;

  // ====================================================
  // SÉLECTION GLOBALE
  // ====================================================

  const [parcelleSelectionnee, setParcelleSelectionnee] =
    useState('');

  const [cultureSelectionnee, setCultureSelectionnee] =
    useState('');

  const [parcelleTemporaire, setParcelleTemporaire] =
    useState('');

  const [cultureTemporaire, setCultureTemporaire] =
    useState('');

  const [selectionParcelleOuverte, setSelectionParcelleOuverte] =
    useState(false);

  const [selectionCultureOuverte, setSelectionCultureOuverte] =
    useState(false);

  const [filtreOuvert, setFiltreOuvert] = useState(false);

  const [modeAjoutGlobal, setModeAjoutGlobal] = useState(false);

  const [recherche, setRecherche] = useState('');

  const [refreshing, setRefreshing] = useState(false);

  const parcellesQuery = useParcelles();
  const parcelles = parcellesQuery.data ?? [];

  const culturesFiltreQuery =
    useCultures(parcelleTemporaire);
  const culturesFiltre = culturesFiltreQuery.data ?? [];

  // ====================================================
  // CULTURES DE TOUTES LES PARCELLES
  // ====================================================

  const culturesGlobalesQueries = useQueries({
    queries: parcelles.map(parcelle => ({
      queryKey: ['cultures', parcelle.id],
      queryFn: () => getCultures(parcelle.id),
      enabled: !!parcelle.id,
    })),
  });

  const culturesGlobales = useMemo<CultureGlobale[]>(() => {
    const resultat: CultureGlobale[] = [];

    parcelles.forEach((parcelle, index) => {
      const cultures = culturesGlobalesQueries[index]?.data ?? [];

      cultures.forEach(culture => {
        if (culture.statut === 'SUPPRIMEE') {
          return;
        }

        resultat.push({
          ...culture,
          parcelleId: parcelle.id,
          parcelleNom: parcelle.nom,
        });
      });
    });

    return resultat;
  }, [culturesGlobalesQueries, parcelles]);

  // ====================================================
  // INTERVENTIONS DE TOUTES LES CULTURES
  // ====================================================

  const interventionsGlobalesQueries = useQueries({
    queries: culturesGlobales.map(culture => ({
      queryKey: [
        'interventions',
        culture.parcelleId,
        culture.id,
      ],
      queryFn: () =>
        getInterventions(culture.parcelleId, culture.id),
      enabled: !!culture.parcelleId && !!culture.id,
    })),
  });

  const interventionsGlobales = useMemo<InterventionGlobale[]>(() => {
    const resultat: InterventionGlobale[] = [];

    culturesGlobales.forEach((culture, index) => {
      const interventions =
        interventionsGlobalesQueries[index]?.data ?? [];

      interventions.forEach(rawIntervention => {
        const intervention = rawIntervention as Intervention;

        resultat.push({
          intervention,
          parcelleId: culture.parcelleId,
          parcelleNom: culture.parcelleNom,
          cultureId: culture.id,
          cultureNom: culture.nom,
          statutCulture: culture.statut as StatutCulture,
        });
      });
    });

    return resultat.sort(
      (a, b) =>
        new Date(interventionDate(b.intervention) ?? 0).getTime() -
        new Date(interventionDate(a.intervention) ?? 0).getTime(),
    );
  }, [
    culturesGlobales,
    interventionsGlobalesQueries,
  ]);

  const interventionsGlobalesFiltrees = useMemo(() => {
    const terme = recherche.trim().toLowerCase();

    return interventionsGlobales.filter(item => {
      const texte = [
        item.intervention.type,
        item.intervention.description,
        item.intervention.produit,
        item.intervention.unite,
        item.intervention.quantite,
        item.intervention.cout,
        item.cultureNom,
        item.parcelleNom,
        item.statutCulture,
      ]
        .filter(value => value !== undefined && value !== null)
        .join(' ')
        .toLowerCase();

      const correspondRecherche =
        !terme || texte.includes(terme);

      const correspondParcelle =
        !parcelleSelectionnee ||
        item.parcelleId === parcelleSelectionnee;

      const correspondCulture =
        !cultureSelectionnee ||
        item.cultureId === cultureSelectionnee;

      return (
        correspondRecherche &&
        correspondParcelle &&
        correspondCulture
      );
    });
  }, [
    interventionsGlobales,
    recherche,
    parcelleSelectionnee,
    cultureSelectionnee,
  ]);

  const statistiquesGlobales = useMemo(() => {
    const total = interventionsGlobales.length;
    const septJours = 7 * 24 * 60 * 60 * 1000;

    const recentes = interventionsGlobales.filter(item => {
      const timestamp = new Date(
        interventionDate(item.intervention) ?? '',
      ).getTime();

      return (
        Number.isFinite(timestamp) &&
        Date.now() - timestamp <= septJours
      );
    }).length;

    return { total, recentes };
  }, [interventionsGlobales]);

  const chargementGlobal =
    parcellesQuery.isLoading ||
    culturesGlobalesQueries.some(query => query.isLoading) ||
    interventionsGlobalesQueries.some(query => query.isLoading);

  const erreurGlobal =
    parcellesQuery.isError ||
    culturesGlobalesQueries.some(query => query.isError) ||
    interventionsGlobalesQueries.some(query => query.isError);

  const filtreActif =
    !!parcelleSelectionnee ||
    !!cultureSelectionnee;

  // ====================================================
  // INTERVENTIONS CULTURE COURANTE
  // ====================================================

  const interventionsQuery = useInterventions(
    parcelleId,
    cultureId,
  );

  const createMutation = useCreateIntervention();
  const updateMutation = useUpdateIntervention();
  const deleteMutation = useDeleteIntervention();

  const interventions: Intervention[] = useMemo(() => {
    return [...((interventionsQuery.data ?? []) as Intervention[])].sort(
      (a, b) =>
        new Date(b.date ?? 0).getTime() -
        new Date(a.date ?? 0).getTime(),
    );
  }, [interventionsQuery.data]);

  const interventionsFiltrees = useMemo(() => {
    const terme = recherche.trim().toLowerCase();

    if (!terme) {
      return interventions;
    }

    return interventions.filter(intervention => {
      const texte = [
        intervention.type,
        intervention.description,
        intervention.produit,
        intervention.unite,
        intervention.quantite,
        intervention.cout,
      ]
        .filter(value => value !== undefined && value !== null)
        .join(' ')
        .toLowerCase();

      return texte.includes(terme);
    });
  }, [interventions, recherche]);

  const statistiquesCourantes = useMemo(() => {
    const total = interventions.length;
    const septJours = 7 * 24 * 60 * 60 * 1000;

    const recentes = interventions.filter(intervention => {
      const timestamp = new Date(
        interventionDate(intervention) ?? '',
      ).getTime();

      return (
        Number.isFinite(timestamp) &&
        Date.now() - timestamp <= septJours
      );
    }).length;

    return { total, recentes };
  }, [interventions]);

  // ====================================================
  // RÈGLES STATUT
  // ====================================================

  const cultureSupprimee = statut === 'SUPPRIMEE';
  const lectureSeule =
    statut === 'RECOLTEE' ||
    statut === 'ABANDONNEE';
  const modificationAutorisee =
    !cultureSupprimee && !lectureSeule;

  // ====================================================
  // FORMULAIRE INLINE — CONSERVÉ
  // ====================================================

  const [formOuvert, setFormOuvert] = useState(false);

  const [interventionEnModification, setInterventionEnModification] =
    useState<Intervention | null>(null);

  const [contexteFormulaire, setContexteFormulaire] =
    useState<ContexteFormulaire | null>(null);

  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [produit, setProduit] = useState('');
  const [quantite, setQuantite] = useState('');
  const [unite, setUnite] = useState('');
  const [cout, setCout] = useState('');

  // ====================================================
  // REFRESH
  // ====================================================

  const chargerInterventions = useCallback(async () => {
    if (parcelleId && cultureId) {
      await interventionsQuery.refetch();
    }
  }, [cultureId, interventionsQuery, parcelleId]);

  useFocusEffect(
    useCallback(() => {
      chargerInterventions();
    }, [chargerInterventions]),
  );

  const actualiser = useCallback(async () => {
    setRefreshing(true);

    try {
      const requetes: Promise<unknown>[] = [
        parcellesQuery.refetch(),
        ...culturesGlobalesQueries.map(query => query.refetch()),
        ...interventionsGlobalesQueries.map(query => query.refetch()),
      ];

      if (parcelleId && cultureId) {
        requetes.push(interventionsQuery.refetch());
      }

      await Promise.all(requetes);
    } finally {
      setRefreshing(false);
    }
  }, [
    parcellesQuery,
    culturesGlobalesQueries,
    interventionsGlobalesQueries,
    interventionsQuery,
    parcelleId,
    cultureId,
  ]);

  // ====================================================
  // FILTRE
  // ====================================================

  const ouvrirFiltre = () => {
    setModeAjoutGlobal(false);
    setParcelleTemporaire(parcelleSelectionnee);
    setCultureTemporaire(cultureSelectionnee);
    setSelectionParcelleOuverte(false);
    setSelectionCultureOuverte(false);
    setFiltreOuvert(true);
  };

  const fermerFiltre = () => {
    setModeAjoutGlobal(false);
    setSelectionParcelleOuverte(false);
    setSelectionCultureOuverte(false);
    setFiltreOuvert(false);
  };

  const appliquerFiltre = () => {
    setParcelleSelectionnee(parcelleTemporaire);
    setCultureSelectionnee(cultureTemporaire);
    setSelectionParcelleOuverte(false);
    setSelectionCultureOuverte(false);
    setFiltreOuvert(false);
  };

  const reinitialiserFiltre = () => {
    setParcelleTemporaire('');
    setCultureTemporaire('');
    setParcelleSelectionnee('');
    setCultureSelectionnee('');
    setSelectionParcelleOuverte(false);
    setSelectionCultureOuverte(false);
    setFiltreOuvert(false);
  };

  const ouvrirAjout = () => {
    if (!parcelleId || !cultureId) {
      return;
    }

    if (!modificationAutorisee) {
      Alert.alert(
        'Action impossible',
        'Cette culture est en lecture seule.',
      );
      return;
    }

    setInterventionEnModification(null);
    setContexteFormulaire({
      parcelleId,
      cultureId,
      statut: statut ?? 'EN_COURS',
    });

    setType('');
    setDescription('');
    setDate(new Date().toISOString());
    setProduit('');
    setQuantite('');
    setUnite('');
    setCout('');
    setFormOuvert(true);
  };

  const ouvrirModification = (
    intervention: Intervention,
  ) => {
    if (!modificationAutorisee) {
      return;
    }

    setInterventionEnModification(intervention);
    setContexteFormulaire({
      parcelleId,
      cultureId,
      statut: statut ?? 'EN_COURS',
    });

    setType(intervention.type ?? '');
    setDescription(intervention.description ?? '');
    setDate(interventionDate(intervention) ?? new Date().toISOString());
    setProduit(intervention.produit ?? '');
    setQuantite(
      intervention.quantite === undefined ||
        intervention.quantite === null
        ? ''
        : String(intervention.quantite),
    );
    setUnite(intervention.unite ?? '');
    setCout(
      intervention.cout === undefined ||
        intervention.cout === null
        ? ''
        : String(intervention.cout),
    );
    setFormOuvert(true);
  };

  const ouvrirModificationGlobale = (
    item: InterventionGlobale,
  ) => {
    const autorisee =
      item.statutCulture !== 'SUPPRIMEE' &&
      item.statutCulture !== 'RECOLTEE' &&
      item.statutCulture !== 'ABANDONNEE';

    if (!autorisee) {
      return;
    }

    setInterventionEnModification(item.intervention);
    setContexteFormulaire({
      parcelleId: item.parcelleId,
      cultureId: item.cultureId,
      statut: item.statutCulture,
    });

    const intervention = item.intervention;

    setType(intervention.type ?? '');
    setDescription(intervention.description ?? '');
    setDate(interventionDate(intervention) ?? new Date().toISOString());
    setProduit(intervention.produit ?? '');
    setQuantite(
      intervention.quantite === undefined ||
        intervention.quantite === null
        ? ''
        : String(intervention.quantite),
    );
    setUnite(intervention.unite ?? '');
    setCout(
      intervention.cout === undefined ||
        intervention.cout === null
        ? ''
        : String(intervention.cout),
    );

    setFormOuvert(true);
  };

  const fermerFormulaire = () => {
    setFormOuvert(false);
    setInterventionEnModification(null);
    setContexteFormulaire(null);
    setType('');
    setDescription('');
    setDate('');
    setProduit('');
    setQuantite('');
    setUnite('');
    setCout('');
  };

  const enregistrerIntervention = async () => {
    const contexte = contexteFormulaire;

    if (!contexte) {
      return;
    }

    if (!modificationAutorisee && contexte.parcelleId === parcelleId) {
      Alert.alert(
        'Action impossible',
        'Cette culture est en lecture seule.',
      );
      return;
    }

    if (!type.trim()) {
      Alert.alert(
        'Champ obligatoire',
        "Veuillez saisir le type d'intervention.",
      );
      return;
    }

    if (!date.trim()) {
      Alert.alert(
        'Champ obligatoire',
        'Veuillez saisir la date.',
      );
      return;
    }

    let quantiteValue: number | undefined;
    if (quantite.trim()) {
      quantiteValue = Number(
        quantite.replace(/\s/g, '').replace(',', '.'),
      );

      if (
        Number.isNaN(quantiteValue) ||
        quantiteValue < 0
      ) {
        Alert.alert(
          'Quantité invalide',
          'Veuillez saisir une quantité numérique valide.',
        );
        return;
      }
    }

    let coutValue: number | undefined;
    if (cout.trim()) {
      coutValue = Number(
        cout.replace(/\s/g, '').replace(',', '.'),
      );

      if (
        Number.isNaN(coutValue) ||
        coutValue < 0
      ) {
        Alert.alert(
          'Coût invalide',
          'Veuillez saisir un coût numérique valide.',
        );
        return;
      }
    }

    const data = {
      type: type.trim(),
      description: description.trim() || undefined,
      date: date.trim(),
      produit: produit.trim() || undefined,
      quantite: quantiteValue,
      unite: unite.trim() || undefined,
      cout: coutValue,
    };

    try {
      if (interventionEnModification) {
        await updateMutation.mutateAsync({
          parcelleId: contexte.parcelleId,
          cultureId: contexte.cultureId,
          interventionId: interventionEnModification.id,
          data,
        });

        Alert.alert(
          'Succès',
          'L’intervention a été modifiée avec succès.',
        );
      } else {
        await createMutation.mutateAsync({
          parcelleId: contexte.parcelleId,
          cultureId: contexte.cultureId,
          data,
        });

        Alert.alert(
          'Succès',
          'L’intervention a été enregistrée avec succès.',
        );
      }

      fermerFormulaire();

      if (
        contexte.parcelleId === parcelleId &&
        contexte.cultureId === cultureId
      ) {
        await interventionsQuery.refetch();
      }

      await Promise.all(
        interventionsGlobalesQueries.map(query =>
          query.refetch(),
        ),
      );
    } catch (error: any) {
      console.error(
        'ERREUR INTERVENTION:',
        error?.response?.data || error,
      );

      Alert.alert(
        'Erreur',
        normaliserErreur(error),
      );
    }
  };

  const supprimerIntervention = (
    intervention: Intervention,
  ) => {
    if (lectureSeule) {
      Alert.alert(
        'Lecture seule',
        'Cette culture ne peut plus être modifiée.',
      );
      return;
    }

    if (cultureSupprimee) {
      Alert.alert(
        'Action impossible',
        'Cette culture a été supprimée.',
      );
      return;
    }

    Alert.alert(
      'Supprimer l’intervention',
      'Voulez-vous vraiment supprimer cette intervention ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync({
                parcelleId,
                cultureId,
                interventionId: intervention.id,
              });

              await interventionsQuery.refetch();

              await Promise.all(
                interventionsGlobalesQueries.map(query =>
                  query.refetch(),
                ),
              );
            } catch (error: any) {
              console.error(
                'ERREUR SUPPRESSION INTERVENTION:',
                error?.response?.data || error,
              );

              Alert.alert(
                'Erreur',
                normaliserErreur(error),
              );
            }
          },
        },
      ],
    );
  };

  const supprimerInterventionGlobale = (
    item: InterventionGlobale,
  ) => {
    const autorisee =
      item.statutCulture !== 'SUPPRIMEE' &&
      item.statutCulture !== 'RECOLTEE' &&
      item.statutCulture !== 'ABANDONNEE';

    if (!autorisee) {
      Alert.alert(
        'Lecture seule',
        'Cette intervention appartient à une culture en lecture seule.',
      );
      return;
    }

    Alert.alert(
      'Supprimer l’intervention',
      'Voulez-vous vraiment supprimer cette intervention ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync({
                parcelleId: item.parcelleId,
                cultureId: item.cultureId,
                interventionId: item.intervention.id,
              });

              await Promise.all(
                interventionsGlobalesQueries.map(query =>
                  query.refetch(),
                ),
              );
            } catch (error: any) {
              console.error(
                'ERREUR SUPPRESSION INTERVENTION GLOBALE:',
                error?.response?.data || error,
              );
              Alert.alert('Erreur', normaliserErreur(error));
            }
          },
        },
      ],
    );
  };

  const ouvrirAjoutGlobal = () => {
    setModeAjoutGlobal(true);
    setParcelleTemporaire('');
    setCultureTemporaire('');
    setSelectionParcelleOuverte(false);
    setSelectionCultureOuverte(false);
    setFiltreOuvert(true);
  };

  const continuerAjoutGlobal = () => {
    if (!parcelleTemporaire) {
      Alert.alert(
        'Sélection incomplète',
        'Veuillez sélectionner une parcelle.',
      );
      return;
    }

    if (!cultureTemporaire) {
      Alert.alert(
        'Sélection incomplète',
        'Veuillez sélectionner une culture.',
      );
      return;
    }

    const parcelle = parcelles.find(
      item => item.id === parcelleTemporaire,
    );

    const culture = culturesFiltre.find(
      item => item.id === cultureTemporaire,
    );

    if (!parcelle || !culture) {
      Alert.alert(
        'Erreur',
        'La parcelle ou la culture sélectionnée est introuvable.',
      );
      return;
    }

    const autorisee =
      culture.statut !== 'SUPPRIMEE' &&
      culture.statut !== 'RECOLTEE' &&
      culture.statut !== 'ABANDONNEE';

    if (!autorisee) {
      Alert.alert(
        'Action impossible',
        'Cette culture est en lecture seule. Vous ne pouvez pas ajouter une intervention.',
      );
      return;
    }

    setModeAjoutGlobal(false);
    setFiltreOuvert(false);
    setSelectionParcelleOuverte(false);
    setSelectionCultureOuverte(false);

    router.push({
      pathname: '/ajout-intervention',
      params: {
        parcelleId: parcelle.id,
        cultureId: culture.id,
        parcelleNom: parcelle.nom,
        cultureNom: culture.nom,
        statut: culture.statut,
      },
    });
  };

  const contexteValideGlobal =
    contexteFormulaire &&
    contexteFormulaire.statut !== 'RECOLTEE' &&
    contexteFormulaire.statut !== 'ABANDONNEE' &&
    contexteFormulaire.statut !== 'SUPPRIMEE';

  const renderFormulaireInline = (
    cultureLabel: string,
    parcelleLabel: string,
  ) => {
    if (!formOuvert || !contexteValideGlobal) {
      return null;
    }

    return (
      <View style={styles.formCard}>
        <View style={styles.formHeaderRow}>
          <View style={styles.formHeaderCopy}>
            <Text style={styles.formTitle}>
              {interventionEnModification
                ? 'Modifier l’intervention'
                : 'Nouvelle intervention'}
            </Text>
            <Text style={styles.formSubtitle}>
              {cultureLabel || 'Culture'} • {parcelleLabel || 'Parcelle'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.formCloseButton}
            onPress={fermerFormulaire}
            activeOpacity={0.8}
          >
            <X size={19} color="#374151" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Type d’intervention *</Text>
        <TextInput
          style={styles.input}
          value={type}
          onChangeText={setType}
          placeholder="Ex : FERTILISATION"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="characters"
          editable={!createMutation.isPending && !updateMutation.isPending}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Décrire l’intervention..."
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          editable={!createMutation.isPending && !updateMutation.isPending}
        />

        <Text style={styles.label}>Date *</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="2026-09-04T10:00:00.000Z"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          editable={!createMutation.isPending && !updateMutation.isPending}
        />
        <Text style={styles.dateHelp}>
          Exemple : 2026-09-04T10:00:00.000Z
        </Text>

        <Text style={styles.label}>Produit</Text>
        <TextInput
          style={styles.input}
          value={produit}
          onChangeText={setProduit}
          placeholder="Ex : NPK 15-15-15"
          placeholderTextColor="#9CA3AF"
          editable={!createMutation.isPending && !updateMutation.isPending}
        />

        <View style={styles.formTwoColumns}>
          <View style={styles.formColumn}>
            <Text style={styles.label}>Quantité</Text>
            <TextInput
              style={styles.input}
              value={quantite}
              onChangeText={setQuantite}
              placeholder="0"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
              editable={!createMutation.isPending && !updateMutation.isPending}
            />
          </View>

          <View style={styles.formColumn}>
            <Text style={styles.label}>Unité</Text>
            <TextInput
              style={styles.input}
              value={unite}
              onChangeText={setUnite}
              placeholder="kg / L / unité"
              placeholderTextColor="#9CA3AF"
              editable={!createMutation.isPending && !updateMutation.isPending}
            />
          </View>
        </View>

        <Text style={styles.label}>Coût (Ar)</Text>
        <TextInput
          style={styles.input}
          value={cout}
          onChangeText={setCout}
          placeholder="0"
          placeholderTextColor="#9CA3AF"
          keyboardType="decimal-pad"
          editable={!createMutation.isPending && !updateMutation.isPending}
        />

        <View style={styles.formButtons}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={fermerFormulaire}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={enregistrerIntervention}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const voirSuivi = () => {
    if (!parcelleTemporaire) {
      Alert.alert(
        'Sélection incomplète',
        'Veuillez sélectionner une parcelle.',
      );
      return;
    }

    if (!cultureTemporaire) {
      Alert.alert(
        'Sélection incomplète',
        'Veuillez sélectionner une culture.',
      );
      return;
    }

    const parcelle = parcelles.find(
      item => item.id === parcelleTemporaire,
    );

    const culture = culturesFiltre.find(
      item => item.id === cultureTemporaire,
    );

    if (!parcelle || !culture) {
      Alert.alert(
        'Erreur',
        'La parcelle ou la culture sélectionnée est introuvable.',
      );
      return;
    }

    setFiltreOuvert(false);

    router.push({
      pathname: '/interventions-culture',
      params: {
        parcelleId: parcelle.id,
        cultureId: culture.id,
        parcelleNom: parcelle.nom,
        cultureNom: culture.nom,
        statut: culture.statut,
      },
    });
  };

  // ====================================================
  // COMPOSANTS INTERNES
  // ====================================================

  const renderCarteIntervention = (
    item: InterventionGlobale,
  ) => (
    <InterventionCard
      key={`${item.parcelleId}-${item.cultureId}-${item.intervention.id}`}
      intervention={item.intervention}
      parcelleId={item.parcelleId}
      cultureId={item.cultureId}
      parcelleNom={item.parcelleNom}
      cultureNom={item.cultureNom}
      statutCulture={item.statutCulture}
      modificationAutorisee={
        item.statutCulture !== 'SUPPRIMEE' &&
        item.statutCulture !== 'RECOLTEE' &&
        item.statutCulture !== 'ABANDONNEE'
      }
      onModifier={() => ouvrirModificationGlobale(item)}
      onSupprimer={() => supprimerInterventionGlobale(item)}
    />
  );

  // ====================================================
  // ETAT BLOQUÉ
  // ====================================================

  if (cultureSupprimee) {
    return (
      <View style={styles.root}>
        <View style={styles.center}>
          <Text style={styles.blockedIcon}>🚫</Text>
          <Text style={styles.blockedTitle}>
            Culture supprimée
          </Text>
          <Text style={styles.blockedText}>
            Cette culture est supprimée. Les interventions ne peuvent plus être
            modifiées.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.85}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
        <AppBottomBar />
      </View>
    );
  }

  // ====================================================
  // MODE GLOBAL
  // ====================================================

  if (modeGlobal) {
    return (
      <View style={styles.root}>
        <ScreenHeader
          title="Interventions"
          subtitle={`${statistiquesGlobales.total} intervention${
            statistiquesGlobales.total > 1 ? 's' : ''
          } • ${statistiquesGlobales.recentes} récentes`}
        />

        <View style={styles.topBar}>
          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <Search
                size={19}
                color="#9CA3AF"
                strokeWidth={2}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher intervention, culture, parcelle..."
                placeholderTextColor="#9CA3AF"
                value={recherche}
                onChangeText={setRecherche}
                returnKeyType="search"
              />

              {recherche ? (
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => setRecherche('')}
                  style={styles.clearSearchButton}
                >
                  <X size={17} color="#6B7280" />
                </TouchableOpacity>
              ) : null}
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.filterButton,
                filtreActif && styles.filterButtonActive,
              ]}
              onPress={ouvrirFiltre}
            >
              <SlidersHorizontal
                size={19}
                color={
                  filtreActif
                    ? '#FFFFFF'
                    : colors.neutral[700]
                }
                strokeWidth={2}
              />
              {filtreActif ? (
                <View style={styles.filterIndicator} />
              ) : null}
            </TouchableOpacity>
          </View>

          <View style={styles.statsBar}>
            <View style={styles.statPill}>
              <Text style={styles.statPillValue}>
                {interventionsGlobalesFiltrees.length}
              </Text>
              <Text style={styles.statPillLabel}>
                résultat
                {interventionsGlobalesFiltrees.length > 1
                  ? 's'
                  : ''}
              </Text>
            </View>

            <Text style={styles.statHint} numberOfLines={1}>
              {recherche
                ? `pour "${recherche}"`
                : filtreActif
                  ? 'Filtre actif'
                  : 'Triées par date récente'}
            </Text>
          </View>
        </View>

        <View style={styles.listArea}>
          <ScrollView
            style={styles.listScroll}
            contentContainerStyle={styles.listScrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={actualiser}
                tintColor={colors.primary[600]}
              />
            }
            showsVerticalScrollIndicator={false}
          >
            {contexteValideGlobal
              ? (() => {
                  const contexteCulture = culturesGlobales.find(
                    item =>
                      item.id === contexteFormulaire?.cultureId &&
                      item.parcelleId === contexteFormulaire?.parcelleId,
                  );

                  const contexteParcelle = parcelles.find(
                    item => item.id === contexteFormulaire?.parcelleId,
                  );

                  return renderFormulaireInline(
                    contexteCulture?.nom ??
                      (contexteFormulaire?.cultureId === cultureSelectionnee
                        ? culturesGlobales.find(
                            item =>
                              item.id === cultureSelectionnee &&
                              item.parcelleId === parcelleSelectionnee,
                          )?.nom ?? 'Culture'
                        : 'Culture'),
                    contexteParcelle?.nom ??
                      (contexteFormulaire?.parcelleId === parcelleSelectionnee
                        ? parcelles.find(
                            item => item.id === parcelleSelectionnee,
                          )?.nom ?? 'Parcelle'
                        : 'Parcelle'),
                  );
                })()
              : null}

            <View
              pointerEvents="none"
              style={[styles.fieldShape, styles.fieldShapeOne]}
            />
            <View
              pointerEvents="none"
              style={[styles.fieldShape, styles.fieldShapeTwo]}
            />
            <View
              pointerEvents="none"
              style={[styles.fieldShape, styles.fieldShapeThree]}
            />
            <View
              pointerEvents="none"
              style={[styles.fieldLine, styles.fieldLineOne]}
            />
            <View
              pointerEvents="none"
              style={[styles.fieldLine, styles.fieldLineTwo]}
            />

            {filtreActif ? (
              <View style={styles.activeFilterCard}>
                <View style={styles.activeFilterIcon}>
                  <SlidersHorizontal
                    size={15}
                    color="#166534"
                  />
                </View>
                <View style={styles.activeFilterContent}>
                  <Text style={styles.activeFilterTitle}>
                    Filtre actif
                  </Text>
                  <Text
                    style={styles.activeFilterText}
                    numberOfLines={2}
                  >
                    {parcelles.find(
                      item =>
                        item.id === parcelleSelectionnee,
                    )?.nom || 'Toutes les parcelles'}
                    {cultureSelectionnee
                      ? ` • ${culturesGlobales.find(
                          item =>
                            item.id === cultureSelectionnee,
                        )?.nom || 'Culture'}`
                      : ''}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={reinitialiserFiltre}
                  style={styles.activeFilterClear}
                  activeOpacity={0.8}
                >
                  <X size={17} color="#166534" />
                </TouchableOpacity>
              </View>
            ) : null}

            {chargementGlobal ? (
              <View style={styles.loadingInline}>
                <ActivityIndicator
                  color={colors.primary[600]}
                />
                <Text style={styles.loadingInlineText}>
                  Chargement des interventions...
                </Text>
              </View>
            ) : erreurGlobal ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>⚠️</Text>
                <Text style={styles.emptyTitle}>
                  Impossible de charger les interventions
                </Text>
                <Text style={styles.emptyText}>
                  Vérifiez votre connexion puis actualisez l’écran.
                </Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={actualiser}
                  activeOpacity={0.85}
                >
                  <Text style={styles.retryText}>Réessayer</Text>
                </TouchableOpacity>
              </View>
            ) : interventionsGlobalesFiltrees.length === 0 ? (
              <View style={styles.emptyInline}>
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyIcon}>🛠️</Text>
                  <Text style={styles.emptyTitle}>
                    Aucune intervention
                  </Text>
                  <Text style={styles.emptyText}>
                    {recherche
                      ? 'Aucune intervention ne correspond à votre recherche.'
                      : filtreActif
                        ? 'Aucune intervention ne correspond au filtre sélectionné.'
                        : "Aucune intervention n'a encore été enregistrée."}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.cardsList}>
                {interventionsGlobalesFiltrees.map(
                  renderCarteIntervention,
                )}
              </View>
            )}
          </ScrollView>
        </View>

        {formOuvert ? null : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ajouter une intervention"
            onPress={ouvrirAjoutGlobal}
            style={({ pressed }) => [
              styles.fab,
              pressed && {
                opacity: 0.9,
                transform: [{ scale: 0.94 }],
              },
            ]}
          >
            <Plus
              size={27}
              color="#FFFFFF"
              strokeWidth={2.7}
            />
          </Pressable>
        )}

        <FilterModal
          visible={filtreOuvert}
          onClose={fermerFiltre}
          parcelles={parcelles}
          parcellesLoading={parcellesQuery.isLoading}
          cultures={culturesFiltre}
          culturesLoading={culturesFiltreQuery.isLoading}
          parcelleTemporaire={parcelleTemporaire}
          cultureTemporaire={cultureTemporaire}
          selectionParcelleOuverte={selectionParcelleOuverte}
          selectionCultureOuverte={selectionCultureOuverte}
          onToggleParcelle={() => {
            setSelectionParcelleOuverte(value => !value);
            setSelectionCultureOuverte(false);
          }}
          onToggleCulture={() => {
            setSelectionCultureOuverte(value => !value);
            setSelectionParcelleOuverte(false);
          }}
          onSelectParcelle={id => {
            setParcelleTemporaire(id);
            setCultureTemporaire('');
            setSelectionParcelleOuverte(false);
          }}
          onSelectCulture={id => {
            setCultureTemporaire(id);
            setSelectionCultureOuverte(false);
          }}
          onApply={appliquerFiltre}
          onReset={reinitialiserFiltre}
          onViewFollow={voirSuivi}
          modeAjout={modeAjoutGlobal}
          onContinueAjout={continuerAjoutGlobal}
        />

        <AppBottomBar />
      </View>
    );
  }

  // ====================================================
  // MODE CULTURE
  // ====================================================

  const contexteValide =
    contexteFormulaire &&
    contexteFormulaire.statut !== 'RECOLTEE' &&
    contexteFormulaire.statut !== 'ABANDONNEE' &&
    contexteFormulaire.statut !== 'SUPPRIMEE';

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Interventions"
        subtitle={`${statistiquesCourantes.total} intervention${
          statistiquesCourantes.total > 1 ? 's' : ''
        } • ${statistiquesCourantes.recentes} récentes`}
      />

      <View style={styles.contextBar}>
        <View style={styles.contextIcon}>
          <Sprout
            size={18}
            color={colors.primary[700]}
            strokeWidth={2.2}
          />
        </View>
        <View style={styles.contextContent}>
          <Text style={styles.contextTitle} numberOfLines={1}>
            {cultureNom || 'Culture'}
          </Text>
          <Text style={styles.contextSubtitle} numberOfLines={1}>
            {parcelleNom || 'Parcelle'}
            {' • '}
            {statut ? libelleStatut(statut) : 'Statut inconnu'}
          </Text>
        </View>
      </View>

      <View style={styles.topBar}>
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Search
              size={19}
              color="#9CA3AF"
              strokeWidth={2}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher intervention..."
              placeholderTextColor="#9CA3AF"
              value={recherche}
              onChangeText={setRecherche}
              returnKeyType="search"
            />
            {recherche ? (
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => setRecherche('')}
                style={styles.clearSearchButton}
              >
                <X size={17} color="#6B7280" />
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.filterButtonDisabledVisual}>
            <SlidersHorizontal
              size={19}
              color="#166534"
              strokeWidth={2}
            />
          </View>
        </View>

        <View style={styles.statsBar}>
          <View style={styles.statPill}>
            <Text style={styles.statPillValue}>
              {interventionsFiltrees.length}
            </Text>
            <Text style={styles.statPillLabel}>
              résultat
              {interventionsFiltrees.length > 1 ? 's' : ''}
            </Text>
          </View>
          <Text style={styles.statHint} numberOfLines={1}>
            {recherche
              ? `pour "${recherche}"`
              : 'Triées par date récente'}
          </Text>
        </View>
      </View>

      <View style={styles.listArea}>
        <ScrollView
          style={styles.listScroll}
          contentContainerStyle={[
            styles.listScrollContent,
            styles.listScrollContentDetail,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={actualiser}
              tintColor={colors.primary[600]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <View
            pointerEvents="none"
            style={[styles.fieldShape, styles.fieldShapeOne]}
          />
          <View
            pointerEvents="none"
            style={[styles.fieldShape, styles.fieldShapeTwo]}
          />
          <View
            pointerEvents="none"
            style={[styles.fieldShape, styles.fieldShapeThree]}
          />
          <View
            pointerEvents="none"
            style={[styles.fieldLine, styles.fieldLineOne]}
          />
          <View
            pointerEvents="none"
            style={[styles.fieldLine, styles.fieldLineTwo]}
          />

          {lectureSeule ? (
            <View style={styles.readOnlyBanner}>
              <Text style={styles.readOnlyBannerTitle}>
                Consultation uniquement
              </Text>
              <Text style={styles.readOnlyBannerText}>
                Cette culture est {statut === 'RECOLTEE' ? 'récoltée' : 'abandonnée'}.
                Les interventions restent consultables.
              </Text>
            </View>
          ) : null}

          {renderFormulaireInline(
            cultureNom || 'Culture',
            parcelleNom || 'Parcelle',
          )}

          {interventionsQuery.isLoading ? (
            <View style={styles.loadingInline}>
              <ActivityIndicator color={colors.primary[600]} />
              <Text style={styles.loadingInlineText}>
                Chargement des interventions...
              </Text>
            </View>
          ) : interventionsQuery.isError ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>⚠️</Text>
              <Text style={styles.emptyTitle}>
                Impossible de charger les interventions
              </Text>
              <Text style={styles.emptyText}>
                Vérifiez votre connexion puis actualisez l’écran.
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={actualiser}
                activeOpacity={0.85}
              >
                <Text style={styles.retryText}>Réessayer</Text>
              </TouchableOpacity>
            </View>
          ) : interventionsFiltrees.length === 0 ? (
            <View style={styles.emptyInline}>
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🛠️</Text>
                <Text style={styles.emptyTitle}>
                  Aucune intervention
                </Text>
                <Text style={styles.emptyText}>
                  {recherche
                    ? 'Aucune intervention ne correspond à votre recherche.'
                    : "Aucune intervention n'a encore été enregistrée pour cette culture."}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.cardsList}>
              {interventionsFiltrees.map(intervention => (
                <InterventionCard
                  key={intervention.id}
                  intervention={intervention}
                  parcelleId={parcelleId}
                  cultureId={cultureId}
                  parcelleNom={parcelleNom}
                  cultureNom={cultureNom}
                  statutCulture={statut}
                  modificationAutorisee={modificationAutorisee}
                  onModifier={ouvrirModification}
                  onSupprimer={supprimerIntervention}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </View>

      {modificationAutorisee ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ajouter une intervention"
          onPress={ouvrirAjout}
          style={({ pressed }) => [
            styles.fab,
            pressed && {
              opacity: 0.9,
              transform: [{ scale: 0.94 }],
            },
          ]}
        >
          <Plus
            size={27}
            color="#FFFFFF"
            strokeWidth={2.7}
          />
        </Pressable>
      ) : null}

      <AppBottomBar />
    </View>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background.app,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: colors.background.app,
  },

  // ----------------------------------------------------
  // TOP / SEARCH
  // ----------------------------------------------------

  topBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    zIndex: 20,
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  searchContainer: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  searchInput: {
    flex: 1,
    minHeight: 42,
    marginLeft: 8,
    paddingVertical: 0,
    color: colors.neutral[800],
    fontSize: 13.5,
  },

  clearSearchButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  filterButtonActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },

  filterButtonDisabledVisual: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDEBDD',
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterIndicator: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.primary[600],
  },

  statsBar: {
    marginTop: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },

  statPill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },

  statPillValue: {
    color: '#166534',
    fontWeight: '900',
    fontSize: 13,
  },

  statPillLabel: {
    color: '#166534',
    fontWeight: '700',
    fontSize: 11.5,
  },

  statHint: {
    flex: 1,
    textAlign: 'right',
    color: colors.neutral[500],
    fontSize: 11.5,
    fontWeight: '600',
  },

  contextBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  contextIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  contextContent: {
    flex: 1,
  },

  contextTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1F2937',
  },

  contextSubtitle: {
    marginTop: 2,
    fontSize: 11.5,
    color: colors.neutral[500],
    fontWeight: '600',
  },

  // ----------------------------------------------------
  // AGRICULTURAL LIST
  // ----------------------------------------------------

  listArea: {
    flex: 1,
    backgroundColor: '#DCEBD7',
    position: 'relative',
  },

  listScroll: {
    flex: 1,
  },

  listScrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 120,
    position: 'relative',
    minHeight: '100%',
  },

  listScrollContentDetail: {
    paddingBottom: 150,
  },

  cardsList: {
    gap: 12,
    zIndex: 5,
  },

  fieldShape: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.24)',
    borderRadius: 90,
    zIndex: 0,
  },

  fieldShapeOne: {
    width: 250,
    height: 140,
    top: 40,
    right: -80,
    transform: [{ rotate: '13deg' }],
  },

  fieldShapeTwo: {
    width: 300,
    height: 160,
    top: 270,
    left: -120,
    transform: [{ rotate: '-12deg' }],
  },

  fieldShapeThree: {
    width: 220,
    height: 120,
    bottom: 120,
    right: -50,
    transform: [{ rotate: '-10deg' }],
  },

  fieldLine: {
    position: 'absolute',
    height: 2,
    width: 280,
    borderRadius: 999,
    backgroundColor: 'rgba(76, 122, 75, 0.10)',
    zIndex: 0,
  },

  fieldLineOne: {
    top: 185,
    left: -40,
    transform: [{ rotate: '10deg' }],
  },

  fieldLineTwo: {
    top: 405,
    right: -50,
    transform: [{ rotate: '-8deg' }],
  },

  activeFilterCard: {
    zIndex: 6,
    marginBottom: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    backgroundColor: 'rgba(240,253,244,0.96)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  activeFilterIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeFilterContent: {
    flex: 1,
  },

  activeFilterTitle: {
    color: '#166534',
    fontSize: 11.5,
    fontWeight: '900',
  },

  activeFilterText: {
    marginTop: 1,
    color: '#365314',
    fontSize: 11,
    fontWeight: '600',
  },

  activeFilterClear: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ----------------------------------------------------
  // CARTE
  // ----------------------------------------------------

  interventionCard: {
    borderRadius: radius.lg,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5EDE3',
    shadowColor: '#244D2A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },

  interventionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },

  interventionHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    minWidth: 0,
  },

  interventionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  interventionHeaderContent: {
    flex: 1,
    minWidth: 0,
  },

  interventionType: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1F2937',
  },

  interventionSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    minWidth: 0,
  },

  interventionSubtitle: {
    maxWidth: 100,
    fontSize: 10.5,
    color: colors.neutral[500],
    fontWeight: '700',
  },

  statusContainer: {
    alignItems: 'flex-end',
    maxWidth: 90,
  },

  cardSeparator: {
    height: 1,
    backgroundColor: '#EEF2EC',
    marginTop: 12,
    marginBottom: 12,
  },

  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  infoCard: {
    minHeight: 58,
    flexGrow: 1,
    flexBasis: '47%',
    borderRadius: 12,
    backgroundColor: '#F8FAF8',
    borderWidth: 1,
    borderColor: '#EBF1E8',
    padding: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  infoCardIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoCardContent: {
    flex: 1,
    minWidth: 0,
  },

  infoCardLabel: {
    fontSize: 9.5,
    letterSpacing: 0.4,
    color: colors.neutral[400],
    fontWeight: '900',
  },

  infoCardValue: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    color: '#1F2937',
    fontWeight: '800',
  },

  currencyIcon: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.primary[700],
  },

  descriptionCard: {
    marginTop: 9,
    borderRadius: 12,
    backgroundColor: '#FCFEFC',
    borderWidth: 1,
    borderColor: '#EBF1E8',
    padding: 11,
  },

  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  interventionDescription: {
    marginTop: 7,
    fontSize: 12.5,
    lineHeight: 19,
    color: '#374151',
    fontWeight: '500',
  },

  photoSection: {
    marginTop: 11,
  },

  photoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  photoTitle: {
    color: colors.neutral[500],
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  photoCount: {
    minWidth: 22,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    textAlign: 'center',
    backgroundColor: '#F0FDF4',
    color: '#166534',
    fontSize: 10,
    fontWeight: '900',
  },

  photoLoading: {
    marginTop: 8,
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  photoLoadingText: {
    fontSize: 11,
    color: colors.neutral[500],
  },

  noPhotoText: {
    marginTop: 7,
    color: colors.neutral[400],
    fontSize: 11,
    fontWeight: '600',
  },

  photoList: {
    gap: 8,
    paddingTop: 8,
  },

  photoContainer: {
    width: 108,
    height: 108,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },

  photo: {
    width: '100%',
    height: '100%',
  },

  deletePhotoButton: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(220,38,38,0.90)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  photoAddTile: {
    width: 108,
    height: 108,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  photoAddIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardFooter: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEF2EC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },

  modifiedInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  modifiedText: {
    flex: 1,
    color: colors.neutral[400],
    fontSize: 10.5,
    fontWeight: '600',
  },

  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },

  detailsButtonText: {
    color: colors.primary[700],
    fontSize: 11.5,
    fontWeight: '900',
  },

  actionButtons: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 10,
  },

  editButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  editButtonText: {
    color: '#166534',
    fontSize: 13,
    fontWeight: '800',
  },

  deleteButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  deleteButtonText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '800',
  },

  readOnlyFooter: {
    marginTop: 10,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: '#EEF2EC',
  },

  readOnlyFooterText: {
    color: colors.neutral[400],
    fontSize: 10.5,
    fontWeight: '700',
  },

  // ----------------------------------------------------
  // FORMULAIRE
  // ----------------------------------------------------

  formCard: {
    zIndex: 8,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CDE7CF',
    padding: 14,
    marginBottom: 12,
    shadowColor: '#1E5128',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },

  formHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },

  formHeaderCopy: {
    flex: 1,
    minWidth: 0,
  },

  formTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1F2937',
  },

  formSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: colors.neutral[500],
    fontWeight: '600',
  },

  formCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  label: {
    marginTop: 10,
    marginBottom: 6,
    fontSize: 11,
    color: '#374151',
    fontWeight: '800',
  },

  input: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDE6DB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    color: '#1F2937',
    fontSize: 13,
  },

  textarea: {
    minHeight: 108,
    paddingTop: 11,
    paddingBottom: 11,
  },

  dateHelp: {
    marginTop: 4,
    fontSize: 10.5,
    color: colors.neutral[400],
    fontWeight: '600',
  },

  formTwoColumns: {
    flexDirection: 'row',
    gap: 8,
  },

  formColumn: {
    flex: 1,
  },

  formButtons: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 14,
  },

  cancelButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '800',
  },

  saveButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: '#166534',
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  readOnlyBanner: {
    zIndex: 6,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: 12,
  },

  readOnlyBannerTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#374151',
  },

  readOnlyBannerText: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: colors.neutral[500],
    fontWeight: '600',
  },

  // ----------------------------------------------------
  // FILTRE MODAL
  // ----------------------------------------------------

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15,23,42,0.30)',
  },

  filterSheet: {
    maxHeight: '82%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
  },

  sheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#D1D5DB',
    marginBottom: 10,
  },

  sheetHeader: {
    paddingHorizontal: 16,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },

  sheetTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1F2937',
  },

  sheetSubtitle: {
    marginTop: 2,
    fontSize: 11.5,
    color: colors.neutral[500],
    fontWeight: '600',
  },

  sheetCloseButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sheetContent: {
    paddingHorizontal: 16,
    paddingTop: 7,
    paddingBottom: 28,
  },

  filterLabel: {
    marginTop: 10,
    marginBottom: 7,
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.neutral[500],
    fontWeight: '900',
  },

  filterLabelCulture: {
    marginTop: 15,
  },

  filterSelectModal: {
    minHeight: 52,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#DDE6DB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  filterSelectOpen: {
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
  },

  filterSelectDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },

  filterSelectLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    minWidth: 0,
  },

  filterSelectIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterSelectIconDisabled: {
    backgroundColor: '#F3F4F6',
  },

  filterSelectText: {
    flex: 1,
    color: '#1F2937',
    fontSize: 13,
    fontWeight: '800',
  },

  filterSelectPlaceholder: {
    color: colors.neutral[400],
    fontWeight: '600',
  },

  chevronRotated: {
    transform: [{ rotate: '180deg' }],
  },

  filterDropdown: {
    marginTop: 6,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FCFEFC',
    overflow: 'hidden',
  },

  filterDropdownScroll: {
    maxHeight: 220,
  },

  dropdownLoading: {
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
  },

  dropdownLoadingText: {
    color: colors.neutral[500],
    fontSize: 11,
    fontWeight: '600',
  },

  dropdownEmpty: {
    paddingHorizontal: 13,
    paddingVertical: 15,
    color: colors.neutral[500],
    fontSize: 11.5,
    fontWeight: '600',
  },

  filterDropdownItem: {
    minHeight: 48,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEF2EC',
    gap: 10,
  },

  filterDropdownItemSelected: {
    backgroundColor: '#F0FDF4',
  },

  dropdownItemLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  filterDropdownItemText: {
    flex: 1,
    color: '#374151',
    fontSize: 12,
    fontWeight: '700',
  },

  filterDropdownItemTextSelected: {
    color: '#166534',
    fontWeight: '900',
  },

  filterCultureItem: {
    minHeight: 57,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEF2EC',
    gap: 10,
  },

  filterCultureItemSelected: {
    backgroundColor: '#F0FDF4',
  },

  filterCultureItemDisabled: {
    opacity: 0.55,
  },

  filterCultureInfo: {
    flex: 1,
    minWidth: 0,
  },

  filterCultureNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  filterCultureName: {
    flex: 1,
    color: '#374151',
    fontSize: 12.5,
    fontWeight: '800',
  },

  disabledCultureText: {
    color: '#9CA3AF',
  },

  filterCultureStatus: {
    marginTop: 2,
    color: colors.neutral[400],
    fontSize: 10.5,
    fontWeight: '600',
  },

  selectedCheckCircle: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: '#166534',
    alignItems: 'center',
    justifyContent: 'center',
  },

  followButton: {
    marginTop: 17,
    minHeight: 62,
    borderRadius: 14,
    backgroundColor: '#166534',
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  followButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },

  followButtonIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  followButtonContent: {
    flex: 1,
    minWidth: 0,
  },

  followButtonTitle: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '900',
  },

  followButtonSubtitle: {
    marginTop: 2,
    color: 'rgba(255,255,255,0.78)',
    fontSize: 10.5,
    fontWeight: '600',
  },

  filterPanelActions: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 17,
  },

  resetSmallButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  resetSmallButtonText: {
    color: '#374151',
    fontSize: 12.5,
    fontWeight: '800',
  },

  applySmallButton: {
    flex: 1.2,
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: '#166534',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  applySmallButtonText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '900',
  },

  // ----------------------------------------------------
  // EMPTY / STATES
  // ----------------------------------------------------

  loadingInline: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    zIndex: 6,
  },

  loadingInlineText: {
    color: colors.neutral[500],
    fontSize: 12.5,
    fontWeight: '600',
  },

  emptyInline: {
    zIndex: 6,
    paddingVertical: 26,
  },

  emptyCard: {
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: '#E4ECE2',
    paddingHorizontal: 18,
    paddingVertical: 24,
    alignItems: 'center',
  },

  emptyIcon: {
    fontSize: 38,
    marginBottom: 8,
  },

  emptyTitle: {
    textAlign: 'center',
    color: '#1F2937',
    fontSize: 15,
    fontWeight: '900',
  },

  emptyText: {
    maxWidth: 330,
    marginTop: 6,
    textAlign: 'center',
    color: colors.neutral[500],
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },

  retryButton: {
    marginTop: 14,
    minHeight: 42,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#166534',
    alignItems: 'center',
    justifyContent: 'center',
  },

  retryText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '900',
  },

  // ----------------------------------------------------
  // BLOCKED
  // ----------------------------------------------------

  blockedIcon: {
    fontSize: 50,
    marginBottom: 12,
  },

  blockedTitle: {
    color: '#1F2937',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },

  blockedText: {
    maxWidth: 330,
    color: colors.neutral[500],
    fontSize: 13.5,
    lineHeight: 21,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 18,
  },

  backButton: {
    minHeight: 46,
    paddingHorizontal: 25,
    borderRadius: 13,
    backgroundColor: '#166534',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  // ----------------------------------------------------
  // FAB
  // ----------------------------------------------------

  fab: {
    position: 'absolute',
    right: 18,
    bottom: 92,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#14532D',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.20,
    shadowRadius: 10,
    elevation: 7,
    zIndex: 30,
  },
});
