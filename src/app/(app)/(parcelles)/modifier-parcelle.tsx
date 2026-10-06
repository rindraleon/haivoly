import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import { useQueryClient } from '@tanstack/react-query';

import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  Layers3,
  MapPinned,
  Pencil,
  Save,
  Sprout,
  X,
} from 'lucide-react-native';

import { api } from '@/api/client';

const TYPES_SOL = [
  'Argileux',
  'Sableux',
  'Limoneux',
  'Argilo-limoneux',
  'Humifère',
  'Latéritique',
  'Rocheux',
];

const COLORS = {
  primary: '#2F6B3A',
  primaryDark: '#24562E',
  primaryLight: '#EAF4E7',
  primarySoft: '#F2F8EF',

  background: '#F5F8F3',
  white: '#FFFFFF',

  text: '#18321F',
  textSecondary: '#6C786E',
  placeholder: '#9BA69D',

  border: '#DEE7DC',

  danger: '#C62828',

  shadow: '#23452A',
};

export default function ModifierParcelleScreen() {
  // =====================================================
  // PARAMÈTRES
  // =====================================================

  const { parcelleId } =
    useLocalSearchParams<{
      parcelleId: string;
    }>();

  const queryClient = useQueryClient();

  // =====================================================
  // ÉTATS
  // =====================================================

  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [typeSol, setTypeSol] = useState('');

  const [showTypesSol, setShowTypesSol] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // =====================================================
  // CHARGER LA PARCELLE
  // =====================================================

  useEffect(() => {
    const chargerParcelle = async () => {
      console.log(
        'ID PARCELLE REÇU:',
        parcelleId,
      );

      if (!parcelleId) {
        Alert.alert(
          'Erreur',
          'Identifiant de la parcelle introuvable.',
        );

        router.back();

        return;
      }

      try {
        setLoading(true);

        const response = await api.get(
          `/parcelles/${parcelleId}`,
        );

        console.log(
          'PARCELLE RÉCUPÉRÉE:',
          response.data,
        );

        const parcelle = response.data;

        setNom(
          parcelle.nom ?? '',
        );

        setDescription(
          parcelle.description ?? '',
        );

        setTypeSol(
          parcelle.typeSol ?? '',
        );
      } catch (error: any) {
        console.log(
          'ERREUR CHARGEMENT PARCELLE:',
          error?.response?.data || error,
        );

        Alert.alert(
          'Erreur',
          'Impossible de récupérer les informations de la parcelle.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ],
        );
      } finally {
        setLoading(false);
      }
    };

    chargerParcelle();
  }, [parcelleId]);

  // =====================================================
  // MODIFIER
  // =====================================================

  const handleModifier = async () => {
    if (!parcelleId) {
      Alert.alert(
        'Erreur',
        'Identifiant de la parcelle introuvable.',
      );

      return;
    }

    if (!nom.trim()) {
      Alert.alert(
        'Nom obligatoire',
        'Veuillez saisir le nom de la parcelle.',
      );

      return;
    }

    try {
      setSaving(true);

      console.log(
        'MODIFICATION PARCELLE:',
        parcelleId,
      );

      await api.patch(
        `/parcelles/${parcelleId}`,
        {
          nom: nom.trim(),

          description:
            description.trim() || undefined,

          typeSol:
            typeSol || undefined,
        },
      );

      // Actualiser la liste
      await queryClient.invalidateQueries({
        queryKey: ['parcelles'],
      });

      // Actualiser le détail
      await queryClient.invalidateQueries({
        queryKey: ['parcelle', parcelleId],
      });

      Alert.alert(
        'Modification enregistrée',
        'Les informations de la parcelle ont été mises à jour.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error: any) {
      console.log(
        'ERREUR MODIFICATION:',
        error?.response?.data || error,
      );

      const message =
        error?.response?.data?.message ||
        'Impossible de modifier la parcelle.';

      Alert.alert(
        'Erreur',
        String(message),
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // MODIFIER DÉLIMITATION
  // =====================================================

  const handleModifierDelimitation = () => {
    if (!parcelleId) {
      return;
    }

    router.push({
      pathname: '/delimiter-parcelle',
      params: {
        parcelleId,
        mode: 'EDIT',
      },
    });
  };

  // =====================================================
  // CHARGEMENT
  // =====================================================

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingIcon}>
          <Sprout
            size={28}
            color={COLORS.primary}
            strokeWidth={2}
          />
        </View>

        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />

        <Text style={styles.loadingTitle}>
          Chargement de la parcelle
        </Text>

        <Text style={styles.loadingSubtitle}>
          Récupération des informations...
        </Text>
      </View>
    );
  }

  // =====================================================
  // INTERFACE
  // =====================================================

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            hitSlop={8}
          >
            <ArrowLeft
              size={21}
              color={COLORS.text}
              strokeWidth={2.2}
            />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>
              Modifier la parcelle
            </Text>

            <Text style={styles.headerSubtitle}>
              Informations du terrain
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Sprout
              size={20}
              color={COLORS.primary}
              strokeWidth={2}
            />
          </View>
        </View>

        {/* ================================================= */}
        {/* HERO */}
        {/* ================================================= */}

        <View style={styles.heroCard}>
          <View style={styles.heroDecorationOne} />
          <View style={styles.heroDecorationTwo} />

          <View style={styles.heroIcon}>
            <Pencil
              size={22}
              color={COLORS.white}
              strokeWidth={2}
            />
          </View>

          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              Modifier les informations
            </Text>

            <Text style={styles.heroText}>
              Mettez à jour les informations
              descriptives de votre parcelle.
            </Text>
          </View>
        </View>

        {/* ================================================= */}
        {/* INFORMATIONS */}
        {/* ================================================= */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Informations générales
            </Text>

            <Text style={styles.sectionSubtitle}>
              Décrivez votre terrain
            </Text>
          </View>
        </View>

        {/* ================================================= */}
        {/* NOM */}
        {/* ================================================= */}

        <View style={styles.fieldContainer}>
          <View style={styles.labelRow}>
            <View style={styles.labelIcon}>
              <Sprout
                size={16}
                color={COLORS.primary}
                strokeWidth={2}
              />
            </View>

            <Text style={styles.label}>
              Nom de la parcelle
            </Text>

            <Text style={styles.required}>
              *
            </Text>
          </View>

          <View style={styles.inputWrapper}>
            <Pencil
              size={18}
              color={COLORS.primary}
              strokeWidth={1.9}
            />

            <TextInput
              style={styles.input}
              value={nom}
              onChangeText={setNom}
              placeholder="Ex. Parcelle Nord"
              placeholderTextColor={
                COLORS.placeholder
              }
              returnKeyType="next"
              maxLength={100}
            />
          </View>

          <Text style={styles.helperText}>
            Donnez un nom simple pour retrouver
            facilement votre parcelle.
          </Text>
        </View>

        {/* ================================================= */}
        {/* DESCRIPTION */}
        {/* ================================================= */}

        <View style={styles.fieldContainer}>
          <View style={styles.labelRow}>
            <View style={styles.labelIcon}>
              <FileText
                size={16}
                color={COLORS.primary}
                strokeWidth={2}
              />
            </View>

            <Text style={styles.label}>
              Description
            </Text>

            <Text style={styles.optional}>
              Facultatif
            </Text>
          </View>

          <View
            style={[
              styles.inputWrapper,
              styles.textareaWrapper,
            ]}
          >
            <FileText
              size={18}
              color={COLORS.primary}
              strokeWidth={1.9}
              style={styles.textareaIcon}
            />

            <TextInput
              style={[
                styles.input,
                styles.textarea,
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="Ex. Hambolena voankazo"
              placeholderTextColor={
                COLORS.placeholder
              }
              multiline
              textAlignVertical="top"
              maxLength={300}
            />
          </View>

          <View style={styles.characterRow}>
            <Text style={styles.helperText}>
              Ajoutez une précision sur le terrain.
            </Text>

            <Text style={styles.characterCount}>
              {description.length}/300
            </Text>
          </View>
        </View>

        {/* ================================================= */}
        {/* TYPE SOL */}
        {/* ================================================= */}

        <View style={styles.fieldContainer}>
          <View style={styles.labelRow}>
            <View style={styles.labelIcon}>
              <Layers3
                size={16}
                color={COLORS.primary}
                strokeWidth={2}
              />
            </View>

            <Text style={styles.label}>
              Type de sol
            </Text>

            <Text style={styles.optional}>
              Facultatif
            </Text>
          </View>

          <Pressable
            onPress={() =>
              setShowTypesSol(
                !showTypesSol,
              )
            }
            style={({ pressed }) => [
              styles.select,
              showTypesSol &&
                styles.selectActive,
              pressed && styles.pressed,
            ]}
          >
            <View
              style={styles.selectLeft}
            >
              <View style={styles.selectIcon}>
                <Sprout
                  size={19}
                  color={COLORS.primary}
                  strokeWidth={2}
                />
              </View>

              <Text
                style={
                  typeSol
                    ? styles.selectText
                    : styles.placeholder
                }
              >
                {typeSol ||
                  'Sélectionner un type de sol'}
              </Text>
            </View>

            <ChevronDown
              size={20}
              color={
                showTypesSol
                  ? COLORS.primary
                  : COLORS.textSecondary
              }
              strokeWidth={2}
            />
          </Pressable>

          {/* OPTIONS */}
          {showTypesSol && (
            <View style={styles.optionsContainer}>
              <Text style={styles.optionsTitle}>
                Choisissez le type de sol
              </Text>

              <View style={styles.optionsGrid}>
                {TYPES_SOL.map((type) => {
                  const selected =
                    typeSol === type;

                  return (
                    <Pressable
                      key={type}
                      onPress={() => {
                        setTypeSol(type);
                        setShowTypesSol(false);
                      }}
                      style={({ pressed }) => [
                        styles.option,
                        selected &&
                          styles.optionSelected,
                        pressed &&
                          styles.pressed,
                      ]}
                    >
                      <View
                        style={[
                          styles.optionIcon,
                          selected &&
                            styles.optionIconSelected,
                        ]}
                      >
                        {selected ? (
                          <Check
                            size={15}
                            color={COLORS.white}
                            strokeWidth={2.5}
                          />
                        ) : (
                          <Sprout
                            size={15}
                            color={
                              COLORS.primary
                            }
                            strokeWidth={1.8}
                          />
                        )}
                      </View>

                      <Text
                        style={[
                          styles.optionText,
                          selected &&
                            styles.optionTextSelected,
                        ]}
                        numberOfLines={2}
                      >
                        {type}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        {/* ================================================= */}
        {/* DÉLIMITATION GPS */}
        {/* ================================================= */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Délimitation
            </Text>

            <Text style={styles.sectionSubtitle}>
              Modifier le contour géographique
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleModifierDelimitation}
          style={({ pressed }) => [
            styles.mapCard,
            pressed && styles.pressedCard,
          ]}
        >
          <View style={styles.mapIcon}>
            <MapPinned
              size={24}
              color={COLORS.primary}
              strokeWidth={2}
            />
          </View>

          <View style={styles.mapContent}>
            <Text style={styles.mapTitle}>
              Contour GPS de la parcelle
            </Text>

            <Text style={styles.mapSubtitle}>
              Déplacer, ajouter ou supprimer
              les points GPS
            </Text>

            <View style={styles.mapStatus}>
              <View
                style={styles.statusDot}
              />

              <Text style={styles.statusText}>
                Délimitation disponible
              </Text>
            </View>
          </View>

          <View style={styles.chevronContainer}>
            <ChevronRight
              size={20}
              color={COLORS.primary}
              strokeWidth={2}
            />
          </View>
        </Pressable>

        {/* ================================================= */}
        {/* CONSEIL */}
        {/* ================================================= */}

        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Sprout
              size={19}
              color={COLORS.primary}
              strokeWidth={2}
            />
          </View>

          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>
              Conseil
            </Text>

            <Text style={styles.tipText}>
              La modification des informations
              ne change pas la superficie ni le
              contour GPS de votre parcelle.
            </Text>
          </View>
        </View>

        {/* ================================================= */}
        {/* ENREGISTRER */}
        {/* ================================================= */}

        <Pressable
          onPress={handleModifier}
          disabled={saving}
          style={({ pressed }) => [
            styles.saveButton,
            saving &&
              styles.saveButtonDisabled,
            pressed &&
              !saving &&
              styles.saveButtonPressed,
          ]}
        >
          {saving ? (
            <ActivityIndicator
              size="small"
              color={COLORS.white}
            />
          ) : (
            <>
              <View style={styles.saveIcon}>
                <Save
                  size={18}
                  color={COLORS.primary}
                  strokeWidth={2.2}
                />
              </View>

              <View style={styles.saveContent}>
                <Text style={styles.saveTitle}>
                  Enregistrer les modifications
                </Text>

                <Text style={styles.saveSubtitle}>
                  Mettre à jour la parcelle
                </Text>
              </View>

              <Check
                size={21}
                color={COLORS.white}
                strokeWidth={2.4}
              />
            </>
          )}
        </Pressable>

        {/* ================================================= */}
        {/* ANNULER */}
        {/* ================================================= */}

        <Pressable
          onPress={() => router.back()}
          disabled={saving}
          style={({ pressed }) => [
            styles.cancelButton,
            pressed && styles.pressed,
          ]}
        >
          <X
            size={17}
            color={COLORS.textSecondary}
            strokeWidth={2}
          />

          <Text style={styles.cancelText}>
            Annuler
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// =======================================================
// STYLES
// =======================================================

const styles = StyleSheet.create({
  // =====================================================
  // CONTAINER
  // =====================================================

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 45,
  },

  // =====================================================
  // LOADING
  // =====================================================

  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  loadingIcon: {
    width: 66,
    height: 66,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },

  loadingTitle: {
    marginTop: 15,
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },

  loadingSubtitle: {
    marginTop: 5,
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  // =====================================================
  // HEADER
  // =====================================================

  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerText: {
    flex: 1,
    paddingHorizontal: 12,
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.3,
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // =====================================================
  // HERO
  // =====================================================

  heroCard: {
    minHeight: 116,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    padding: 17,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },

  heroDecorationOne: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor:
      'rgba(174, 220, 133, 0.13)',
    right: -58,
    top: -72,
  },

  heroDecorationTwo: {
    position: 'absolute',
    width: 105,
    height: 105,
    borderRadius: 53,
    backgroundColor:
      'rgba(255,255,255,0.05)',
    left: -45,
    bottom: -55,
  },

  heroIcon: {
    width: 49,
    height: 49,
    borderRadius: 17,
    backgroundColor:
      'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  heroContent: {
    flex: 1,
  },

  heroTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
  },

  heroText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  // =====================================================
  // SECTION
  // =====================================================

  sectionHeader: {
    marginBottom: 11,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // =====================================================
  // FIELDS
  // =====================================================

  fieldContainer: {
    marginBottom: 19,
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  labelIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  label: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
  },

  required: {
    marginLeft: 4,
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '800',
  },

  optional: {
    marginLeft: 'auto',
    fontSize: 10,
    color: COLORS.textSecondary,
  },

  inputWrapper: {
    minHeight: 54,
    backgroundColor: COLORS.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    minHeight: 52,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '500',
  },

  textareaWrapper: {
    minHeight: 112,
    alignItems: 'flex-start',
    paddingTop: 14,
  },

  textareaIcon: {
    marginTop: 2,
  },

  textarea: {
    minHeight: 88,
    paddingTop: 0,
  },

  helperText: {
    marginTop: 6,
    marginLeft: 2,
    fontSize: 10.5,
    lineHeight: 16,
    color: COLORS.textSecondary,
  },

  characterRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  characterCount: {
    marginLeft: 'auto',
    marginTop: 6,
    fontSize: 10,
    color: COLORS.placeholder,
  },

  // =====================================================
  // SELECT
  // =====================================================

  select: {
    minHeight: 56,
    borderRadius: 17,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  selectActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySoft,
  },

  selectLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  selectIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  selectText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },

  placeholder: {
    flex: 1,
    color: COLORS.placeholder,
    fontSize: 14,
  },

  optionsContainer: {
    marginTop: 7,
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  optionsTitle: {
    marginBottom: 10,
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },

  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  option: {
    width: '48%',
    minHeight: 46,
    borderRadius: 13,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  optionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  optionIcon: {
    width: 27,
    height: 27,
    borderRadius: 9,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  optionIconSelected: {
    backgroundColor:
      'rgba(255,255,255,0.18)',
  },

  optionText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: COLORS.text,
  },

  optionTextSelected: {
    color: COLORS.white,
  },

  // =====================================================
  // MAP / DELIMITATION
  // =====================================================

  mapCard: {
    minHeight: 94,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  mapIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  mapContent: {
    flex: 1,
  },

  mapTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.text,
  },

  mapSubtitle: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.textSecondary,
  },

  mapStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: 5,
  },

  statusText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '700',
  },

  chevronContainer: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  // =====================================================
  // TIP
  // =====================================================

  tipCard: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: 18,
    padding: 13,
    flexDirection: 'row',
    marginBottom: 19,
  },

  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  tipContent: {
    flex: 1,
  },

  tipTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.text,
  },

  tipText: {
    marginTop: 3,
    fontSize: 10.5,
    lineHeight: 16,
    color: COLORS.textSecondary,
  },

  // =====================================================
  // SAVE
  // =====================================================

  saveButton: {
    minHeight: 68,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  saveButtonDisabled: {
    opacity: 0.55,
  },

  saveButtonPressed: {
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  saveIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  saveContent: {
    flex: 1,
  },

  saveTitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '900',
  },

  saveSubtitle: {
    marginTop: 3,
    color: 'rgba(255,255,255,0.70)',
    fontSize: 10.5,
  },

  // =====================================================
  // CANCEL
  // =====================================================

  cancelButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 7,
  },

  cancelText: {
    marginLeft: 5,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },

  // =====================================================
  // PRESSED
  // =====================================================

  pressed: {
    opacity: 0.72,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  pressedCard: {
    opacity: 0.82,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },
});