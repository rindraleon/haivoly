/**
 * Section `VueParcelles` extraite de `ParcelleListScreen`.
 *
 * Le rendu est repris à l’identique : seules les valeurs et les actions
 * du composant parent sont reçues en props, ce qui évite de faire
 * transiter toute la logique de l’écran dans un seul fichier.
 */
import { AppBottomBar } from '@/components/CommonComponent/AppBottomBar';
import { Chip } from '@/components/CommonComponent/Chip';
import { EmptyState } from '@/components/CommonComponent/EmptyState';
import { ScreenHeader } from '@/components/CommonComponent/ScreenHeader';
import { SearchBar } from '@/components/CommonComponent/SearchBar';
import { ParcelleCard } from '@/components/ParcelleComponent/ParcelleCard';
import { Filtre } from '@/screens/ParcelleScreen/ParcelleListScreen.helpers';
import { styles } from '@/screens/ParcelleScreen/ParcelleListScreen.styles';

import { colors } from '@/theme';
import { router } from 'expo-router';
import { MapPinned, Plus, SearchX, SlidersHorizontal } from 'lucide-react-native';
import type { Dispatch, SetStateAction } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';

import type {
  Parcelle,
} from '@/types';
type Props = {
  filtre: Filtre;
  filtrees: Parcelle[];
  onRefresh: () => Promise<void>;
  recherche: string;
  refreshing: boolean;
  setFiltre: Dispatch<SetStateAction<Filtre>>;
  setRecherche: Dispatch<SetStateAction<string>>;
  setShowFiltres: Dispatch<SetStateAction<boolean>>;
  showFiltres: boolean;
  stats: { actives: number; superficieHa: number; total: number; };
};

export function VueParcelles({
  filtre,
  filtrees,
  onRefresh,
  recherche,
  refreshing,
  setFiltre,
  setRecherche,
  setShowFiltres,
  showFiltres,
  stats,
}: Props) {
  return (
<View style={styles.root}>
        {/* =================================================
            HEADER
        ================================================== */}
        <ScreenHeader
          title="Parcelles"
          subtitle={`${stats.actives} actives • ${stats.superficieHa.toFixed(
            2,
          )} ha`}
          showBack
        />

        {/* =================================================
            TOP BAR
        ================================================== */}
        <View style={styles.topBar}>
          <View style={styles.searchRow}>
            <View style={{ flex: 1 }}>
              <SearchBar
                value={recherche}
                onChangeText={setRecherche}
                placeholder="Rechercher parcelle, sol, description..."
              />
            </View>

            <Pressable
              onPress={() =>
                setShowFiltres(
                  (v) => !v,
                )
              }
              style={({ pressed }) => [
                styles.filterBtn,
                showFiltres &&
                  styles.filterBtnActive,
                pressed && {
                  opacity: 0.8,
                },
              ]}
            >
              <SlidersHorizontal
                size={18}
                color={
                  showFiltres
                    ? '#FFFFFF'
                    : colors.neutral[700]
                }
                strokeWidth={2}
              />
            </Pressable>
          </View>

          {/* =================================================
              FILTRES
          ================================================== */}
          {showFiltres && (
            <View style={styles.filterPanel}>
              <Text
                style={styles.filterLabel}
              >
                Filtrer par statut
              </Text>

              <View style={styles.chips}>
                {(
                  [
                    'TOUTES',
                    'ACTIVE',
                    'ABANDONNEE',
                    'ARCHIVEE',
                  ] as Filtre[]
                ).map((f) => (
                  <Chip
                    key={f}
                    label={
                      f === 'TOUTES'
                        ? 'Toutes'
                        : f
                    }
                    selected={
                      filtre === f
                    }
                    onPress={() =>
                      setFiltre(f)
                    }
                  />
                ))}
              </View>
            </View>
          )}

          {/* =================================================
              STATS
          ================================================== */}
          <View
            style={styles.statsBar}
          >
            <View
              style={styles.statPill}
            >
              <Text
                style={
                  styles.statPillValue
                }
              >
                {filtrees.length}
              </Text>

              <Text
                style={
                  styles.statPillLabel
                }
              >
                résultat(s)
              </Text>
            </View>

            <Text
              style={styles.statHint}
              numberOfLines={1}
            >
              {recherche
                ? `pour "${recherche}"`
                : 'Triées par modification récente'}
            </Text>
          </View>
        </View>

        {/* =================================================
            FOND AGRICOLE + LISTE
        ================================================== */}
        <View style={styles.listArea}>
          {/* Décor champ agricole */}
          <View
            pointerEvents="none"
            style={[
              styles.fieldShape,
              styles.fieldShapeOne,
            ]}
          />

          <View
            pointerEvents="none"
            style={[
              styles.fieldShape,
              styles.fieldShapeTwo,
            ]}
          />

          <View
            pointerEvents="none"
            style={[
              styles.fieldShape,
              styles.fieldShapeThree,
            ]}
          />

          {/* Lignes représentant les parcelles/champs */}
          <View
            pointerEvents="none"
            style={[
              styles.fieldLine,
              styles.fieldLineOne,
            ]}
          />

          <View
            pointerEvents="none"
            style={[
              styles.fieldLine,
              styles.fieldLineTwo,
            ]}
          />

          <FlatList
            data={filtrees}
            keyExtractor={(item) =>
              item.id
            }
            contentContainerStyle={
              styles.listContent
            }
            showsVerticalScrollIndicator={
              false
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={
                  colors.primary[500]
                }
              />
            }
            ListEmptyComponent={
              <EmptyState
                icon={
                  recherche
                    ? SearchX
                    : MapPinned
                }
                title={
                  recherche
                    ? 'Aucun résultat'
                    : 'Aucune parcelle'
                }
                description={
                  recherche
                    ? `Aucune parcelle ne correspond à "${recherche}". Essayez un autre terme.`
                    : 'Commencez par créer votre première parcelle pour organiser vos cultures.'
                }
                actionLabel={
                  recherche
                    ? 'Effacer la recherche'
                    : 'Créer une parcelle'
                }
                onAction={() =>
                  recherche
                    ? setRecherche('')
                    : router.push(
                        '/ajout-parcelle' as any,
                      )
                }
              />
            }
            renderItem={({ item }) => (
              <ParcelleCard
                parcelle={item}
              />
            )}
          />
        </View>

        {/* =================================================
            FAB "+"
        ================================================== */}
        <Pressable
          onPress={() =>
            router.push(
              '/ajout-parcelle' as any,
            )
          }
          style={({ pressed }) => [
            styles.fab,
            pressed && {
              opacity: 0.9,
              transform: [
                {
                  scale: 0.94,
                },
              ],
            },
          ]}
        >
          <Plus
            size={26}
            color="#FFFFFF"
            strokeWidth={2.7}
          />
        </Pressable>

        {/* =================================================
            BOTTOM BAR
        ================================================== */}
        <AppBottomBar />
      </View>
  );
}
