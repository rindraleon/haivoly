/**
 * Sous-composant `FilterModal` extrait de `InterventionListScreen`.
 *
 * Regroupe la présentation d'un élément de liste et ses interactions
 * locales, ce qui allège nettement le composant principal.
 */
import { ActivityIndicator, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Check, ChevronDown, ChevronRight, MapPin, Sprout, X } from 'lucide-react-native';
import { libelleStatut } from '@/screens/InterventionScreen/InterventionListScreen.helpers';
import { styles } from '@/screens/InterventionScreen/InterventionListScreen.styles';

export function FilterModal({
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
