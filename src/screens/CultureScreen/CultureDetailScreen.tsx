import React from 'react';
import { i18n } from '@/i18n/instance';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Pencil, Plus, Sprout, Wheat } from 'lucide-react-native';

import { colors } from '@/theme';
import { Badge } from '@/components/CommonComponent/Badge';
import { Button } from '@/components/CommonComponent/Button';
import { Card } from '@/components/CommonComponent/Card';
import { EmptyState } from '@/components/CommonComponent/EmptyState';
import { ErrorState } from '@/components/CommonComponent/ErrorState';
import { LoadingState } from '@/components/CommonComponent/LoadingState';
import { LifecycleTimeline } from '@/components/CultureComponent/LifecycleTimeline';
import { ParcelleFormShell } from '@/components/ParcelleComponent/ParcelleFormShell';
import { useCulture, useInterventions } from '@/hooks';
import { formatDate } from '@/utils/date';

import { styles } from './CultureDetailScreen.styles';

export default function DetailCultureScreen() {
  const {
    id,
    cultureId,
    parcelleId,
  } = useLocalSearchParams<{
    id?: string;
    cultureId?: string;
    parcelleId: string;
  }>();
  const idCulture = id ?? cultureId;
  const culture = useCulture(parcelleId, idCulture);
  const interventions = useInterventions(idCulture);

  if (culture.isLoading) {
    return <LoadingState message={i18n.t('cultures.chargementCulture')} />;
  }

  if (culture.isError || !culture.data) {
    return (
      <ErrorState
        title={i18n.t('libelles.cultureIntrouvable')}
        onRetry={() => culture.refetch()}
        onBack={() => router.back()}
      />
    );
  }

  const data = culture.data;
  const peutEtreRecoltee = data.statut === 'EN_COURS' && !data.recolte;

  return (
    <ParcelleFormShell
      title={data.nom}
      subtitle={data.parcelle?.nom ? `Parcelle : ${data.parcelle.nom}` : undefined}
      onBack={() => router.back()}
      headerRight={
        /* Action « Modifier » explicite, avec icône Lucide : l'écran
           d'édition s'ouvre pré-rempli à partir de la culture chargée. */
        <Button
          size="sm"
          variant="ghost"
          onPress={() =>
            router.push({
              pathname: '/(app)/(cultures)/modifier-culture',
              params: {
                parcelleId: data.parcelleId,
                cultureId: data.id,
                parcelleNom: data.parcelle?.nom ?? '',
              },
            })
          }
          leftIcon={<Pencil size={15} color={colors.primary[700]} />}
        >
          Modifier
        </Button>
      }
      footer={
        peutEtreRecoltee ? (
          <Button
            onPress={() =>
              router.push({
                pathname: '/(app)/(recoltes)/ajout-recolte',
                params: { cultureId: data.id, parcelleId: data.parcelleId },
              })
            }
            leftIcon={<Wheat size={16} color={colors.neutral[0]} />}
          >
            Enregistrer la récolte
          </Button>
        ) : (
          <Button
            variant="outline"
            onPress={() =>
              router.push({
                pathname: '/(app)/(interventions)/ajout-intervention',
                params: { cultureId: data.id, parcelleId: data.parcelleId },
              })
            }
            leftIcon={<Plus size={16} color={colors.neutral[800]} />}
          >
            Nouvelle intervention
          </Button>
        )
      }
    >
      <Card>
        <LifecycleTimeline culture={data} />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>{i18n.t('libelles.informationsCulturales')}</Text>
        <Row label="Statut" value={<BadgeStatut statut={data.statut} />} />
        <Row label="Type" value={data.type ?? i18n.t('domaine.nonPrecise')} />
        <Row label={i18n.t('domaine.variete')} value={data.variete ?? i18n.t('cultures.nonPrecisee')} />
        <Row label="Stade" value={data.stade ?? i18n.t('domaine.nonPrecise')} />
        <Row label="Plantation" value={formatDate(data.datePlantation)} />
        <Row label={i18n.t('domaine.recoltePrevue')} value={formatDate(data.datePrevueRecolte)} />
        {data.recolte ? (
          <Row
            label={i18n.t('cultures.recolteReelle')}
            value={`${formatDate(data.recolte.dateRecolte)} · ${data.recolte.quantite} ${data.recolte.unite}`}
          />
        ) : null}
        {data.description ? <Row label="Description" value={data.description} /> : null}
      </Card>

      <Card>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Interventions</Text>
          <Button
            size="sm"
            variant="ghost"
            onPress={() =>
              router.push({
                pathname: '/(app)/(interventions)/ajout-intervention',
                params: { cultureId: data.id, parcelleId: data.parcelleId },
              })
            }
            leftIcon={<Plus size={15} color={colors.primary[700]} />}
          >
            Ajouter
          </Button>
        </View>

        {interventions.isLoading ? (
          <Text style={styles.muted}>Chargement…</Text>
        ) : (interventions.data ?? []).length === 0 ? (
          <EmptyState
            icon={Sprout}
            title={i18n.t('libelles.aucuneIntervention')}
            description={i18n.t('cultures.travauxHint')}
          />
        ) : (
          (interventions.data ?? []).map((intervention) => (
            <View key={intervention.id} style={styles.interventionRow}>
              <View style={styles.flex}>
                <Text style={styles.interventionType}>
                  {libelleType(intervention.type)}
                </Text>
                <Text style={styles.muted}>
                  {formatDate(intervention.date)} · {intervention.produit ?? 'Sans produit'}
                  {intervention.quantite != null
                    ? ` · ${intervention.quantite} ${intervention.unite ?? ''}`
                    : ''}
                </Text>
              </View>
              {/* Statut calculé par le serveur, simplement affiché */}
              <Badge
                label={libelleStatutIntervention(intervention.statut)}
                variant={badgeStatutIntervention(intervention.statut)}
              />
            </View>
          ))
        )}
      </Card>
    </ParcelleFormShell>
  );
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

function BadgeStatut({ statut }: { statut: string }) {
  const map: Record<string, { label: string; variant: 'success' | 'info' | 'warning' | 'error' | 'neutral' }> = {
    PLANIFIEE: { label: i18n.t('statuts.PLANIFIEE'), variant: 'neutral' },
    EN_COURS: { label: i18n.t('statuts.EN_COURS'), variant: 'info' },
    RECOLTEE: { label: i18n.t('statuts.RECOLTEE'), variant: 'success' },
    ABANDONNEE: { label: i18n.t('statuts.ABANDONNEE'), variant: 'warning' },
    SUPPRIMEE: { label: i18n.t('statuts.SUPPRIMEE'), variant: 'error' },
  };
  const item = map[statut] ?? { label: statut, variant: 'neutral' as const };
  return <Badge label={item.label} variant={item.variant} />;
}

function libelleStatutIntervention(statut: string): string {
  if (statut === 'PLANIFIEE') return i18n.t('statuts.PLANIFIEE');
  if (statut === 'TERMINEE') return i18n.t('cultures.terminee');
  return i18n.t('statuts.EN_COURS');
}

function badgeStatutIntervention(
  statut: string,
): 'info' | 'success' | 'warning' | 'neutral' {
  if (statut === 'PLANIFIEE') return 'warning';
  if (statut === 'TERMINEE') return 'success';
  return 'info';
}

/** Libellés lisibles : jamais d'identifiant technique affiché. */
export function libelleType(type: string): string {
  const map: Record<string, string> = {
    PLANTATION: 'Plantation',
    IRRIGATION: 'Irrigation',
    FERTILISATION: 'Fertilisation',
    DESHERBAGE: i18n.t('cultures.desherbage'),
    TRAITEMENT: 'Traitement',
    ENTRETIEN: 'Entretien',
    INSPECTION: 'Inspection',
    AUTRE: 'Autre',
  };
  return map[type] ?? type;
}
