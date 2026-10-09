import { ScreenHeader } from '@/components/CommonComponent/ScreenHeader';
import { InterventionCard } from '@/components/InterventionComponent/InterventionCard';
import { Intervention, StatutCulture, libelleStatut } from '@/screens/InterventionScreen/InterventionListScreen.helpers';
import { styles } from '@/screens/InterventionScreen/InterventionListScreen.styles';

import { colors } from '@/theme';
import type { UseQueryResult } from '@tanstack/react-query';
import { Plus, Search, SlidersHorizontal, Sprout, X } from 'lucide-react-native';
import type { Dispatch, SetStateAction } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import type {
  Intervention as InterventionInterventions,
} from '@/types';
type Props = {
  actualiser: () => Promise<void>;
  cultureId: string;
  cultureNom: string;
  interventionsFiltrees: Intervention[];
  interventionsQuery: UseQueryResult<NoInfer<InterventionInterventions[]>, Error>;
  lectureSeule: boolean;
  modificationAutorisee: boolean;
  ouvrirAjout: () => void;
  ouvrirModification: (intervention: Intervention) => void;
  parcelleId: string;
  parcelleNom: string;
  recherche: string;
  refreshing: boolean;
  renderFormulaireInline: (cultureLabel: string, parcelleLabel: string) => React.JSX.Element | null;
  setRecherche: Dispatch<SetStateAction<string>>;
  statistiquesCourantes: { total: number; recentes: number; };
  statut: StatutCulture | undefined;
  supprimerIntervention: (intervention: Intervention) => void;
};

export function ResumeInterventions({
  actualiser,
  cultureId,
  cultureNom,
  interventionsFiltrees,
  interventionsQuery,
  lectureSeule,
  modificationAutorisee,
  ouvrirAjout,
  ouvrirModification,
  parcelleId,
  parcelleNom,
  recherche,
  refreshing,
  renderFormulaireInline,
  setRecherche,
  statistiquesCourantes,
  statut,
  supprimerIntervention,
}: Props) {
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
      </View>
  );
}
