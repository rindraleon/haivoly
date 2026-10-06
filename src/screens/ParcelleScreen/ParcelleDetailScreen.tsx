/**
 * ParcelleDetailScreen — implémentation de l’écran.
 *
 * Le fichier de route correspondant (`src/app/(app)/…`) ne fait que
 * réexporter ce composant : toute la logique vit ici.
 */
import React from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Layers, MapPinned, Pencil, PenTool, Ruler, Sprout } from 'lucide-react-native';

import { colors } from '@/theme';
import { Badge } from '@/components/CommonComponent/Badge';
import { Button } from '@/components/CommonComponent/Button';
import { Card } from '@/components/CommonComponent/Card';
import { EmptyState } from '@/components/CommonComponent/EmptyState';
import { ErrorState } from '@/components/CommonComponent/ErrorState';
import { LoadingState } from '@/components/CommonComponent/LoadingState';
import { ParcelleMap } from '@/components/ParcelleComponent/ParcelleMap';
import { ParcelleFormShell } from '@/components/ParcelleComponent/ParcelleFormShell';
import { useCultures, useParcelle } from '@/hooks';
import { formatSuperficieValue } from '@/utils/parcelle';
import { formatDate } from '@/utils/date';
import type { StatutCulture } from '@/types';


import { styles } from './ParcelleDetailScreen.styles';
/**
 * Détail d'une parcelle.
 *
 * Correctif principal : la carte se centre **sur les coordonnées enregistrées**
 * de la parcelle (marqueur + `animateToRegion`, ou `fitToCoordinates` dès qu'il
 * y a plusieurs sommets). La position de l'utilisateur n'est jamais utilisée ici.
 */
export default function DetailParcelleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const parcelle = useParcelle(id);
  const cultures = useCultures({ parcelleId: id as string, limit: 50 });

  const points = parcelle.data?.pointsGPS ?? [];
  const latitude = parcelle.data?.latitude ?? null;
  const longitude = parcelle.data?.longitude ?? null;

  const centre =
    latitude != null && longitude != null
      ? { latitude, longitude }
      : points.length > 0
        ? centroideDe(points)
        : null;

  const center = centre;

  if (parcelle.isLoading) {
    return <LoadingState message="Chargement de la parcelle…" />;
  }

  if (parcelle.isError || !parcelle.data) {
    return (
      <ErrorState
        title="Parcelle introuvable"
        message="Cette parcelle n'existe pas ou ne vous appartient pas."
        onRetry={() => parcelle.refetch()}
        onBack={() => router.back()}
      />
    );
  }

  const data = parcelle.data;
  const superficie = formatSuperficieValue(data.superficie);

  return (
    <ParcelleFormShell
      title={data.nom}
      subtitle={superficie ? `Superficie ${superficie}` : 'Superficie non calculée'}
      onBack={() => router.back()}
      footer={
        <View style={styles.footerRow}>
          {/* Action « Modifier » explicite, avec icône Lucide */}
          <Button
            variant="outline"
            onPress={() =>
              router.push({
                pathname: '/(app)/(parcelles)/modifier-parcelle',
                params: { id: data.id },
              })
            }
            leftIcon={<Pencil size={16} color={colors.neutral[800]} />}
            style={styles.flex}
          >
            Modifier
          </Button>

          <Button
            onPress={() =>
              router.push({
                pathname: '/(app)/(parcelles)/delimiter-parcelle',
                params: { id: data.id },
              })
            }
            leftIcon={<PenTool size={16} color={colors.neutral[0]} />}
            style={styles.flex}
          >
            Délimiter
          </Button>
        </View>
      }
    >
      <Card padded={false}>
        <ParcelleMap
          points={points}
          center={center}
          // Jamais `showUserLocation` ici : la carte doit pointer sur la parcelle.
          showUserLocation={false}
          style={styles.map}
        />

        <View style={styles.mapFooter}>
          <View style={styles.stat}>
            <MapPinned size={15} color={colors.primary[700]} />
            <Text style={styles.statText}>
              {points.length} sommet{points.length > 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.stat}>
            <Ruler size={15} color={colors.neutral[500]} />
            <Text style={styles.statText}>{superficie ?? '—'}</Text>
          </View>
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Informations</Text>
        <Row label="Statut" value={<Badge label={libelleStatut(data.statut)} variant={badgeStatut(data.statut)} />} />
        <Row label="Type de sol" value={data.typeSol ?? 'Non renseigné'} />
        <Row label="Latitude" value={center ? center.latitude.toFixed(6) : '—'} />
        <Row label="Longitude" value={center ? center.longitude.toFixed(6) : '—'} />
        <Row label="Créée le" value={formatDate(data.creeA)} />
        {data.description ? <Row label="Description" value={data.description} /> : null}
      </Card>

      <Card>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Cultures</Text>
          <Button
            size="sm"
            variant="ghost"
            onPress={() =>
              router.push({
                pathname: '/(app)/(cultures)/ajout-culture',
                params: { parcelleId: data.id },
              })
            }
            leftIcon={<Sprout size={15} color={colors.primary[700]} />}
          >
            Ajouter
          </Button>
        </View>

        {cultures.isLoading ? (
          <Text style={styles.muted}>Chargement…</Text>
        ) : (cultures.data?.items ?? []).length === 0 ? (
          <EmptyState
            icon={Layers}
            title="Aucune culture"
            description="Ajoutez une culture pour suivre le cycle cultural de cette parcelle."
            actionLabel="Ajouter une culture"
            onAction={() =>
              router.push({
                pathname: '/(app)/(cultures)/ajout-culture',
                params: { parcelleId: data.id },
              })
            }
          />
        ) : (
          (cultures.data?.items ?? []).map((culture) => (
            <Card
              key={culture.id}
              variant="muted"
              onPress={() =>
                router.push({
                  pathname: '/(app)/(cultures)/detail-culture',
                  params: { parcelleId: data.id, id: culture.id },
                })
              }
            >
              <View style={styles.cultureRow}>
                <View style={styles.flex}>
                  <Text style={styles.cultureName}>{culture.nom}</Text>
                  <Text style={styles.muted}>
                    {culture.type ?? 'Type non précisé'} · plantée le{' '}
                    {formatDate(culture.datePlantation)}
                  </Text>
                </View>
                <Badge
                  label={libelleStatutCulture(culture.statut)}
                  variant={badgeStatutCulture(culture.statut)}
                />
              </View>
            </Card>
          ))
        )}
      </Card>

      <View style={styles.footerSpacer} />
    </ParcelleFormShell>
  );
}

function centroideDe(points: { latitude: number; longitude: number }[]): {
  latitude: number;
  longitude: number;
} {
  return {
    latitude: points.reduce((total, point) => total + point.latitude, 0) / points.length,
    longitude: points.reduce((total, point) => total + point.longitude, 0) / points.length,
  };
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      {typeof value === 'string' ? (
        <Text style={styles.rowValue} numberOfLines={3}>
          {value}
        </Text>
      ) : (
        value
      )}
    </View>
  );
}

function libelleStatut(statut: string): string {
  switch (statut) {
    case 'ACTIVE':
      return 'Active';
    case 'ABANDONNEE':
      return 'Abandonnée';
    case 'ARCHIVEE':
      return 'Archivée';
    default:
      return 'Supprimée';
  }
}

function badgeStatut(statut: string): 'success' | 'warning' | 'neutral' | 'error' {
  if (statut === 'ACTIVE') return 'success';
  if (statut === 'ABANDONNEE' || statut === 'ARCHIVEE') return 'warning';
  return 'error';
}

function libelleStatutCulture(statut: StatutCulture): string {
  switch (statut) {
    case 'PLANIFIEE':
      return 'Planifiée';
    case 'EN_COURS':
      return 'En cours';
    case 'RECOLTEE':
      return 'Récoltée';
    case 'ABANDONNEE':
      return 'Abandonnée';
    default:
      return 'Supprimée';
  }
}

function badgeStatutCulture(
  statut: StatutCulture,
): 'success' | 'warning' | 'neutral' | 'error' | 'info' {
  switch (statut) {
    case 'EN_COURS':
      return 'info';
    case 'RECOLTEE':
      return 'success';
    case 'ABANDONNEE':
      return 'warning';
    case 'SUPPRIMEE':
      return 'error';
    default:
      return 'neutral';
  }
}
