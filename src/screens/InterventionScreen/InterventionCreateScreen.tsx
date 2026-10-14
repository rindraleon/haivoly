import { useMemo, useState } from 'react';
import { i18n } from '@/i18n/instance';
import { Alert, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { CalendarClock, Sparkles } from 'lucide-react-native';

import { colors } from '@/theme';
import { Badge } from '@/components/CommonComponent/Badge';
import { Button } from '@/components/CommonComponent/Button';
import { Card } from '@/components/CommonComponent/Card';
import { DateInput } from '@/components/CommonComponent/DateInput';
import { Input } from '@/components/CommonComponent/Input';
import { AppSelect } from '@/components/CommonComponent/AppSelect';
import { ParcelleFormShell } from '@/components/ParcelleComponent/ParcelleFormShell';
import { useCreateIntervention, useCulture, useCultures, useParcelles } from '@/hooks';
import { ApiError } from '@/services/http';
import {
  PRODUITS_INTERVENTION,
  TYPES_INTERVENTION,
  UNITES_INTERVENTION,
  statutInterventionPrevu,
} from '@/utils/intervention';
import { dateOnlyVersIso, formatDate, isDateOnly, todayDateOnly } from '@/utils/date';

import { styles } from './InterventionCreateScreen.styles';

import { formatNombre } from '@/utils/formatNombre';

export default function AjoutInterventionScreen() {
  const params = useLocalSearchParams<{
    cultureId?: string;
    parcelleId?: string;
    interventionId?: string;
  }>();

  const [parcelleId, setParcelleId] = useState(params.parcelleId ?? '');
  const [cultureId, setCultureId] = useState(params.cultureId ?? '');
  const [type, setType] = useState<string>('IRRIGATION');
  const [date, setDate] = useState(todayDateOnly());
  const [produit, setProduit] = useState<string>('');
  const [quantite, setQuantite] = useState('');
  const [unite, setUnite] = useState<string>('kg');
  const [cout, setCout] = useState('');
  const [description, setDescription] = useState('');

  const parcelles = useParcelles({ limit: 100 });
  const culture = useCulture(parcelleId || undefined, cultureId || undefined);
  const creation = useCreateIntervention();

  /** Options de parcelles : libellé lisible, valeur = identifiant réel. */
  const optionsParcelles = useMemo(
    () =>
      (parcelles.data?.items ?? []).map((parcelle) => ({
        value: parcelle.id,
        label: parcelle.nom,
        description: parcelle.superficie
          ? `${formatNombre(Math.round(parcelle.superficie))} m²`
          : undefined,
      })),
    [parcelles.data],
  );

  const [apercuStatut, setApercuStatut] = useState<'PLANIFIEE' | 'EN_COURS' | null>(
    () => statutInterventionPrevu(todayDateOnly()),
  );

  const changerDate = (valeur: string) => {
    setDate(valeur);
    setApercuStatut(statutInterventionPrevu(valeur));
  };

  const enregistrer = async () => {
    if (!cultureId) {
      Alert.alert('Culture manquante', i18n.t('observations.selectionCultureSeule'));
      return;
    }

    try {
      await creation.mutateAsync({
        cultureId,
        body: {
          type,
          date: dateOnlyVersIso(date) ?? undefined,
          produit: produit || null,
          quantite: quantite.trim() === '' ? null : Number(quantite.replace(',', '.')),
          unite: unite || null,
          cout: cout.trim() === '' ? null : Number(cout.replace(',', '.')),
          description: description.trim() === '' ? null : description.trim(),
          // ⚠️ aucun `statut` : le serveur le calcule.
        },
      });

      Alert.alert(i18n.t('interventions.enregistree'), i18n.t('interventions.statutCalculeServeur'), [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(
        'Enregistrement impossible',
        error instanceof ApiError ? error.message : i18n.t('domaine.erreurSurvenue'),
      );
    }
  };

  return (
    <ParcelleFormShell
      title={i18n.t('libelles.nouvelleIntervention')}
      subtitle={i18n.t('interventions.typeCultureProduit')}
      onBack={() => router.back()}
      footer={
        <Button onPress={enregistrer} loading={creation.isPending}>
          Enregistrer l’intervention
        </Button>
      }
    >
      <Card style={styles.section}>
        <AppSelect
          label={i18n.t('libelles.parcelle')}
          required
          placeholder={i18n.t('domaine.selectionnerParcelle')}
          value={parcelleId || null}
          options={optionsParcelles}
          onChange={(value) => {
            setParcelleId(value);
            setCultureId('');
          }}
        />

        {/* La culture dépend de la parcelle choisie : on évite les erreurs
            d'identifiant et on n'affiche que des noms lisibles. */}
        <CulturePicker
          parcelleId={parcelleId}
          value={cultureId}
          onChange={setCultureId}
        />

        <AppSelect
          label={i18n.t('libelles.typeIntervention')}
          required
          value={type}
          options={TYPES_INTERVENTION}
          onChange={setType}
        />

        <DateInput
          label="Date"
          required
          value={date}
          onChange={changerDate}
          hint={
            isDateOnly(date)
              ? `Date retenue : ${formatDate(date)} — statut déduit par le serveur`
              : i18n.t('interventions.selectionnerDate')
          }
          leftIcon={<CalendarClock size={16} color={colors.neutral[400]} />}
        />

        {apercuStatut ? (
          <View style={styles.previewRow}>
            <Sparkles size={15} color={colors.primary[700]} />
            <Text style={styles.previewText}>Statut calculé :</Text>
            <Badge
              label={apercuStatut === 'PLANIFIEE' ? i18n.t('statuts.PLANIFIEE') : i18n.t('statuts.EN_COURS')}
              variant={apercuStatut === 'PLANIFIEE' ? 'warning' : 'info'}
            />
          </View>
        ) : null}
      </Card>

      <Card style={styles.section}>
        <AppSelect
          label={i18n.t('interventions.produitUtilise')}
          placeholder={i18n.t('interventions.selectionnerProduit')}
          value={produit || null}
          options={PRODUITS_INTERVENTION}
          onChange={setProduit}
          hint="Facultatif"
        />

        <View style={styles.rowFields}>
          <View style={styles.flex}>
            <Input
              label={i18n.t('domaine.quantite')}
              value={quantite}
              onChangeText={setQuantite}
              placeholder="25"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.flex}>
            <AppSelect
              label={i18n.t('domaine.unite')}
              value={unite}
              options={UNITES_INTERVENTION}
              onChange={setUnite}
            />
          </View>
        </View>

        <Input
          label={i18n.t('interventions.cout')}
          value={cout}
          onChangeText={setCout}
          placeholder="En Ariary (facultatif)"
          keyboardType="decimal-pad"
        />

        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder={i18n.t('interventions.descriptionPlaceholder')}
          multiline
          numberOfLines={3}
        />
      </Card>

      {culture.data && culture.data.statut === 'RECOLTEE' ? (
        <Card variant="muted">
          <Text style={styles.warning}>
            Cette culture est récoltée : aucune intervention supplémentaire n’est
            acceptée par le serveur.
          </Text>
        </Card>
      ) : null}
    </ParcelleFormShell>
  );
}

/** Sélecteur de culture (dépend de la parcelle sélectionnée). */
function CulturePicker({
  parcelleId,
  value,
  onChange,
}: {
  parcelleId: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const parcelles = useParcelles({ limit: 100 });
  const parcelle = (parcelles.data?.items ?? []).find((item) => item.id === parcelleId);

  // Même hook que l'écran de détail : une seule source de vérité par ressource.
  const cultures = useCultures({ parcelleId, limit: 100 });

  const options = (cultures.data?.items ?? [])
    .filter((culture) => culture.statut !== 'RECOLTEE' && culture.statut !== 'SUPPRIMEE')
    .map((culture) => ({
      value: culture.id,
      label: culture.nom,
      description: culture.statut === 'EN_COURS' ? i18n.t('statuts.EN_COURS') : i18n.t('statuts.PLANIFIEE'),
    }));

  return (
    <AppSelect
      label={i18n.t('libelles.culture')}
      required
      placeholder={parcelle ? i18n.t('domaine.selectionnerCulture') : 'Choisissez d’abord une parcelle'}
      value={value || null}
      options={options}
      onChange={onChange}
      disabled={!parcelleId}
      emptyLabel={i18n.t('parcelles.aucuneCultureCoursParcelle')}
    />
  );
}

