/**
 * InterventionCreateScreen — implémentation de l’écran.
 *
 * Le fichier de route correspondant (`src/app/(app)/…`) ne fait que
 * réexporter ce composant : toute la logique vit ici.
 */
import React, { useMemo, useState } from 'react';
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
/**
 * Formulaire d'intervention.
 *
 * Correctif : tous les champs de sélection utilisent `AppSelect` (liste
 * déroulante en feuille modale). L'utilisateur ne voit **que des libellés
 * lisibles** ; l'application transmet les valeurs techniques (identifiants,
 * codes de type, unités).
 *
 * Le **statut n'est jamais saisi** : il est calculé par le serveur à partir de
 * la date (future → « Planifiée », passée → « En cours »). On l'affiche en
 * aperçu, à titre informatif uniquement.
 */

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

  /**
   * Aperçu local du statut (jamais envoyé à l'API).
   *
   * Il est calculé dans le gestionnaire de saisie — et non pendant le rendu —
   * pour rester une fonction pure au regard de React.
   */
  const [apercuStatut, setApercuStatut] = useState<'PLANIFIEE' | 'EN_COURS' | null>(
    () => statutInterventionPrevu(todayDateOnly()),
  );

  const changerDate = (valeur: string) => {
    setDate(valeur);
    setApercuStatut(statutInterventionPrevu(valeur));
  };

  const enregistrer = async () => {
    if (!cultureId) {
      Alert.alert('Culture manquante', 'Sélectionnez d’abord une culture.');
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

      Alert.alert('Intervention enregistrée', 'Le statut a été calculé par le serveur.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(
        'Enregistrement impossible',
        error instanceof ApiError ? error.message : 'Une erreur est survenue.',
      );
    }
  };

  return (
    <ParcelleFormShell
      title="Nouvelle intervention"
      subtitle="Type, culture, produit et quantité"
      onBack={() => router.back()}
      footer={
        <Button onPress={enregistrer} loading={creation.isPending}>
          Enregistrer l’intervention
        </Button>
      }
    >
      <Card style={styles.section}>
        <AppSelect
          label="Parcelle"
          required
          placeholder="Sélectionner une parcelle"
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
          label="Type d’intervention"
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
              : 'Sélectionnez une date dans le calendrier'
          }
          leftIcon={<CalendarClock size={16} color={colors.neutral[400]} />}
        />

        {apercuStatut ? (
          <View style={styles.previewRow}>
            <Sparkles size={15} color={colors.primary[700]} />
            <Text style={styles.previewText}>Statut calculé :</Text>
            <Badge
              label={apercuStatut === 'PLANIFIEE' ? 'Planifiée' : 'En cours'}
              variant={apercuStatut === 'PLANIFIEE' ? 'warning' : 'info'}
            />
          </View>
        ) : null}
      </Card>

      <Card style={styles.section}>
        <AppSelect
          label="Produit utilisé"
          placeholder="Sélectionner un produit"
          value={produit || null}
          options={PRODUITS_INTERVENTION}
          onChange={setProduit}
          hint="Facultatif"
        />

        <View style={styles.rowFields}>
          <View style={styles.flex}>
            <Input
              label="Quantité"
              value={quantite}
              onChangeText={setQuantite}
              placeholder="25"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.flex}>
            <AppSelect
              label="Unité"
              value={unite}
              options={UNITES_INTERVENTION}
              onChange={setUnite}
            />
          </View>
        </View>

        <Input
          label="Coût"
          value={cout}
          onChangeText={setCout}
          placeholder="En Ariary (facultatif)"
          keyboardType="decimal-pad"
        />

        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Observations, dosage, parcelle concernée…"
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
      description: culture.statut === 'EN_COURS' ? 'En cours' : 'Planifiée',
    }));

  return (
    <AppSelect
      label="Culture"
      required
      placeholder={parcelle ? 'Sélectionner une culture' : 'Choisissez d’abord une parcelle'}
      value={value || null}
      options={options}
      onChange={onChange}
      disabled={!parcelleId}
      emptyLabel="Aucune culture en cours sur cette parcelle"
    />
  );
}

