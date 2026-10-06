/**
 * Cycle de vie d'une culture.
 *
 * Le statut est une **règle métier du serveur** : le mobile ne fait que
 * l'afficher. Le composant met en évidence l'étape courante, l'étape
 * précédente, l'étape suivante, les dates du cycle et la progression.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CalendarDays, Check, Clock3, Leaf, Sprout, Wheat, XCircle } from 'lucide-react-native';

import { colors, radius } from '@/theme';
import { formatDate } from '@/utils/date';
import type { Culture, StatutCulture } from '@/types';

const ETAPES: { statut: StatutCulture; label: string }[] = [
  { statut: 'PLANIFIEE', label: 'Planifiée' },
  { statut: 'EN_COURS', label: 'En cours' },
  { statut: 'RECOLTEE', label: 'Récoltée' },
];

function icone(statut: StatutCulture) {
  const couleur = colors.neutral[0];
  if (statut === 'PLANIFIEE') return <CalendarDays size={14} color={couleur} />;
  if (statut === 'EN_COURS') return <Sprout size={14} color={couleur} />;
  return <Wheat size={14} color={couleur} />;
}

/** Index de l'étape courante dans le cycle nominal, ou -1 si hors cycle. */
function indexEtape(statut: StatutCulture): number {
  return ETAPES.findIndex((etape) => etape.statut === statut);
}

export interface LifecycleTimelineProps {
  culture: Culture;
}

export function LifecycleTimeline({ culture }: LifecycleTimelineProps) {
  const statut = culture.statut;
  const courante = indexEtape(statut);
  const horsCycle = courante === -1 && (statut === 'ABANDONNEE' || statut === 'SUPPRIMEE');

  // Progression exprimée en pourcentage du cycle nominal (3 étapes).
  const progression = horsCycle
    ? 100
    : Math.round((Math.max(courante, 0) / (ETAPES.length - 1)) * 100);

  const precedente = courante > 0 ? ETAPES[courante - 1] : null;
  const suivante = courante >= 0 && courante < ETAPES.length - 1 ? ETAPES[courante + 1] : null;

  const datePrecedente =
    courante === 1
      ? culture.datePlantation
      : courante === 2
        ? culture.recolte?.dateRecolte ?? culture.datePrevueRecolte
        : null;
  const dateSuivante = courante <= 1 ? culture.datePrevueRecolte : null;

  return (
    <View>
      <View style={styles.headerRow}>
        <Leaf size={16} color={colors.primary[700]} />
        <Text style={styles.titre}>Cycle de vie</Text>
      </View>

      {horsCycle ? (
        <View style={styles.horsCycle}>
          <XCircle size={16} color={colors.neutral[600]} />
          <Text style={styles.horsCycleTexte}>
            {statut === 'ABANDONNEE'
              ? 'Culture abandonnée — le cycle est interrompu.'
              : 'Culture supprimée — historique conservé.'}
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.etapes}>
            {ETAPES.map((etape, index) => {
              const atteinte = courante >= index;
              const active = courante === index;
              return (
                <React.Fragment key={etape.statut}>
                  {index > 0 ? (
                    <View style={[styles.liaison, courante >= index && styles.liaisonActive]} />
                  ) : null}
                  <View style={styles.etape}>
                    <View
                      style={[
                        styles.pastille,
                        atteinte && styles.pastilleAtteinte,
                        active && styles.pastilleActive,
                      ]}
                    >
                      {atteinte ? (
                        icone(etape.statut)
                      ) : (
                        <Clock3 size={14} color={colors.neutral[400]} />
                      )}
                    </View>
                    <Text style={[styles.etapeLabel, atteinte && styles.etapeLabelAtteinte]}>
                      {etape.label}
                    </Text>
                  </View>
                </React.Fragment>
              );
            })}
          </View>

          <View style={styles.barre}>
            <View style={[styles.barreRemplie, { width: `${progression}%` }]} />
          </View>
          <Text style={styles.progression}>{progression} % du cycle</Text>
        </>
      )}

      <View style={styles.details}>
        {precedente ? (
          <View style={styles.detailLigne}>
            <Check size={14} color={colors.primary[700]} />
            <Text style={styles.detailTexte}>
              Étape précédente : {precedente.label}
              {datePrecedente ? ` · ${formatDate(datePrecedente)}` : ''}
            </Text>
          </View>
        ) : null}

        <View style={styles.detailLigne}>
          <Sprout size={14} color={colors.neutral[700]} />
          <Text style={styles.detailTexte}>
            Étape actuelle :{' '}
            {horsCycle
              ? statut === 'ABANDONNEE'
                ? 'Abandonnée'
                : 'Supprimée'
              : ETAPES[courante].label}
          </Text>
        </View>

        {suivante ? (
          <View style={styles.detailLigne}>
            <CalendarDays size={14} color={colors.neutral[600]} />
            <Text style={styles.detailTexte}>
              Étape suivante : {suivante.label}
              {dateSuivante ? ` · prévue le ${formatDate(dateSuivante)}` : ''}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  titre: { fontSize: 15, fontWeight: '700', color: colors.neutral[900] },
  etapes: { flexDirection: 'row', alignItems: 'center' },
  etape: { alignItems: 'center', width: 78, gap: 6 },
  pastille: {
    width: 30,
    height: 30,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  pastilleAtteinte: { backgroundColor: colors.primary[500], borderColor: colors.primary[500] },
  pastilleActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[700],
    borderWidth: 2,
  },
  liaison: { flex: 1, height: 3, backgroundColor: colors.neutral[200], marginBottom: 22 },
  liaisonActive: { backgroundColor: colors.primary[400] },
  etapeLabel: { fontSize: 11.5, color: colors.neutral[500], textAlign: 'center' },
  etapeLabelAtteinte: { color: colors.primary[700], fontWeight: '600' },
  barre: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[150],
    overflow: 'hidden',
    marginTop: 12,
  },
  barreRemplie: { height: 6, borderRadius: radius.full, backgroundColor: colors.primary[500] },
  progression: { fontSize: 11.5, color: colors.neutral[600], marginTop: 6 },
  details: { marginTop: 14, gap: 8 },
  detailLigne: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailTexte: { flex: 1, fontSize: 12.5, color: colors.neutral[700] },
  horsCycle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[100],
  },
  horsCycleTexte: { flex: 1, fontSize: 12.5, color: colors.neutral[700] },
});
