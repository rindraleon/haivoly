import { ScreenHeader } from '@/components/CommonComponent/ScreenHeader';
import { FilterModal } from '@/components/InterventionComponent/FilterModal';
import type { ContexteFormulaire, CultureGlobale, InterventionGlobale } from '@/screens/InterventionScreen/InterventionListScreen.helpers';
import { styles } from '@/screens/InterventionScreen/InterventionListScreen.styles';


import { colors } from '@/theme';
import type { UseQueryResult } from '@tanstack/react-query';
import { Plus, Search, SlidersHorizontal, X } from 'lucide-react-native';
import type { Dispatch, SetStateAction } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import type { Culture, Paginated, Parcelle } from '@/types';
type Props = {
  actualiser: () => Promise<void>;
  appliquerFiltre: () => void;
  chargementGlobal: boolean;
  contexteFormulaire: ContexteFormulaire | null;
  contexteValideGlobal: boolean | null;
  continuerAjoutGlobal: () => void;
  cultureSelectionnee: string;
  cultureTemporaire: string;
  culturesFiltre: NoInfer<Culture[]>;
  culturesFiltreQuery: UseQueryResult<NoInfer<Culture[]>, Error>;
  culturesGlobales: CultureGlobale[];
  erreurGlobal: boolean;
  fermerFiltre: () => void;
  filtreActif: boolean;
  filtreOuvert: boolean;
  formOuvert: boolean;
  interventionsGlobalesFiltrees: InterventionGlobale[];
  modeAjoutGlobal: boolean;
  ouvrirAjoutGlobal: () => void;
  ouvrirFiltre: () => void;
  parcelleSelectionnee: string;
  parcelleTemporaire: string;
  parcelles: NoInfer<Parcelle[]>;
  parcellesQuery: UseQueryResult<NoInfer<Paginated<Parcelle>>, Error>;
  recherche: string;
  refreshing: boolean;
  reinitialiserFiltre: () => void;
  renderCarteIntervention: (item: InterventionGlobale) => React.JSX.Element;
  renderFormulaireInline: (cultureLabel: string, parcelleLabel: string) => React.JSX.Element | null;
  selectionCultureOuverte: boolean;
  selectionParcelleOuverte: boolean;
  setCultureTemporaire: Dispatch<SetStateAction<string>>;
  setParcelleTemporaire: Dispatch<SetStateAction<string>>;
  setRecherche: Dispatch<SetStateAction<string>>;
  setSelectionCultureOuverte: Dispatch<SetStateAction<boolean>>;
  setSelectionParcelleOuverte: Dispatch<SetStateAction<boolean>>;
  statistiquesGlobales: { total: number; recentes: number; };
  voirSuivi: () => void;
};

export function VueInterventionsCulture({
  actualiser,
  appliquerFiltre,
  chargementGlobal,
  contexteFormulaire,
  contexteValideGlobal,
  continuerAjoutGlobal,
  cultureSelectionnee,
  cultureTemporaire,
  culturesFiltre,
  culturesFiltreQuery,
  culturesGlobales,
  erreurGlobal,
  fermerFiltre,
  filtreActif,
  filtreOuvert,
  formOuvert,
  interventionsGlobalesFiltrees,
  modeAjoutGlobal,
  ouvrirAjoutGlobal,
  ouvrirFiltre,
  parcelleSelectionnee,
  parcelleTemporaire,
  parcelles,
  parcellesQuery,
  recherche,
  refreshing,
  reinitialiserFiltre,
  renderCarteIntervention,
  renderFormulaireInline,
  selectionCultureOuverte,
  selectionParcelleOuverte,
  setCultureTemporaire,
  setParcelleTemporaire,
  setRecherche,
  setSelectionCultureOuverte,
  setSelectionParcelleOuverte,
  statistiquesGlobales,
  voirSuivi,
}: Props) {
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
        </View>
  );
}
