import React from 'react';
import { i18n } from '@/i18n/instance';
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
import { useCulturesDeParcelle, useParcelle } from '@/hooks';
import { formatSuperficieValue } from '@/utils/parcelle';
import { formatDate } from '@/utils/date';
import type { StatutCulture } from '@/types';


import { styles } from './ParcelleDetailScreen.styles';
export default function DetailParcelleScreen() {
  const params = useLocalSearchParams<{ id?: string; parcelleId?: string }>();
  const id = params.id ?? params.parcelleId;
  const parcelle = useParcelle(id);
  // P0-2 : `GET /cultures?parcelleId` est refusé (400) ; la route imbriquée
  // `/parcelles/:id/cultures` renvoie les cultures, file hors ligne fusionnée.
  const cultures = useCulturesDeParcelle(id);

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
    return <LoadingState message={i18n.t('parcelles.chargementParcelle')} />;
  }

  if (parcelle.isError || !parcelle.data) {
    return (
      <ErrorState
        title={i18n.t('libelles.parcelleIntrouvable')}
        message={i18n.t('parcelles.parcelleNExistePas')}
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
      subtitle={superficie ? `Superficie ${superficie}` : i18n.t('parcelles.superficieNonCalculee')}
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
        <Text style={styles.sectionTitle}>{i18n.t('libelles.informations')}</Text>
        <Row label="Statut" value={<Badge label={libelleStatut(data.statut)} variant={badgeStatut(data.statut)} />} />
        <Row label="Type de sol" value={data.typeSol ?? i18n.t('domaine.nonRenseigne')} />
        <Row label="Latitude" value={center ? center.latitude.toFixed(6) : '—'} />
        <Row label="Longitude" value={center ? center.longitude.toFixed(6) : '—'} />
        <Row label={i18n.t('parcelles.creeeLe')} value={formatDate(data.creeA)} />
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
        ) : (cultures.data ?? []).length === 0 ? (
          <EmptyState
            icon={Layers}
            title={i18n.t('libelles.aucuneCulture')}
            description={i18n.t('parcelles.ajoutezCultureSuivreCycle')}
            actionLabel={i18n.t('cultures.ajouterCulture')}
            onAction={() =>
              router.push({
                pathname: '/(app)/(cultures)/ajout-culture',
                params: { parcelleId: data.id },
              })
            }
          />
        ) : (
          (cultures.data ?? []).map((culture) => (
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
                    {culture.type ?? i18n.t('parcelles.typeNonPrecise')} · plantée le{' '}
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
      return i18n.t('statuts.ACTIVE');
    case 'ABANDONNEE':
      return i18n.t('statuts.ABANDONNEE');
    case 'ARCHIVEE':
      return i18n.t('statuts.ARCHIVEE');
    default:
      return i18n.t('statuts.SUPPRIMEE');
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
      return i18n.t('statuts.PLANIFIEE');
    case 'EN_COURS':
      return i18n.t('statuts.EN_COURS');
    case 'RECOLTEE':
      return i18n.t('statuts.RECOLTEE');
    case 'ABANDONNEE':
      return i18n.t('statuts.ABANDONNEE');
    default:
      return i18n.t('statuts.SUPPRIMEE');
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
