/**
 * CultureDetailScreen — implémentation de l’écran.
 *
 * Le fichier de route correspondant (`src/app/(app)/…`) ne fait que
 * réexporter ce composant : toute la logique vit ici.
 */
import React from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Plus, Sprout, Wheat } from 'lucide-react-native';

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

/**
 * Détail d'une culture.
 *
 * Affiche le **cycle de vie** (étape actuelle, précédente, suivante, dates et
 * progression). Le statut provient exclusivement du serveur : aucun calcul de
 * règle métier n'est fait ici.
 */
export default function DetailCultureScreen() {
  const { id, parcelleId } = useLocalSearchParams<{ id: string; parcelleId: string }>();
  const culture = useCulture(parcelleId, id);
  const interventions = useInterventions(id);

  if (culture.isLoading) {
    return <LoadingState message="Chargement de la culture…" />;
  }

  if (culture.isError || !culture.data) {
    return (
      <ErrorState
        title="Culture introuvable"
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
        <Text style={styles.sectionTitle}>Informations culturales</Text>
        <Row label="Statut" value={<BadgeStatut statut={data.statut} />} />
        <Row label="Type" value={data.type ?? 'Non précisé'} />
        <Row label="Variété" value={data.variete ?? 'Non précisée'} />
        <Row label="Stade" value={data.stade ?? 'Non précisé'} />
        <Row label="Plantation" value={formatDate(data.datePlantation)} />
        <Row label="Récolte prévue" value={formatDate(data.datePrevueRecolte)} />
        {data.recolte ? (
          <Row
            label="Récolte réelle"
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
            title="Aucune intervention"
            description="Enregistrez les travaux réalisés sur cette culture (irrigation, traitement…)."
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
    PLANIFIEE: { label: 'Planifiée', variant: 'neutral' },
    EN_COURS: { label: 'En cours', variant: 'info' },
    RECOLTEE: { label: 'Récoltée', variant: 'success' },
    ABANDONNEE: { label: 'Abandonnée', variant: 'warning' },
    SUPPRIMEE: { label: 'Supprimée', variant: 'error' },
  };
  const item = map[statut] ?? { label: statut, variant: 'neutral' as const };
  return <Badge label={item.label} variant={item.variant} />;
}

function libelleStatutIntervention(statut: string): string {
  if (statut === 'PLANIFIEE') return 'Planifiée';
  if (statut === 'TERMINEE') return 'Terminée';
  return 'En cours';
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
    DESHERBAGE: 'Désherbage',
    TRAITEMENT: 'Traitement',
    ENTRETIEN: 'Entretien',
    INSPECTION: 'Inspection',
    AUTRE: 'Autre',
  };
  return map[type] ?? type;
}
