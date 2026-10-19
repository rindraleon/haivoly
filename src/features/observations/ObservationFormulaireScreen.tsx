import { useLocalSearchParams, router } from 'expo-router';
import { ClipboardList } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { ChoixCultureSheet } from '@/features/commun/ChoixCultureSheet';
import { validerObservation } from '@/features/observations/regles';
import { observationPhotosApi } from '@/services';
import {
  PhotosSelection,
  type PhotoBrouillon,
} from '@/components/CommonComponent/PhotosSelection';
import { PhotosObservation } from '@/components/ObservationComponent/PhotosObservation';
import { envoyerPhotosEnAttente } from '@/utils/envoiPhotos';
import {
  useCreateObservation,
  useCulturesDuCompte,
  useObservation,
  useUpdateObservation,
} from '@/hooks';
import type { Observation } from '@/types';
import { AlertCard, DateField, FormInput, PrimaryButton, Skeleton, Text, useToast } from '@/ui';
import { FormScreen } from '@/ui/layout';

const STATUTS_LECTURE_SEULE = ['RECOLTEE', 'ABANDONNEE', 'SUPPRIMEE'];
const DESCRIPTION_MAX = 500;

function aujourdhui(): string {
  return new Date().toISOString().slice(0, 10);
}

/** L'API attend un instant ISO-8601 : midi UTC garde le jour civil saisi. */
function versInstantIso(dateOnly: string): string {
  return `${dateOnly}T12:00:00.000Z`;
}

interface ValeursInitiales {
  description: string;
  date: string;
  cultureId?: string;
}

/**
 * Formulaire d'observation V2 (lot 4) : création et modification dans un
 * même écran, contrat clavier complet (`FormScreen`), culture rattachée par
 * paramètre ou par feuille de choix, lecture seule si cycle terminé.
 * L'état initial vient des props (composant interne keyé) : aucune
 * synchronisation props → état, conforme au compilateur React.
 */
function Formulaire({
  idObservation,
  initial,
}: {
  idObservation?: string;
  initial: ValeursInitiales;
}) {
  const { t } = useTranslation();
  const toast = useToast();
  const edition = Boolean(idObservation);

  const [cultureId, setCultureId] = useState<string | undefined>(initial.cultureId);
  const [choixVisible, setChoixVisible] = useState(!initial.cultureId);
  const [description, setDescription] = useState(initial.description);
  const [date, setDate] = useState(initial.date);
  const [erreurDescription, setErreurDescription] = useState<string | undefined>();
  const [erreurDate, setErreurDate] = useState<string | undefined>();
  // Photos jointes à la création (envoyées après enregistrement côté serveur).
  const [photosBrouillon, setPhotosBrouillon] = useState<PhotoBrouillon[]>([]);
  const [envoiPhotos, setEnvoiPhotos] = useState(false);

  const cultures = useCulturesDuCompte();
  const culture = useMemo(
    () => cultures.data?.items.find((item) => item.id === cultureId),
    [cultures.data, cultureId],
  );
  const lectureSeule = Boolean(culture && STATUTS_LECTURE_SEULE.includes(culture.statut));

  const creation = useCreateObservation();
  const modification = useUpdateObservation();

  const enregistrer = useCallback(async () => {
    if (!cultureId) {
      setChoixVisible(true);
      return;
    }
    const codes = validerObservation({ description, date });
    if (codes.description || codes.date) {
      setErreurDescription(codes.description ? t(`ecranObservations.erreurs.${codes.description}`) : undefined);
      setErreurDate(codes.date ? t(`ecranObservations.erreurs.${codes.date}`) : undefined);
      return;
    }
    setErreurDescription(undefined);
    setErreurDate(undefined);
    const body = { description: description.trim(), date: versInstantIso(date) };
    try {
      if (edition && idObservation) {
        await modification.mutateAsync({ id: idObservation, cultureId, body });
      } else {
        const creee = await creation.mutateAsync({ cultureId, body });
        // Photos mises en attente : téléversées dès que l'observation existe.
        if (photosBrouillon.length > 0 && creee?.id && !creee._localOnly && culture?.parcelleId) {
          setEnvoiPhotos(true);
          try {
            const bilan = await envoyerPhotosEnAttente(photosBrouillon, (fichier) =>
              observationPhotosApi.upload(culture.parcelleId, cultureId, creee.id, fichier),
            );
            if (bilan.echouees > 0) {
              toast({
                message: t('photos.photosJointesPartiel', {
                  envoyees: bilan.envoyees,
                  echouees: bilan.echouees,
                }),
                tone: 'error',
              });
            }
          } finally {
            setEnvoiPhotos(false);
          }
        }
      }
      toast({ message: t(edition ? 'ecranObservations.modifiee' : 'ecranObservations.enregistree'), tone: 'success' });
      if (router.canGoBack()) router.back();
      else router.replace('/observations');
    } catch {
      toast({ message: t('ecranObservations.erreurEnvoi'), tone: 'error' });
    }
  }, [cultureId, culture, description, date, photosBrouillon, edition, idObservation, creation, modification, toast, t]);

  return (
    <FormScreen
      testID="ecran-observation-v2"
      title={t(edition ? 'ecranObservations.titreModification' : 'ecranObservations.titre')}
      subtitle={culture?.nom ?? t('ecranObservations.sansCulture')}
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/observations'))}
      backLabel={t('commun.actions.retour')}
      footer={
        <PrimaryButton
          testID="observation-enregistrer"
          label={t(edition ? 'ecranObservations.enregistrerModifications' : 'ecranObservations.enregistrer')}
          onPress={() => void enregistrer()}
          loading={creation.isPending || modification.isPending || envoiPhotos}
          disabled={lectureSeule}
        />
      }
    >
      <View style={styles.corps}>
        {lectureSeule ? (
          <AlertCard tone="warning" title={t('ecranObservations.lectureSeule')} testID="observation-lecture-seule" />
        ) : null}
        {!cultureId ? (
          <PrimaryButton
            variant="secondary"
            testID="observation-choisir-culture"
            label={t('ecranObservations.choisirCulture')}
            onPress={() => setChoixVisible(true)}
          />
        ) : null}
        <FormInput
          testID="observation-description"
          label={t('ecranObservations.description')}
          required
          multiline
          maxLength={DESCRIPTION_MAX}
          placeholder={t('ecranObservations.descriptionExemple')}
          helper={`${description.trim().length}/${DESCRIPTION_MAX}`}
          value={description}
          onChangeText={setDescription}
          error={erreurDescription}
          disabled={lectureSeule}
        />
        <DateField
          testID="observation-date"
          label={t('ecranObservations.date')}
          required
          value={date}
          onChange={setDate}
          placeholder={t('ecranObservations.dateExemple')}
          doneLabel={t('commun.actions.valider')}
          changeHint={t('commun.actions.modifier')}
          maximumDate={new Date()}
          locale="fr-FR"
          error={erreurDate}
        />
        {/* Photos : en direct en modification, mises en attente à la création */}
        {edition && idObservation && culture?.parcelleId && cultureId ? (
          <PhotosObservation
            parcelleId={culture.parcelleId}
            cultureId={cultureId}
            observationId={idObservation}
            modificationAutorisee={!lectureSeule}
          />
        ) : !lectureSeule ? (
          <PhotosSelection
            photos={photosBrouillon}
            onChange={setPhotosBrouillon}
            disabled={creation.isPending || envoiPhotos}
          />
        ) : null}
        <View style={styles.aide}>
          <ClipboardList size={16} color="#5F6F66" />
          <Text variant="caption">{t('ecranObservations.aide')}</Text>
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
export function ObservationFormulaireScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ cultureId?: string; id?: string; observationId?: string }>();
  // Le cockpit V2 et la liste V1 passent `observationId` (paramètre historique).
  const idObservation = params.id ?? params.observationId;
  const edition = Boolean(idObservation);
  const observation = useObservation(idObservation);

  if (edition && (observation.isLoading || observation.isPending)) {
    return (
      <FormScreen
        testID="ecran-observation-v2"
        title={t('ecranObservations.titreModification')}
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/observations'))}
        backLabel={t('commun.actions.retour')}
        footer={<PrimaryButton label={t('ecranObservations.enregistrerModifications')} loading />}
      >
        <Skeleton height={96} radius={16} />
      </FormScreen>
    );
  }

  const donnees: Observation | undefined = observation.data;
  return (
    <Formulaire
      key={idObservation ?? 'nouvelle'}
      idObservation={idObservation}
      initial={{
        description: donnees?.description ?? '',
        date: donnees ? donnees.date.slice(0, 10) : aujourdhui(),
        cultureId: params.cultureId ?? donnees?.cultureId,
      }}
    />
  );
}

const styles = StyleSheet.create({
  corps: { gap: 16, paddingVertical: 8 },
  aide: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
