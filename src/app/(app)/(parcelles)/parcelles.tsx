import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import {
  MapPinned,
  Plus,
  SearchX,
  SlidersHorizontal,
  ChevronRight,
  Ruler,
  Layers,
  Calendar,
} from 'lucide-react-native';
import { useParcelles } from '@/hooks/useParcelles';
import { colors, radius } from '@/design/tokens';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SearchBar } from '@/components/ui/SearchBar';
import { Chip } from '@/components/ui/Chip';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { AppBottomBar } from '@/components/layout/AppBottomBar';
import type { StatutParcelle, Parcelle } from '@/api/parcelles';

type Filtre = 'TOUTES' | StatutParcelle;

export default function ParcellesScreen() {
  const { data: parcelles, isLoading, isError, refetch } = useParcelles();
  const [recherche, setRecherche] = useState('');
  const [filtre, setFiltre] = useState<Filtre>('TOUTES');
  const [showFiltres, setShowFiltres] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const parcellesActivesBrutes = parcelles ?? [];

  const filtrees = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return parcellesActivesBrutes
      .filter((p) => {
        if (filtre !== 'TOUTES' && p.statut !== filtre) return false;
        if (!q) return true;
        return (
          p.nom.toLowerCase().includes(q) ||
          (p.description ?? '').toLowerCase().includes(q) ||
          (p.typeSol ?? '').toLowerCase().includes(q) ||
          p.statut.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.modifieA ?? 0).getTime() - new Date(a.modifieA ?? 0).getTime());
  }, [parcellesActivesBrutes, recherche, filtre]);

  const stats = useMemo(() => {
    const actives = parcellesActivesBrutes.filter((p) => p.statut === 'ACTIVE').length;
    const superficie = parcellesActivesBrutes
      .filter((p) => p.statut === 'ACTIVE')
      .reduce((acc, p) => acc + (p.superficie ?? 0), 0);
    return { actives, superficieHa: superficie / 10000, total: parcellesActivesBrutes.length };
  }, [parcellesActivesBrutes]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) return <LoadingState message="Chargement des parcelles..." />;
  if (isError)
    return (
      <ErrorState
        title="Impossible de charger les parcelles"
        message="Vérifiez votre connexion."
        onRetry={() => refetch()}
        onBack={() => router.back()}
      />
    );

  return (
    <View style={styles.root}>
      <ScreenHeader title="Parcelles" subtitle={`${stats.actives} actives • ${stats.superficieHa.toFixed(2)} ha`} showBack />

      <View style={styles.topBar}>
        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <SearchBar value={recherche} onChangeText={setRecherche} placeholder="Rechercher parcelle, sol, description..." />
          </View>
          <Pressable
            onPress={() => setShowFiltres((v) => !v)}
            style={({ pressed }) => [styles.filterBtn, showFiltres && styles.filterBtnActive, pressed && { opacity: 0.8 }]}
          >
            <SlidersHorizontal size={18} color={showFiltres ? '#FFFFFF' : colors.neutral[700]} strokeWidth={2} />
          </Pressable>
        </View>

        {showFiltres && (
          <View style={styles.filterPanel}>
            <Text style={styles.filterLabel}>Filtrer par statut</Text>
            <View style={styles.chips}>
              {(['TOUTES', 'ACTIVE', 'ABANDONNEE', 'ARCHIVEE'] as Filtre[]).map((f) => (
                <Chip key={f} label={f === 'TOUTES' ? 'Toutes' : f} selected={filtre === f} onPress={() => setFiltre(f)} />
              ))}
            </View>
          </View>
        )}

        <View style={styles.statsBar}>
          <View style={styles.statPill}>
            <Text style={styles.statPillValue}>{filtrees.length}</Text>
            <Text style={styles.statPillLabel}>résultat(s)</Text>
          </View>
          <Text style={styles.statHint}>
            {recherche ? `pour "${recherche}"` : 'Triées par modification récente'}
          </Text>
        </View>
      </View>

      <FlatList
        data={filtrees}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[500]} />}
        ListEmptyComponent={
          <EmptyState
            icon={recherche ? SearchX : MapPinned}
            title={recherche ? 'Aucun résultat' : 'Aucune parcelle'}
            description={
              recherche
                ? `Aucune parcelle ne correspond à "${recherche}". Essayez un autre terme.`
                : 'Commencez par créer votre première parcelle pour organiser vos cultures.'
            }
            actionLabel={recherche ? 'Effacer la recherche' : 'Créer une parcelle'}
            onAction={() => (recherche ? setRecherche('') : router.push('/ajout-parcelle' as any))}
          />
        }
        renderItem={({ item }) => <ParcelleCard parcelle={item} />}
      />

      <Pressable
        onPress={() => router.push('/ajout-parcelle' as any)}
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
      >
        <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
        <Text style={styles.fabText}>Nouvelle parcelle</Text>
      </Pressable>

      <AppBottomBar />
    </View>
  );
}

function ParcelleCard({ parcelle }: { parcelle: Parcelle }) {
  const superficie = parcelle.superficie
    ? {
        m2: parcelle.superficie,
        ha: parcelle.superficie / 10000,
        are: parcelle.superficie / 100,
      }
    : null;

  const variant: any = parcelle.statut === 'ACTIVE' ? 'success' : parcelle.statut === 'ABANDONNEE' ? 'warning' : 'neutral';

  return (
    <Pressable
      onPress={() => router.push(`/detail-parcelle?parcelleId=${parcelle.id}` as any)}
      style={({ pressed }) => [pressed && { opacity: 0.93, transform: [{ scale: 0.99 }] }]}
    >
      <Card style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.cardIcon}>
            <MapPinned size={18} color={colors.primary[600]} strokeWidth={1.9} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text numberOfLines={1} style={styles.cardTitle}>
              {parcelle.nom}
            </Text>
            <View style={styles.metaRow}>
              {parcelle.typeSol ? (
                <View style={styles.metaPill}>
                  <Layers size={11} color={colors.neutral[500]} />
                  <Text style={styles.metaText}>{parcelle.typeSol}</Text>
                </View>
              ) : null}
              {superficie ? (
                <View style={styles.metaPill}>
                  <Ruler size={11} color={colors.neutral[500]} />
                  <Text style={styles.metaText}>
                    {superficie.ha.toFixed(2)} ha • {superficie.m2.toFixed(0)} m²
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
          <Badge label={parcelle.statut} variant={variant} dot />
        </View>

        {parcelle.description ? (
          <Text numberOfLines={2} style={styles.desc}>
            {parcelle.description}
          </Text>
        ) : (
          <Text style={styles.descMuted}>Aucune description</Text>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.dateRow}>
            <Calendar size={12} color={colors.neutral[400]} />
            <Text style={styles.dateText}>
              {parcelle.modifieA ? new Date(parcelle.modifieA).toLocaleDateString('fr-FR') : '—'}
            </Text>
          </View>
          <View style={styles.chev}>
            <ChevronRight size={16} color={colors.neutral[500]} />
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background.app },
  topBar: { paddingHorizontal: 16, paddingTop: 12, gap: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: colors.border.default, paddingBottom: 12 },
  searchRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: { backgroundColor: colors.primary[500], borderColor: colors.primary[500] },
  filterPanel: {
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    padding: 12,
    gap: 8,
  },
  filterLabel: { fontSize: 12, fontWeight: '700', color: colors.neutral[700], textTransform: 'uppercase', letterSpacing: 0.5 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statsBar: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[100],
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  statPillValue: { fontSize: 12, fontWeight: '800', color: colors.primary[700] },
  statPillLabel: { fontSize: 11.5, color: colors.primary[700], fontWeight: '600' },
  statHint: { fontSize: 12, color: colors.neutral[500], flex: 1 },
  listContent: { padding: 16, gap: 12, paddingBottom: 96 },
  card: { gap: 12, padding: 14 },
  cardTop: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  cardIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: colors.neutral[900], letterSpacing: -0.3 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  metaText: { fontSize: 11, fontWeight: '600', color: colors.neutral[600] },
  desc: { fontSize: 12.5, lineHeight: 18, color: colors.neutral[600] },
  descMuted: { fontSize: 12.5, color: colors.neutral[400], fontStyle: 'italic' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dateText: { fontSize: 11.5, color: colors.neutral[400], fontWeight: '500' },
  chev: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 88,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary[500],
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: radius.full,
    boxShadow: '0 6px 20px rgba(16,24,40,.12)',
    elevation: 6,
  },
  fabText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
