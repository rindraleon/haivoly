import { useLocalSearchParams, router } from 'expo-router';
import { MapPinned } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { validerParcelle, VALEURS_TYPES_SOL } from '@/features/parcelles/regles';
import { useCreateParcelle, useParcelle, useUpdateParcelle } from '@/hooks';
import type { Parcelle } from '@/types';
import { ChoiceChips, ConfirmSheet, FormInput, PrimaryButton, Skeleton, Text, useToast } from '@/ui';
import { FormScreen } from '@/ui/layout';

/** Puce « Non précisé » : le type de sol reste facultatif (comme en V1). */
const AUCUN_TYPE = 'AUCUN';

interface ValeursInitiales {
  nom: string;
  typeSol: string;
}

/**
 * Formulaire de parcelle V2 (lot 4) : création et modification (nom, type de
 * sol), contrat clavier complet, et proposition de délimitation GPS juste
 * après la création — comme l'assistant V1, en deux taps au lieu de quatre.
 */
function Formulaire({ idParcelle, initial }: { idParcelle?: string; initial: ValeursInitiales }) {
  const { t } = useTranslation();
  const toast = useToast();
  const edition = Boolean(idParcelle);

  const [nom, setNom] = useState(initial.nom);
  const [typeSol, setTypeSol] = useState<string>(initial.typeSol);
  const [erreurNom, setErreurNom] = useState<string | undefined>();
  const [delimiterVisible, setDelimiterVisible] = useState(false);
  const [parcelleCreee, setParcelleCreee] = useState<string | null>(null);

  const creation = useCreateParcelle();
  const modification = useUpdateParcelle();

  const enregistrer = useCallback(async () => {
    const codes = validerParcelle({ nom, typeSol: typeSol === AUCUN_TYPE ? null : typeSol });
    if (codes.nom) {
      setErreurNom(t(`ecranParcelleFormulaire.erreurs.${codes.nom}`));
      return;
    }
    setErreurNom(undefined);
    const body = { nom: nom.trim(), typeSol: typeSol === AUCUN_TYPE ? null : typeSol };
    try {
      if (edition && idParcelle) {
        await modification.mutateAsync({ id: idParcelle, body });
        toast({ message: t('ecranParcelleFormulaire.modifiee'), tone: 'success' });
        if (router.canGoBack()) router.back();
        else router.replace('/parcelles');
      } else {
        const creee = await creation.mutateAsync(body);
        setParcelleCreee(creee.id);
        setDelimiterVisible(true);
      }
    } catch {
      toast({ message: t('ecranParcelleFormulaire.erreurEnvoi'), tone: 'error' });
    }
  }, [nom, typeSol, edition, idParcelle, creation, modification, toast, t]);

  return (
    <FormScreen
      testID="ecran-parcelle-formulaire-v2"
      title={t(edition ? 'ecranParcelleFormulaire.titreModification' : 'ecranParcelleFormulaire.titre')}
      subtitle={t('ecranParcelleFormulaire.sousTitre')}
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/parcelles'))}
      backLabel={t('commun.actions.retour')}
      footer={
        <PrimaryButton
          testID="parcelle-enregistrer"
          label={t(edition ? 'ecranParcelleFormulaire.enregistrerModifications' : 'ecranParcelleFormulaire.enregistrer')}
          onPress={() => void enregistrer()}
          loading={creation.isPending || modification.isPending}
        />
      }
    >
      <View style={styles.corps}>
        <FormInput
          testID="parcelle-nom"
          label={t('ecranParcelleFormulaire.nom')}
          required
          maxLength={60}
          placeholder={t('ecranParcelleFormulaire.nomExemple')}
          helper={t('ecranParcelleFormulaire.nomAide')}
          value={nom}
          onChangeText={setNom}
          error={erreurNom}
        />
        <ChoiceChips
          testID="parcelle-type-sol"
          label={t('ecranParcelleFormulaire.typeSol')}
          options={[
            { value: AUCUN_TYPE, label: t('ecranParcelleFormulaire.types.AUCUN') },
            ...VALEURS_TYPES_SOL.map((value) => ({ value, label: t(`ecranParcelleFormulaire.types.${value}`) })),
          ]}
          value={typeSol}
          onChange={setTypeSol}
        />
        <View style={styles.aide}>
          <MapPinned size={16} color="#5F6F66" />
          <Text variant="caption">{t('ecranParcelleFormulaire.aide')}</Text>
        </View>
      </View>
      <ConfirmSheet
        visible={delimiterVisible}
        title={t('ecranParcelleFormulaire.delimiterTitre')}
        message={t('ecranParcelleFormulaire.delimiterMessage')}
        confirmLabel={t('ecranParcelleFormulaire.delimiterOui')}
        cancelLabel={t('ecranParcelleFormulaire.delimiterNon')}
        closeLabel={t('commun.actions.fermer')}
        onConfirm={() => {
          setDelimiterVisible(false);
          router.push({ pathname: '/delimiter-parcelle', params: { id: parcelleCreee ?? '' } });
        }}
        onCancel={() => {
          setDelimiterVisible(false);
          toast({ message: t('ecranParcelleFormulaire.enregistree'), tone: 'success' });
          if (router.canGoBack()) router.back();
          else router.replace('/parcelles');
        }}
      />
    </FormScreen>
  );
}

/** Enveloppe : lit les paramètres et pré-remplit l'édition depuis le cache. */
export function ParcelleFormulaireScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string }>();
  const edition = Boolean(params.id);
  const parcelle = useParcelle(params.id);

  if (edition && (parcelle.isLoading || parcelle.isPending)) {
    return (
      <FormScreen
        testID="ecran-parcelle-formulaire-v2"
        title={t('ecranParcelleFormulaire.titreModification')}
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/parcelles'))}
        backLabel={t('commun.actions.retour')}
        footer={<PrimaryButton label={t('ecranParcelleFormulaire.enregistrerModifications')} loading />}
      >
        <Skeleton height={96} radius={16} />
      </FormScreen>
    );
  }

  const donnees: Parcelle | undefined = parcelle.data;
  return (
    <Formulaire
      key={params.id ?? 'nouvelle'}
      idParcelle={params.id}
      initial={{
        nom: donnees?.nom ?? '',
        typeSol: donnees?.typeSol ?? AUCUN_TYPE,
      }}
    />
  );
}

const styles = StyleSheet.create({
  corps: { gap: 16, paddingVertical: 8 },
  aide: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
