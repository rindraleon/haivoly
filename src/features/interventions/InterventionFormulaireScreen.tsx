import { useLocalSearchParams, router } from 'expo-router';
import { Wrench } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { ChoixCultureSheet } from '@/features/commun/ChoixCultureSheet';
import {
  nombreSaisi,
  validerIntervention,
  type ChampsIntervention,
} from '@/features/interventions/regles';
import {
  useCreateIntervention,
  useCulturesDuCompte,
  useIntervention,
  useUpdateIntervention,
} from '@/hooks';
import type { Intervention } from '@/types';
import { AlertCard, ChoiceChips, DateField, FormInput, PrimaryButton, Skeleton, Text, useToast } from '@/ui';
import { FormScreen } from '@/ui/layout';
import { TYPES_INTERVENTION, UNITES_INTERVENTION } from '@/utils/intervention';

const STATUTS_LECTURE_SEULE = ['RECOLTEE', 'ABANDONNEE', 'SUPPRIMEE'];
const VALEURS_TYPES = TYPES_INTERVENTION.map((option) => option.value);
const VALEURS_UNITES = UNITES_INTERVENTION.map((option) => option.value);

function aujourdhui(): string {
  return new Date().toISOString().slice(0, 10);
}

/** L'API attend un instant ISO-8601 : midi UTC garde le jour civil saisi. */
function versInstantIso(dateOnly: string): string {
  return `${dateOnly}T12:00:00.000Z`;
}

interface ValeursInitiales {
  type: string | null;
  date: string;
  produit: string;
  quantite: string;
  unite: string | null;
  cout: string;
  description: string;
  cultureId?: string;
}

/**
 * Formulaire d'intervention V2 (lot 4) : création et modification, mêmes
 * champs que le V1 (type, date, produit, quantité, unité, coût, description),
 * contrat clavier complet et culture rattachée par paramètre ou feuille.
 */
function Formulaire({
  idIntervention,
  initial,
}: {
  idIntervention?: string;
  initial: ValeursInitiales;
}) {
  const { t } = useTranslation();
  const toast = useToast();
  const edition = Boolean(idIntervention);

  const [cultureId, setCultureId] = useState<string | undefined>(initial.cultureId);
  const [choixVisible, setChoixVisible] = useState(!initial.cultureId);
  const [type, setType] = useState<string | null>(initial.type);
  const [date, setDate] = useState(initial.date);
  const [produit, setProduit] = useState(initial.produit);
  const [quantite, setQuantite] = useState(initial.quantite);
  const [unite, setUnite] = useState<string | null>(initial.unite);
  const [cout, setCout] = useState(initial.cout);
  const [description, setDescription] = useState(initial.description);
  const [erreurs, setErreurs] = useState<Record<string, string | undefined>>({});

  const cultures = useCulturesDuCompte();
  const culture = useMemo(
    () => cultures.data?.items.find((item) => item.id === cultureId),
    [cultures.data, cultureId],
  );
  const lectureSeule = Boolean(culture && STATUTS_LECTURE_SEULE.includes(culture.statut));

  const creation = useCreateIntervention();
  const modification = useUpdateIntervention();

  const optionsTypes = useMemo(
    () => VALEURS_TYPES.map((value) => ({ value, label: t(`ecranCultures.typesIntervention.${value}`) })),
    [t],
  );
  const optionsUnites = useMemo(
    () => VALEURS_UNITES.map((value) => ({ value, label: t(`ecranInterventions.unites.${value}`) })),
    [t],
  );

  const enregistrer = useCallback(async () => {
    if (!cultureId) {
      setChoixVisible(true);
      return;
    }
    const champs: ChampsIntervention = { type, date, produit, quantite, unite, cout, description };
    const codes = validerIntervention(champs, VALEURS_TYPES);
    if (Object.keys(codes).length > 0) {
      setErreurs(
        Object.fromEntries(
          Object.entries(codes).map(([champ, code]) => [champ, t(`ecranInterventions.erreurs.${code}`)]),
        ),
      );
      return;
    }
    setErreurs({});
    const body = {
      type: type as string,
      date: versInstantIso(date),
      produit: produit.trim() || null,
      quantite: nombreSaisi(quantite),
      unite,
      cout: nombreSaisi(cout),
      description: description.trim() || null,
    };
    try {
      if (edition && idIntervention) {
        await modification.mutateAsync({ id: idIntervention, cultureId, body });
      } else {
        await creation.mutateAsync({ cultureId, body });
      }
      toast({ message: t(edition ? 'ecranInterventions.modifiee' : 'ecranInterventions.enregistree'), tone: 'success' });
      if (router.canGoBack()) router.back();
      else router.replace('/cultures');
    } catch {
      toast({ message: t('ecranInterventions.erreurEnvoi'), tone: 'error' });
    }
  }, [cultureId, type, date, produit, quantite, unite, cout, description, edition, idIntervention, creation, modification, toast, t]);

  return (
    <FormScreen
      testID="ecran-intervention-v2"
      title={t(edition ? 'ecranInterventions.titreModification' : 'ecranInterventions.titre')}
      subtitle={culture?.nom ?? t('ecranInterventions.sansCulture')}
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/cultures'))}
      backLabel={t('commun.actions.retour')}
      footer={
        <PrimaryButton
          testID="intervention-enregistrer"
          label={t(edition ? 'ecranInterventions.enregistrerModifications' : 'ecranInterventions.enregistrer')}
          onPress={() => void enregistrer()}
          loading={creation.isPending || modification.isPending}
          disabled={lectureSeule}
        />
      }
    >
      <View style={styles.corps}>
        {lectureSeule ? (
          <AlertCard tone="warning" title={t('ecranInterventions.lectureSeule')} testID="intervention-lecture-seule" />
        ) : null}
        {!cultureId ? (
          <PrimaryButton
            variant="secondary"
            testID="intervention-choisir-culture"
            label={t('ecranInterventions.choisirCulture')}
            onPress={() => setChoixVisible(true)}
          />
        ) : null}
        <ChoiceChips
          testID="intervention-type"
          label={t('ecranInterventions.type')}
          required
          options={optionsTypes}
          value={type}
          onChange={setType}
          error={erreurs.type}
        />
        <DateField
          testID="intervention-date"
          label={t('ecranInterventions.date')}
          required
          value={date}
          onChange={setDate}
          placeholder={t('ecranInterventions.dateExemple')}
          doneLabel={t('commun.actions.valider')}
          changeHint={t('commun.actions.modifier')}
          maximumDate={new Date()}
          locale="fr-FR"
          error={erreurs.date}
        />
        <FormInput
          testID="intervention-produit"
          label={t('ecranInterventions.produit')}
          placeholder={t('ecranInterventions.produitExemple')}
          value={produit}
          onChangeText={setProduit}
          error={erreurs.produit}
          disabled={lectureSeule}
        />
        <View style={styles.ligne}>
          <View style={styles.moitie}>
            <FormInput
              testID="intervention-quantite"
              label={t('ecranInterventions.quantite')}
              keyboardType="decimal-pad"
              placeholder="0"
              suffix={unite ?? undefined}
              value={quantite}
              onChangeText={setQuantite}
              error={erreurs.quantite}
              disabled={lectureSeule}
            />
          </View>
          <View style={styles.moitie}>
            <FormInput
              testID="intervention-cout"
              label={t('ecranInterventions.cout')}
              keyboardType="decimal-pad"
              placeholder="0"
              suffix="Ar"
              value={cout}
              onChangeText={setCout}
              error={erreurs.cout}
              disabled={lectureSeule}
            />
          </View>
        </View>
        <ChoiceChips
          testID="intervention-unite"
          label={t('ecranInterventions.unite')}
          options={optionsUnites}
          value={unite}
          onChange={setUnite}
        />
        <FormInput
          testID="intervention-description"
          label={t('ecranInterventions.description')}
          multiline
          maxLength={500}
          placeholder={t('ecranInterventions.descriptionExemple')}
          value={description}
          onChangeText={setDescription}
          error={erreurs.description}
          disabled={lectureSeule}
        />
        <View style={styles.aide}>
          <Wrench size={16} color="#5F6F66" />
          <Text variant="caption">{t('ecranInterventions.aide')}</Text>
        </View>
      </View>
      <ChoixCultureSheet
        visible={choixVisible}
        onFermer={() => setChoixVisible(false)}
        onChoisir={(choisie) => setCultureId(choisie.id)}
      />
    </FormScreen>
  );
}

/** Enveloppe : lit les paramètres et pré-remplit l'édition depuis le cache. */
export function InterventionFormulaireScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ cultureId?: string; id?: string; interventionId?: string }>();
  // L'édition V1 et le cockpit V2 passent `interventionId` (paramètre historique).
  const idIntervention = params.id ?? params.interventionId;
  const edition = Boolean(idIntervention);
  const intervention = useIntervention(idIntervention);

  if (edition && (intervention.isLoading || intervention.isPending)) {
    return (
      <FormScreen
        testID="ecran-intervention-v2"
        title={t('ecranInterventions.titreModification')}
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/cultures'))}
        backLabel={t('commun.actions.retour')}
        footer={<PrimaryButton label={t('ecranInterventions.enregistrerModifications')} loading />}
      >
        <Skeleton height={96} radius={16} />
      </FormScreen>
    );
  }

  const donnees: Intervention | undefined = intervention.data;
  return (
    <Formulaire
      key={idIntervention ?? 'nouvelle'}
      idIntervention={idIntervention}
      initial={{
        type: donnees?.type ?? 'IRRIGATION',
        date: donnees ? donnees.date.slice(0, 10) : aujourdhui(),
        produit: donnees?.produit ?? '',
        quantite: donnees?.quantite == null ? '' : String(donnees.quantite),
        unite: donnees?.unite ?? 'kg',
        cout: donnees?.cout == null ? '' : String(donnees.cout),
        description: donnees?.description ?? '',
        cultureId: params.cultureId ?? donnees?.cultureId,
      }}
    />
  );
}

const styles = StyleSheet.create({
  corps: { gap: 16, paddingVertical: 8 },
  ligne: { flexDirection: 'row', gap: 12 },
  moitie: { flex: 1 },
  aide: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
