import { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';

import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  FileText,
  Image as ImageIcon,
  MapPin,
  Scale,
  Sprout,
  Wheat,
  X,
} from 'lucide-react-native';

import {
  useCreateRecolte,
} from '@/hooks/useRecoltes';

import {
  useUploadPhotoRecolte,
} from '@/hooks/usePhotosRecoltes';

// =====================================================
// UNITÉS ADAPTÉES À LA RÉCOLTE
// =====================================================

const UNITE_RECOLTE_OPTIONS = [
  {
    value: 'kg',
    label: 'kg',
    description: 'kilogramme',
  },
  {
    value: 'g',
    label: 'g',
    description: 'gramme',
  },
  {
    value: 't',
    label: 't',
    description: 'tonne',
  },
  {
    value: 'sac',
    label: 'sac',
    description: 'quantité exprimée en sacs',
  },
  {
    value: 'caisse',
    label: 'caisse',
    description: 'quantité exprimée en caisses',
  },
  {
    value: 'panier',
    label: 'panier',
    description: 'quantité exprimée en paniers',
  },
  {
    value: 'seau',
    label: 'seau',
    description: 'quantité exprimée en seaux',
  },
  {
    value: 'botte',
    label: 'botte',
    description: 'quantité exprimée en bottes',
  },
  {
    value: 'unité',
    label: 'unité',
    description: 'pièces ou éléments comptés',
  },
] as const;

// =====================================================
// ÉCRAN
// =====================================================

export default function AjoutRecolteScreen() {
  const router = useRouter();

  const {
    cultureId,
  } = useLocalSearchParams<{
    cultureId: string;
  }>();

  // ===================================================
  // MUTATIONS
  // ===================================================

  const createRecolteMutation =
    useCreateRecolte();

  const uploadPhotoMutation =
    useUploadPhotoRecolte();

  // ===================================================
  // ÉTATS DU FORMULAIRE
  // ===================================================

  const [dateRecolte, setDateRecolte] =
    useState(
      new Date()
        .toISOString()
        .split('T')[0],
    );

  const [quantite, setQuantite] =
    useState('');

  const [unite, setUnite] =
    useState('kg');

  const [description, setDescription] =
    useState('');

  const [prixVente, setPrixVente] =
    useState('');

  const [coutRecolte, setCoutRecolte] =
    useState('');

  const [photosUri, setPhotosUri] =
    useState<string[]>([]);

  // ===================================================
  // ÉTAT LISTE UNITÉS
  // ===================================================

  const [unitModalVisible, setUnitModalVisible] =
    useState(false);

  // ===================================================
  // PRENDRE UNE PHOTO
  // ===================================================

  async function prendrePhoto() {
    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission refusée',
          'L’accès à la caméra est nécessaire pour prendre une photo.',
        );

        return;
      }

      const result =
        await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          quality: 0.8,
        });

      if (result.canceled) {
        return;
      }

      const uri =
        result.assets[0]?.uri;

      if (!uri) {
        return;
      }

      setPhotosUri((photos) => [
        ...photos,
        uri,
      ]);
    } catch (error: any) {
      console.error(
        'Erreur caméra :',
        error,
      );

      Alert.alert(
        'Erreur',
        'Impossible de prendre la photo.',
      );
    }
  }

  // ===================================================
  // CHOISIR PLUSIEURS PHOTOS
  // ===================================================

  async function choisirPhotos() {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission refusée',
          'L’accès à la galerie est nécessaire pour choisir une photo.',
        );

        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsMultipleSelection: true,
          allowsEditing: false,
          quality: 0.8,
        });

      if (result.canceled) {
        return;
      }

      const nouvellesPhotos =
        result.assets
          .map(
            (asset) =>
              asset.uri,
          )
          .filter(Boolean);

      if (
        nouvellesPhotos.length === 0
      ) {
        return;
      }

      setPhotosUri((photos) => [
        ...photos,
        ...nouvellesPhotos,
      ]);
    } catch (error: any) {
      console.error(
        'Erreur galerie :',
        error,
      );

      Alert.alert(
        'Erreur',
        'Impossible de sélectionner les photos.',
      );
    }
  }

  // ===================================================
  // AJOUTER UNE PHOTO
  // ===================================================

  function ajouterPhoto() {
    Alert.alert(
      'Ajouter une photo',
      'Choisissez une méthode',
      [
        {
          text: 'Prendre une photo',
          onPress: prendrePhoto,
        },
        {
          text: 'Choisir dans la galerie',
          onPress: choisirPhotos,
        },
        {
          text: 'Annuler',
          style: 'cancel',
        },
      ],
    );
  }

  // ===================================================
  // SUPPRIMER UNE PHOTO
  // ===================================================

  function supprimerPhoto(
    index: number,
  ) {
    setPhotosUri((photos) =>
      photos.filter(
        (
          _,
          photoIndex,
        ) =>
          photoIndex !== index,
      ),
    );
  }

  // ===================================================
  // CHOISIR UNE UNITÉ
  // ===================================================

  function selectionnerUnite(
    value: string,
  ) {
    setUnite(value);
    setUnitModalVisible(false);
  }

  // ===================================================
  // ENREGISTRER LA RÉCOLTE
  // ===================================================

  function enregistrerRecolte() {
    // -------------------------------------------------
    // Vérification culture
    // -------------------------------------------------

    if (!cultureId) {
      Alert.alert(
        'Erreur',
        'Identifiant de culture introuvable',
      );

      return;
    }

    // -------------------------------------------------
    // Vérification date
    // -------------------------------------------------

    if (!dateRecolte.trim()) {
      Alert.alert(
        'Erreur',
        'Veuillez saisir la date de récolte',
      );

      return;
    }

    // -------------------------------------------------
    // Vérification quantité
    // -------------------------------------------------

    const quantiteNumerique =
      Number(
        quantite.replace(
          ',',
          '.',
        ),
      );

    if (
      !quantite.trim() ||
      Number.isNaN(
        quantiteNumerique,
      ) ||
      quantiteNumerique <= 0
    ) {
      Alert.alert(
        'Erreur',
        'Veuillez saisir une quantité supérieure à zéro',
      );

      return;
    }

    // -------------------------------------------------
    // Vérification unité
    // -------------------------------------------------

    if (!unite.trim()) {
      Alert.alert(
        'Erreur',
        'Veuillez saisir une unité',
      );

      return;
    }

    // -------------------------------------------------
    // Prix de vente
    // -------------------------------------------------

    const prixVenteNumerique =
      prixVente.trim()
        ? Number(
            prixVente.replace(
              ',',
              '.',
            ),
          )
        : undefined;

    if (
      prixVenteNumerique !==
        undefined &&
      (
        Number.isNaN(
          prixVenteNumerique,
        ) ||
        prixVenteNumerique < 0
      )
    ) {
      Alert.alert(
        'Erreur',
        'Le prix de vente est invalide',
      );

      return;
    }

    // -------------------------------------------------
    // Coût de récolte
    // -------------------------------------------------

    const coutRecolteNumerique =
      coutRecolte.trim()
        ? Number(
            coutRecolte.replace(
              ',',
              '.',
            ),
          )
        : undefined;

    if (
      coutRecolteNumerique !==
        undefined &&
      (
        Number.isNaN(
          coutRecolteNumerique,
        ) ||
        coutRecolteNumerique < 0
      )
    ) {
      Alert.alert(
        'Erreur',
        'Le coût de récolte est invalide',
      );

      return;
    }

    // -------------------------------------------------
    // Envoi au backend
    // -------------------------------------------------

    createRecolteMutation.mutate(
      {
        cultureId,

        data: {
          dateRecolte,

          quantite:
            quantiteNumerique,

          unite:
            unite.trim(),

          description:
            description.trim() ||
            undefined,

          prixVente:
            prixVenteNumerique,

          coutRecolte:
            coutRecolteNumerique,
        },
      },

      {
        // ---------------------------------------------
        // SUCCÈS
        // ---------------------------------------------

        onSuccess: async (
          recolte,
        ) => {
          try {
            // -------------------------------------------
            // UPLOAD DE TOUTES LES PHOTOS
            // -------------------------------------------

            if (
              photosUri.length > 0
            ) {
              for (
                const uri of photosUri
              ) {
                await uploadPhotoMutation.mutateAsync(
                  {
                    recolteId:
                      recolte.id,

                    uri,
                  },
                );
              }
            }

            // -------------------------------------------
            // MESSAGE DE SUCCÈS
            // -------------------------------------------

            let message =
              'La récolte a été enregistrée avec succès.';

            if (
              photosUri.length === 1
            ) {
              message =
                'La récolte et la photo ont été enregistrées avec succès.';
            } else if (
              photosUri.length > 1
            ) {
              message =
                `La récolte et ${photosUri.length} photos ont été enregistrées avec succès.`;
            }

            Alert.alert(
              'Récolte enregistrée',
              message,
              [
                {
                  text: 'OK',
                  onPress: () =>
                    router.back(),
                },
              ],
            );
          } catch (
            error: any
          ) {
            console.error(
              '========== ERREUR UPLOAD PHOTO ==========',
            );

            console.error(
              'Erreur complète :',
              error,
            );

            console.error(
              'Response :',
              error?.response,
            );

            console.error(
              'Status :',
              error?.response?.status,
            );

            console.error(
              'Data :',
              error?.response?.data,
            );

            console.error(
              'Message :',
              error?.message,
            );

            console.error(
              '=========================================',
            );

            Alert.alert(
              'Erreur upload photo',
              error?.response?.data
                ?.message ||
                error?.message ||
                'Impossible d’envoyer la photo.',
            );
          }
        },

        // ---------------------------------------------
        // ERREUR
        // ---------------------------------------------

        onError: (
          error: any,
        ) => {
          const message =
            error?.response?.data
              ?.message ||
            'Impossible d’enregistrer la récolte';

          Alert.alert(
            'Erreur',
            message,
          );
        },
      },
    );
  }

  // ===================================================
  // ÉTATS DE CHARGEMENT
  // ===================================================

  const isSubmitting =
    createRecolteMutation.isPending;

  const isUploading =
    uploadPhotoMutation.isPending;

  const isBusy =
    isSubmitting ||
    isUploading;

  // ===================================================
  // AFFICHAGE
  // ===================================================

  return (
    <KeyboardAvoidingView
      style={
        styles.container
      }
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* =============================================
            HEADER
        ============================================== */}

        <View
          style={
            styles.header
          }
        >
          <TouchableOpacity
            style={
              styles.backButton
            }
            onPress={() =>
              router.back()
            }
            disabled={
              isBusy
            }
            activeOpacity={0.8}
          >
            <ArrowLeft
              size={21}
              color="#172018"
              strokeWidth={2.2}
            />
          </TouchableOpacity>

          <View
            style={
              styles.headerTextBlock
            }
          >
            <Text
              style={
                styles.eyebrow
              }
            >
              SUIVI DE PRODUCTION
            </Text>

            <Text
              style={
                styles.title
              }
            >
              Nouvelle récolte
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Enregistrez les résultats de la récolte
              de cette culture.
            </Text>
          </View>
        </View>

        {/* =============================================
            CONTEXTE CULTURE
        ============================================== */}

        <View
          style={
            styles.contextCard
          }
        >
          <View
            style={
              styles.contextAccent
            }
          />

          <View
            style={
              styles.contextMain
            }
          >
            <View
              style={
                styles.contextIconLarge
              }
            >
              <Wheat
                size={24}
                color="#166534"
                strokeWidth={2.2}
              />
            </View>

            <View
              style={
                styles.contextIdentity
              }
            >
              <Text
                style={
                  styles.contextOverline
                }
              >
                CULTURE À RÉCOLTER
              </Text>

              <Text
                style={
                  styles.contextCulture
                }
                numberOfLines={1}
              >
                Culture
              </Text>

              <View
                style={
                  styles.cultureIdLine
                }
              >
                <Sprout
                  size={14}
                  color="#6B7280"
                  strokeWidth={2}
                />

                <Text
                  style={
                    styles.cultureIdText
                  }
                  numberOfLines={1}
                >
                  {cultureId ||
                    'Culture non renseignée'}
                </Text>
              </View>
            </View>

            <View
              style={
                styles.recolteBadge
              }
            >
              <Wheat
                size={12}
                color="#166534"
                strokeWidth={2.2}
              />

              <Text
                style={
                  styles.recolteBadgeText
                }
              >
                RÉCOLTE
              </Text>
            </View>
          </View>
        </View>

        {/* =============================================
            SECTION RÉCOLTE
        ============================================== */}

        <View
          style={
            styles.sectionHeader
          }
        >
          <View
            style={
              styles.sectionIcon
            }
          >
            <Wheat
              size={17}
              color="#166534"
              strokeWidth={2.2}
            />
          </View>

          <View
            style={
              styles.sectionHeaderText
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Récolte
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Renseignez la quantité réellement récoltée.
            </Text>
          </View>
        </View>

        {/* =============================================
            DATE
        ============================================== */}

        <View
          style={
            styles.dateCard
          }
        >
          <View
            style={
              styles.dateIcon
            }
          >
            <CalendarDays
              size={19}
              color="#166534"
              strokeWidth={2.1}
            />
          </View>

          <View
            style={
              styles.dateContent
            }
          >
            <View
              style={
                styles.fieldTopLine
              }
            >
              <Text
                style={
                  styles.dateLabel
                }
              >
                DATE DE RÉCOLTE
              </Text>

              <Text
                style={
                  styles.requiredText
                }
              >
                Obligatoire
              </Text>
            </View>

            <TextInput
              style={
                styles.dateInput
              }
              placeholder="AAAA-MM-JJ"
              placeholderTextColor="#9CA3AF"
              value={
                dateRecolte
              }
              onChangeText={
                setDateRecolte
              }
              editable={
                !isBusy
              }
              keyboardType="numbers-and-punctuation"
            />
          </View>
        </View>

        <Text
          style={
            styles.dateHelp
          }
        >
          Format attendu : AAAA-MM-JJ
        </Text>

        {/* =============================================
            QUANTITÉ + UNITÉ
        ============================================== */}

        <View
          style={
            styles.quantityUnitRow
          }
        >
          {/* -------------------------------------------
              QUANTITÉ
          -------------------------------------------- */}

          <View
            style={
              styles.quantityCard
            }
          >
            <View
              style={
                styles.fieldTopRowCompact
              }
            >
              <View
                style={
                  styles.fieldTitleWrap
                }
              >
                <Scale
                  size={16}
                  color="#166534"
                  strokeWidth={2.1}
                />

                <Text
                  style={
                    styles.fieldLabel
                  }
                >
                  QUANTITÉ
                </Text>
              </View>

              <Text
                style={
                  styles.requiredText
                }
              >
                Obligatoire
              </Text>
            </View>

            <TextInput
              style={
                styles.input
              }
              placeholder="Ex : 250"
              placeholderTextColor="#9CA3AF"
              value={
                quantite
              }
              onChangeText={
                setQuantite
              }
              editable={
                !isBusy
              }
              keyboardType="decimal-pad"
            />
          </View>

          {/* -------------------------------------------
              UNITÉ
          -------------------------------------------- */}

          <View
            style={
              styles.unitCard
            }
          >
            <View
              style={
                styles.fieldTopRowCompact
              }
            >
              <View
                style={
                  styles.fieldTitleWrap
                }
              >
                <Scale
                  size={16}
                  color="#166534"
                  strokeWidth={2.1}
                />

                <Text
                  style={
                    styles.fieldLabel
                  }
                >
                  UNITÉ
                </Text>
              </View>

              <Text
                style={
                  styles.requiredText
                }
              >
                Obligatoire
              </Text>
            </View>

            <TouchableOpacity
              style={
                styles.dropdownButton
              }
              onPress={() =>
                setUnitModalVisible(
                  true,
                )
              }
              disabled={
                isBusy
              }
              activeOpacity={0.8}
            >
              <Text
                style={
                  styles.dropdownText
                }
                numberOfLines={1}
              >
                {unite}
              </Text>

              <ChevronDown
                size={18}
                color="#6B7280"
                strokeWidth={2.2}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* =============================================
            CONSEIL
        ============================================== */}

        <View
          style={
            styles.tipCard
          }
        >
          <View
            style={
              styles.tipIcon
            }
          >
            <Sprout
              size={16}
              color="#166534"
              strokeWidth={2}
            />
          </View>

          <View
            style={
              styles.tipContent
            }
          >
            <Text
              style={
                styles.tipTitle
              }
            >
              Conseil terrain
            </Text>

            <Text
              style={
                styles.tipText
              }
            >
              Utilisez l’unité la plus adaptée à la
              manière dont la récolte est réellement mesurée.
            </Text>
          </View>
        </View>

        {/* =============================================
            VENTE
        ============================================== */}

        <View
          style={
            styles.sectionHeader
          }
        >
          <View
            style={
              styles.sectionIcon
            }
          >
            <Banknote
              size={17}
              color="#166534"
              strokeWidth={2.2}
            />
          </View>

          <View
            style={
              styles.sectionHeaderText
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Valeur de la récolte
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Ajoutez les informations économiques si disponibles.
            </Text>
          </View>
        </View>

        {/* =============================================
            PRIX DE VENTE
        ============================================== */}

        <View
          style={
            styles.fieldCard
          }
        >
          <View
            style={
              styles.fieldTopRow
            }
          >
            <View
              style={
                styles.fieldTitleWrap
              }
            >
              <Banknote
                size={16}
                color="#166534"
                strokeWidth={2.1}
              />

              <Text
                style={
                  styles.fieldLabel
                }
              >
                PRIX DE VENTE
              </Text>
            </View>

            <Text
              style={
                styles.optionalText
              }
            >
              Facultatif
            </Text>
          </View>

          <TextInput
            style={
              styles.input
            }
            placeholder="Ex : 150000"
            placeholderTextColor="#9CA3AF"
            value={
              prixVente
            }
            onChangeText={
              setPrixVente
            }
            editable={
              !isBusy
            }
            keyboardType="decimal-pad"
          />

          <Text
            style={
              styles.fieldHint
            }
          >
            Montant en Ariary (Ar)
          </Text>
        </View>

        {/* =============================================
            COÛT DE RÉCOLTE
        ============================================== */}

        <View
          style={
            styles.fieldCard
          }
        >
          <View
            style={
              styles.fieldTopRow
            }
          >
            <View
              style={
                styles.fieldTitleWrap
              }
            >
              <Banknote
                size={16}
                color="#166534"
                strokeWidth={2.1}
              />

              <Text
                style={
                  styles.fieldLabel
                }
              >
                COÛT DE RÉCOLTE
              </Text>
            </View>

            <Text
              style={
                styles.optionalText
              }
            >
              Facultatif
            </Text>
          </View>

          <TextInput
            style={
              styles.input
            }
            placeholder="Ex : 50000"
            placeholderTextColor="#9CA3AF"
            value={
              coutRecolte
            }
            onChangeText={
              setCoutRecolte
            }
            editable={
              !isBusy
            }
            keyboardType="decimal-pad"
          />

          <Text
            style={
              styles.fieldHint
            }
          >
            Montant en Ariary (Ar)
          </Text>
        </View>

        {/* =============================================
            DESCRIPTION
        ============================================== */}

        <View
          style={
            styles.sectionHeader
          }
        >
          <View
            style={
              styles.sectionIcon
            }
          >
            <FileText
              size={17}
              color="#166534"
              strokeWidth={2.2}
            />
          </View>

          <View
            style={
              styles.sectionHeaderText
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Remarque
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Ajoutez une information utile sur la récolte.
            </Text>
          </View>
        </View>

        <View
          style={
            styles.descriptionCard
          }
        >
          <View
            style={
              styles.fieldTopRow
            }
          >
            <View
              style={
                styles.fieldTitleWrap
            }
            >
              <FileText
                size={16}
                color="#166534"
                strokeWidth={2.1}
              />

              <Text
                style={
                  styles.fieldLabel
                }
              >
                DESCRIPTION / REMARQUE
              </Text>
            </View>

            <Text
              style={
                styles.optionalText
              }
            >
              Facultatif
            </Text>
          </View>

          <TextInput
            style={
              styles.descriptionInput
            }
            placeholder="Ex : Récolte effectuée manuellement..."
            placeholderTextColor="#9CA3AF"
            value={
              description
            }
            onChangeText={
              setDescription
            }
            editable={
              !isBusy
            }
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          <View
            style={
              styles.descriptionFooter
            }
          >
            <Text
              style={
                styles.descriptionHint
              }
            >
              Ajoutez les conditions, remarques
              ou particularités constatées pendant la récolte.
            </Text>
          </View>
        </View>

        {/* =============================================
            PHOTOS
        ============================================== */}

        <View
          style={
            styles.sectionHeader
          }
        >
          <View
            style={
              styles.sectionIcon
            }
          >
            <ImageIcon
              size={17}
              color="#166534"
              strokeWidth={2.2}
            />
          </View>

          <View
            style={
              styles.sectionHeaderText
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Photos de la récolte
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Ajoutez une ou plusieurs photos pour documenter la récolte.
            </Text>
          </View>
        </View>

        <View
          style={
            styles.photoCard
          }
        >
          <TouchableOpacity
            style={
              styles.photoButton
            }
            onPress={
              ajouterPhoto
            }
            disabled={
              isBusy
            }
            activeOpacity={0.8}
          >
            <View
              style={
                styles.photoButtonIcon
              }
            >
              <Camera
                size={18}
                color="#166534"
                strokeWidth={2.2}
              />
            </View>

            <View
              style={
                styles.photoButtonTextBlock
              }
            >
              <Text
                style={
                  styles.photoButtonTitle
                }
              >
                Ajouter une photo
              </Text>

              <Text
                style={
                  styles.photoButtonSubtitle
                }
              >
                Caméra ou galerie
              </Text>
            </View>

            <ChevronDown
              size={18}
              color="#6B7280"
              strokeWidth={2}
              style={
                styles.photoChevron
              }
            />
          </TouchableOpacity>

          {photosUri.length > 0 && (
            <Text
              style={
                styles.photoCount
              }
            >
              {photosUri.length}{' '}
              {photosUri.length === 1
                ? 'photo sélectionnée'
                : 'photos sélectionnées'}
            </Text>
          )}

          {photosUri.length > 0 && (
            <View
              style={
                styles.photosGrid
              }
            >
              {photosUri.map(
                (
                  uri,
                  index,
                ) => (
                  <View
                    key={`${uri}-${index}`}
                    style={
                      styles.photoItem
                    }
                  >
                    <Image
                      source={{
                        uri,
                      }}
                      style={
                        styles.photoPreview
                      }
                      resizeMode="cover"
                    />

                    <View
                      style={
                        styles.photoNumber
                      }
                    >
                      <Text
                        style={
                          styles.photoNumberText
                        }
                      >
                        {index + 1}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={
                        styles.removePhotoButton
                      }
                      onPress={() =>
                        supprimerPhoto(
                          index,
                        )
                      }
                      disabled={
                        isBusy
                      }
                      activeOpacity={0.8}
                    >
                      <X
                        size={15}
                        color="#FFFFFF"
                        strokeWidth={2.6}
                      />
                    </TouchableOpacity>
                  </View>
                ),
              )}
            </View>
          )}

          <Text
            style={
              styles.photoHelp
            }
          >
            Vous pouvez prendre plusieurs photos
            ou sélectionner plusieurs images depuis la galerie.
          </Text>
        </View>

        {/* =============================================
            ENREGISTRER
        ============================================== */}

        <TouchableOpacity
          style={[
            styles.saveButton,
            isBusy &&
              styles.saveButtonDisabled,
          ]}
          onPress={
            enregistrerRecolte
          }
          disabled={
            isBusy
          }
          activeOpacity={0.85}
        >
          {isBusy ? (
            <>
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.saveText
                }
              >
                {isUploading
                  ? 'Envoi de la photo...'
                  : 'Enregistrement...'}
              </Text>
            </>
          ) : (
            <>
              <View
                style={
                  styles.saveIcon
                }
              >
                <Check
                  size={18}
                  color="#FFFFFF"
                  strokeWidth={2.8}
                />
              </View>

              <View
                style={
                  styles.saveTextBlock
                }
              >
                <Text
                  style={
                    styles.saveText
                  }
                >
                  Enregistrer la récolte
                </Text>

                <Text
                  style={
                    styles.saveSubtext
                  }
                >
                  Sauvegarder les résultats de récolte
                </Text>
              </View>
            </>
          )}
        </TouchableOpacity>

        {/* =============================================
            ANNULER
        ============================================== */}

        <TouchableOpacity
          style={
            styles.cancelButton
          }
          onPress={() =>
            router.back()
          }
          disabled={
            isBusy
          }
          activeOpacity={0.8}
        >
          <ArrowLeft
            size={17}
            color="#4B5563"
            strokeWidth={2.1}
          />

          <Text
            style={
              styles.cancelButtonText
            }
          >
            Annuler
          </Text>
        </TouchableOpacity>

        <Text
          style={
            styles.bottomHint
          }
        >
          Vous pourrez retrouver cette récolte
          dans le suivi de la culture.
        </Text>
      </ScrollView>

      {/* ===============================================
          MODAL LISTE DES UNITÉS
      ================================================ */}

      <Modal
        visible={
          unitModalVisible
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setUnitModalVisible(
            false,
          )
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <TouchableOpacity
            style={
              StyleSheet.absoluteFill
            }
            activeOpacity={1}
            onPress={() =>
              setUnitModalVisible(
                false,
              )
            }
          />

          <View
            style={
              styles.unitModal
            }
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <View
                style={
                  styles.modalHeaderIcon
                }
              >
                <Wheat
                  size={19}
                  color="#166534"
                  strokeWidth={2.2}
                />
              </View>

              <View
                style={
                  styles.modalHeaderTextBlock
                }
              >
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Choisir une unité
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Sélectionnez l’unité utilisée pour
                  mesurer la récolte.
                </Text>
              </View>

              <TouchableOpacity
                style={
                  styles.modalCloseButton
                }
                onPress={() =>
                  setUnitModalVisible(
                    false,
                  )
                }
                activeOpacity={0.8}
              >
                <X
                  size={18}
                  color="#4B5563"
                  strokeWidth={2.2}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={
                styles.unitList
              }
              contentContainerStyle={
                styles.unitListContent
              }
              showsVerticalScrollIndicator={
                false
              }
            >
              {UNITE_RECOLTE_OPTIONS.map(
                (item) => {
                  const selected =
                    unite ===
                    item.value;

                  return (
                    <TouchableOpacity
                      key={
                        item.value
                      }
                      style={[
                        styles.unitOption,
                        selected &&
                          styles.unitOptionSelected,
                      ]}
                      onPress={() =>
                        selectionnerUnite(
                          item.value,
                        )
                      }
                      activeOpacity={0.8}
                    >
                      <View
                        style={
                          styles.unitOptionTextBlock
                        }
                      >
                        <Text
                          style={[
                            styles.unitOptionText,
                            selected &&
                              styles.unitOptionTextSelected,
                          ]}
                        >
                          {
                            item.label
                          }
                        </Text>

                        <Text
                          style={
                            styles.unitOptionHint
                          }
                        >
                          {
                            item.description
                          }
                        </Text>
                      </View>

                      {selected && (
                        <View
                          style={
                            styles.unitCheck
                          }
                        >
                          <Check
                            size={16}
                            color="#FFFFFF"
                            strokeWidth={2.8}
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                },
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles =
  StyleSheet.create({
    // =================================================
    // CONTENEUR
    // =================================================

    container: {
      flex: 1,
      backgroundColor: '#F4F8F3',
    },

    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 36,
    },

    // =================================================
    // HEADER
    // =================================================

    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 18,
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#DCE7DA',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    headerTextBlock: {
      flex: 1,
      paddingTop: 1,
    },

    eyebrow: {
      fontSize: 10,
      fontWeight: '800',
      color: '#4D7C55',
      letterSpacing: 1,
      marginBottom: 3,
    },

    title: {
      fontSize: 24,
      lineHeight: 29,
      fontWeight: '800',
      color: '#172018',
      letterSpacing: -0.4,
    },

    subtitle: {
      marginTop: 4,
      fontSize: 12,
      lineHeight: 18,
      color: '#6B7280',
    },

    // =================================================
    // CONTEXTE
    // =================================================

    contextCard: {
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#DCE7DA',
      marginBottom: 24,
      shadowColor: '#14532D',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.07,
      shadowRadius: 10,
      elevation: 2,
    },

    contextAccent: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 5,
      backgroundColor: '#22C55E',
    },

    contextMain: {
      minHeight: 106,
      paddingVertical: 15,
      paddingHorizontal: 15,
      paddingLeft: 18,
      flexDirection: 'row',
      alignItems: 'center',
    },

    contextIconLarge: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: '#ECFDF3',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    contextIdentity: {
      flex: 1,
      minWidth: 0,
    },

    contextOverline: {
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 0.9,
      color: '#9CA3AF',
    },

    contextCulture: {
      marginTop: 2,
      fontSize: 17,
      lineHeight: 21,
      fontWeight: '800',
      color: '#172018',
    },

    cultureIdLine: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 5,
    },

    cultureIdText: {
      flex: 1,
      marginLeft: 5,
      fontSize: 11,
      color: '#6B7280',
    },

    recolteBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 8,
      paddingHorizontal: 8,
      paddingVertical: 7,
      borderRadius: 999,
      backgroundColor: '#ECFDF3',
      borderWidth: 1,
      borderColor: '#BBF7D0',
    },

    recolteBadgeText: {
      marginLeft: 4,
      fontSize: 8,
      fontWeight: '800',
      color: '#166534',
    },

    // =================================================
    // SECTIONS
    // =================================================

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      marginTop: 2,
    },

    sectionIcon: {
      width: 34,
      height: 34,
      borderRadius: 11,
      backgroundColor: '#E8F5E4',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 9,
    },

    sectionHeaderText: {
      flex: 1,
    },

    sectionTitle: {
      fontSize: 14,
      lineHeight: 18,
      fontWeight: '800',
      color: '#172018',
    },

    sectionSubtitle: {
      marginTop: 2,
      fontSize: 11,
      lineHeight: 16,
      color: '#6B7280',
    },

    // =================================================
    // DATE
    // =================================================

    dateCard: {
      minHeight: 74,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#DCE7DA',
      paddingHorizontal: 12,
    },

    dateIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: '#ECFDF3',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },

    dateContent: {
      flex: 1,
    },

    fieldTopLine: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    dateLabel: {
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 0.7,
      color: '#9CA3AF',
      marginBottom: 2,
    },

    dateInput: {
      minHeight: 30,
      paddingHorizontal: 0,
      paddingVertical: 0,
      fontSize: 13,
      fontWeight: '700',
      color: '#172018',
    },

    dateHelp: {
      marginTop: 6,
      marginLeft: 3,
      marginBottom: 22,
      fontSize: 10,
      lineHeight: 15,
      color: '#9CA3AF',
    },

    // =================================================
    // CHAMPS
    // =================================================

    fieldCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: '#DCE7DA',
      overflow: 'hidden',
      marginBottom: 14,
    },

    fieldTopRow: {
      minHeight: 48,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: '#EEF3ED',
    },

    fieldTopRowCompact: {
      minHeight: 46,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: '#EEF3ED',
    },

    fieldTitleWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 0,
      flexShrink: 1,
    },

    fieldLabel: {
      marginLeft: 7,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.8,
      color: '#4B5563',
      flexShrink: 1,
    },

    requiredText: {
      fontSize: 9,
      fontWeight: '700',
      color: '#16A34A',
      marginLeft: 5,
    },

    optionalText: {
      fontSize: 9,
      fontWeight: '700',
      color: '#9CA3AF',
      marginLeft: 5,
    },

    input: {
      minHeight: 56,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 14,
      lineHeight: 20,
      color: '#172018',
      backgroundColor: '#FFFFFF',
    },

    fieldHint: {
      paddingHorizontal: 14,
      paddingBottom: 11,
      fontSize: 10,
      lineHeight: 15,
      color: '#9CA3AF',
    },

    // =================================================
    // QUANTITÉ + UNITÉ
    // =================================================

    quantityUnitRow: {
      flexDirection: 'row',
      alignItems: 'stretch',
      marginBottom: 14,
    },

    quantityCard: {
      flex: 1,
      minWidth: 0,
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: '#DCE7DA',
      overflow: 'hidden',
      marginRight: 5,
    },

    unitCard: {
      flex: 1,
      minWidth: 0,
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: '#DCE7DA',
      overflow: 'hidden',
      marginLeft: 5,
    },

    dropdownButton: {
      minHeight: 56,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#FFFFFF',
    },

    dropdownText: {
      flex: 1,
      marginRight: 8,
      fontSize: 14,
      fontWeight: '700',
      color: '#172018',
    },

    // =================================================
    // CONSEIL
    // =================================================

    tipCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: '#F0FDF4',
      borderWidth: 1,
      borderColor: '#D1FAE5',
      borderRadius: 15,
      padding: 12,
      marginBottom: 22,
    },

    tipIcon: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: '#DCFCE7',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 9,
    },

    tipContent: {
      flex: 1,
    },

    tipTitle: {
      fontSize: 11,
      fontWeight: '800',
      color: '#166534',
    },

    tipText: {
      marginTop: 3,
      fontSize: 10,
      lineHeight: 15,
      color: '#4B5563',
    },

    // =================================================
    // DESCRIPTION
    // =================================================

    descriptionCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: '#DCE7DA',
      overflow: 'hidden',
      marginBottom: 14,
    },

    descriptionInput: {
      minHeight: 150,
      paddingHorizontal: 14,
      paddingTop: 14,
      paddingBottom: 12,
      fontSize: 14,
      lineHeight: 21,
      color: '#172018',
      backgroundColor: '#FFFFFF',
    },

    descriptionFooter: {
      minHeight: 42,
      paddingHorizontal: 12,
      paddingBottom: 9,
      paddingTop: 2,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
    },

    descriptionHint: {
      flex: 1,
      paddingRight: 12,
      fontSize: 10,
      lineHeight: 14,
      color: '#9CA3AF',
    },

    // =================================================
    // PHOTOS
    // =================================================

    photoCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: '#DCE7DA',
      padding: 12,
      marginBottom: 22,
    },

    photoButton: {
      minHeight: 58,
      borderRadius: 15,
      backgroundColor: '#F0FDF4',
      borderWidth: 1,
      borderColor: '#BBF7D0',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
    },

    photoButtonIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: '#DCFCE7',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },

    photoButtonTextBlock: {
      flex: 1,
    },

    photoButtonTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: '#166534',
    },

    photoButtonSubtitle: {
      marginTop: 2,
      fontSize: 10,
      color: '#6B7280',
    },

    photoChevron: {
      transform: [
        {
          rotate: '-90deg',
        },
      ],
    },

    photoCount: {
      marginTop: 12,
      fontSize: 10,
      lineHeight: 15,
      fontWeight: '700',
      color: '#166534',
    },

    photosGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 10,
    },

    photoItem: {
      width: '48%',
      height: 150,
      borderRadius: 14,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#DCE7DA',
      backgroundColor: '#F4F8F3',
      position: 'relative',
      marginBottom: 10,
      marginRight: '2%',
    },

    photoPreview: {
      width: '100%',
      height: '100%',
    },

    photoNumber: {
      position: 'absolute',
      top: 7,
      left: 7,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: 'rgba(0,0,0,0.65)',
      justifyContent: 'center',
      alignItems: 'center',
    },

    photoNumberText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '800',
    },

    removePhotoButton: {
      position: 'absolute',
      top: 7,
      right: 7,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: 'rgba(127,29,29,0.88)',
      justifyContent: 'center',
      alignItems: 'center',
    },

    photoHelp: {
      marginTop: 2,
      fontSize: 10,
      lineHeight: 15,
      color: '#9CA3AF',
    },

    // =================================================
    // BOUTON ENREGISTRER
    // =================================================

    saveButton: {
      minHeight: 58,
      borderRadius: 17,
      backgroundColor: '#166534',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      marginTop: 2,
      shadowColor: '#166534',
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: 0.18,
      shadowRadius: 10,
      elevation: 4,
    },

    saveButtonDisabled: {
      opacity: 0.72,
    },

    saveIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: '#22C55E',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },

    saveTextBlock: {
      flex: 1,
    },

    saveText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
    },

    saveSubtext: {
      marginTop: 2,
      color: '#DCFCE7',
      fontSize: 10,
      fontWeight: '500',
    },

    // =================================================
    // ANNULER
    // =================================================

    cancelButton: {
      minHeight: 50,
      borderRadius: 15,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#DCE7DA',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
      marginTop: 10,
    },

    cancelButtonText: {
      marginLeft: 7,
      color: '#4B5563',
      fontSize: 13,
      fontWeight: '700',
    },

    // =================================================
    // BAS
    // =================================================

    bottomHint: {
      marginTop: 10,
      textAlign: 'center',
      fontSize: 10,
      lineHeight: 15,
      color: '#9CA3AF',
    },

    // =================================================
    // MODAL UNITÉS
    // =================================================

    modalOverlay: {
      flex: 1,
      backgroundColor:
        'rgba(15, 23, 18, 0.42)',
      justifyContent: 'flex-end',
    },

    unitModal: {
      maxHeight: '78%',
      backgroundColor: '#F4F8F3',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      overflow: 'hidden',
      paddingBottom:
        Platform.OS === 'ios'
          ? 26
          : 18,
    },

    modalHeader: {
      minHeight: 82,
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: '#E5ECE3',
      flexDirection: 'row',
      alignItems: 'center',
    },

    modalHeaderIcon: {
      width: 40,
      height: 40,
      borderRadius: 13,
      backgroundColor: '#ECFDF3',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },

    modalHeaderTextBlock: {
      flex: 1,
      minWidth: 0,
    },

    modalTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: '#172018',
    },

    modalSubtitle: {
      marginTop: 2,
      fontSize: 10,
      lineHeight: 15,
      color: '#6B7280',
    },

    modalCloseButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#F4F8F3',
      borderWidth: 1,
      borderColor: '#DCE7DA',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 8,
    },

    unitList: {
      flexGrow: 0,
    },

    unitListContent: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 18,
    },

    unitOption: {
      minHeight: 64,
      marginBottom: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#DCE7DA',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    unitOptionSelected: {
      backgroundColor: '#F0FDF4',
      borderColor: '#86EFAC',
    },

    unitOptionTextBlock: {
      flex: 1,
      minWidth: 0,
    },

    unitOptionText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#172018',
    },

    unitOptionTextSelected: {
      color: '#166534',
    },

    unitOptionHint: {
      marginTop: 2,
      fontSize: 10,
      lineHeight: 14,
      color: '#9CA3AF',
    },

    unitCheck: {
      width: 28,
      height: 28,
      borderRadius: 10,
      backgroundColor: '#22C55E',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 10,
    },
  });