import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { Camera, Coins, Scale, ShieldCheck, Wheat } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AccessibilityInfo, Alert, StyleSheet, View } from 'react-native';

import {
  PhotosSelection,
  type PhotoBrouillon,
} from '@/components/CommonComponent/PhotosSelection';
import { useCreateRecolte, useCulture } from '@/hooks';
import { recoltePhotosApi } from '@/services';
import { ApiError } from '@/services/http';
import { envoyerPhotosEnAttente } from '@/utils/envoiPhotos';
import {
  AlertCard,
  Card,
  ChoiceChips,
  DateField,
  FormInput,
  FormScreen,
  PrimaryButton,
  Text,
  useTheme,
  useToast,
} from '@/ui';
import { dateOnlyVersDateLocale, formatDate, todayDateOnly } from '@/utils/date';

import {
  DESCRIPTION_MAX,
  UNITES_RECOLTE,
  estChampRecolte,
  schemaRecolte,
  valeursInitialesRecolte,
  versPayloadRecolte,
  type ValeursRecolte,
} from './schema';

export function RecolteFormScreen() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const toast = useToast();
  const { cultureId, parcelleId } = useLocalSearchParams<{ cultureId: string; parcelleId?: string }>();
  const culture = useCulture(parcelleId, cultureId);
  const creation = useCreateRecolte();
  const [photosBrouillon, setPhotosBrouillon] = useState<PhotoBrouillon[]>([]);
  const [envoiPhotos, setEnvoiPhotos] = useState(false);

  // La culture peut arriver après l'ouverture : le schéma est recalculé, et
  // react-hook-form relit le resolver à chaque rendu.
  const plantation = culture.data?.datePlantation ?? null;

  const schema = useMemo(
    () =>
      schemaRecolte(
        {
          dateInvalide: t('formulaire.dateInvalide'),
          dateAvantPlantation: t('recoltes.dateAvantPlantation'),
          quantite: t('recoltes.quantiteSuperieureZero'),
          montant: t('formulaire.montantInvalide'),
          descriptionTropLongue: t('formulaire.texteTropLong', { max: DESCRIPTION_MAX }),
        },
        plantation,
      ),
    [t, plantation],
  );

  const {
    control,
    handleSubmit,
    setError,
    setFocus,
    formState: { isSubmitting },
  } = useForm<ValeursRecolte>({
    resolver: zodResolver(schema),
    defaultValues: valeursInitialesRecolte(todayDateOnly()),
    mode: 'onTouched',
  });

  const unite = useWatch({ control, name: 'unite' });
  const libellesUnites: Record<(typeof UNITES_RECOLTE)[number], string> = {
    kg: t('recoltes.unites.kg'),
    tonne: t('recoltes.unites.tonne'),
    sac: t('recoltes.unites.sac'),
    litre: t('recoltes.unites.litre'),
    unite: t('recoltes.unites.unite'),
  };

  const enregistrer = handleSubmit(
    async (valeurs) => {
      if (!cultureId) return;
      try {
        const creee = await creation.mutateAsync({ cultureId, body: versPayloadRecolte(valeurs) });

        // Photos jointes : envoyées une fois la récolte créée (hors-ligne :
        // récolte locale sans identifiant serveur — elles resteront à ajouter
        // depuis la fiche de la récolte).
        if (photosBrouillon.length > 0 && creee?.id && !creee._localOnly) {
          setEnvoiPhotos(true);
          try {
            const bilan = await envoyerPhotosEnAttente(photosBrouillon, (fichier) =>
              recoltePhotosApi.upload(creee.id, fichier),
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

        Alert.alert(t('recoltes.enregistree'), t('recoltes.cultureMarquee'), [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } catch (erreur) {
        if (erreur instanceof ApiError && erreur.fields.length > 0) {
          const champs = erreur.fields.filter((champ) => estChampRecolte(champ.field));
          champs.forEach((champ, index) => {
            if (estChampRecolte(champ.field)) {
              setError(champ.field, { type: 'server', message: champ.message }, { shouldFocus: index === 0 });
            }
          });
          if (champs.length > 0) return;
        }
        Alert.alert(
          t('recoltes.enregistrementImpossible'),
          erreur instanceof ApiError ? erreur.message : t('domaine.reessayerErreur'),
        );
      }
    },
    (erreurs) => {
      AccessibilityInfo.announceForAccessibility(
        t('formulaire.corrigerErreurs', { count: Object.keys(erreurs).length }),
      );
    },
  );

  const contexte = culture.data
    ? [
        culture.data.variete ? `${culture.data.nom} · ${culture.data.variete}` : culture.data.nom,
        culture.data.parcelle?.nom,
      ]
        .filter(Boolean)
        .join(' — ')
    : undefined;

  const retour = () => (router.canGoBack() ? router.back() : router.replace('/home'));

  return (
    <FormScreen
      title={t('recoltes.nouvelle')}
      subtitle={contexte ?? t('recoltes.passageAutomatique')}
      onBack={retour}
      backLabel={t('commun.actions.retour')}
      testID="formulaire-recolte"
      footer={
        <PrimaryButton
          label={t('recoltes.enregistrer')}
          icon={Wheat}
          onPress={() => void enregistrer()}
          loading={isSubmitting || creation.isPending || envoiPhotos}
          disabled={!cultureId}
          fullWidth
          testID="recolte-enregistrer"
        />
      }
    >
      {!cultureId ? (
        <AlertCard tone="error" title={t('recoltes.cultureManquante')} />
      ) : null}

      <Card style={styles.carte}>
        <View style={styles.titreCarte}>
          <Scale size={18} color={theme.couleurs.primaire} />
          <Text variant="h3">{t('recoltes.sectionRecolte')}</Text>
        </View>

        <Controller
          control={control}
          name="dateRecolte"
          render={({ field, fieldState }) => (
            <DateField
              ref={field.ref}
              label={t('recoltes.dateRecolte')}
              value={field.value}
              onChange={(valeur) => {
                field.onChange(valeur);
                field.onBlur();
              }}
              required
              error={fieldState.error?.message}
              helper={
                culture.data?.datePlantation
                  ? t('recoltes.plantationLe', { date: formatDate(culture.data.datePlantation) })
                  : t('libelles.choisirDateCalendrier')
              }
              minimumDate={dateOnlyVersDateLocale(culture.data?.datePlantation) ?? undefined}
              placeholder={t('domaine.choisirDate')}
              doneLabel={t('formulaire.terminer')}
              changeHint={t('formulaire.modifierDate')}
              locale={i18n.language === 'en' ? 'en-GB' : 'fr-FR'}
              testID="recolte-date"
            />
          )}
        />

        <Controller
          control={control}
          name="quantite"
          render={({ field, fieldState }) => (
            <FormInput
              ref={field.ref}
              label={t('recoltes.quantiteRecoltee')}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              required
              error={fieldState.error?.message}
              suffix={libellesUnites[unite]}
              placeholder="1200"
              keyboardType="decimal-pad"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => setFocus('prixVente')}
              testID="recolte-quantite"
            />
          )}
        />

        <Controller
          control={control}
          name="unite"
          render={({ field, fieldState }) => (
            <ChoiceChips
              ref={field.ref}
              label={t('domaine.unite')}
              required
              options={UNITES_RECOLTE.map((valeur) => ({ value: valeur, label: libellesUnites[valeur] }))}
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              testID="recolte-unite"
            />
          )}
        />
      </Card>

      <Card style={styles.carte}>
        <View style={styles.titreCarte}>
          <Coins size={18} color={theme.couleurs.primaire} />
          <Text variant="h3">{t('recoltes.sectionValeur')}</Text>
          <Text variant="caption" color="texteSecondaire">
            {t('formulaire.facultatif')}
          </Text>
        </View>

        <Controller
          control={control}
          name="prixVente"
          render={({ field, fieldState }) => (
            <FormInput
              ref={field.ref}
              label={t('recoltes.prixVente')}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
              suffix="Ar"
              placeholder="0"
              keyboardType="decimal-pad"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => setFocus('coutRecolte')}
              testID="recolte-prix"
            />
          )}
        />

        <Controller
          control={control}
          name="coutRecolte"
          render={({ field, fieldState }) => (
            <FormInput
              ref={field.ref}
              label={t('recoltes.coutRecolte')}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
              suffix="Ar"
              placeholder="0"
              keyboardType="decimal-pad"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => setFocus('description')}
              testID="recolte-cout"
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field, fieldState }) => (
            <FormInput
              ref={field.ref}
              label={t('recoltes.description')}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
              helper={t('formulaire.compteur', { count: field.value.length, max: DESCRIPTION_MAX })}
              placeholder={t('recoltes.conditions')}
              multiline
              maxLength={DESCRIPTION_MAX}
              testID="recolte-description"
            />
          )}
        />
      </Card>

      <Card style={styles.carte}>
        <View style={styles.titreCarte}>
          <Camera size={18} color={theme.couleurs.primaire} />
          <Text variant="h3">{t('photos.titre')}</Text>
          <Text variant="caption" color="texteSecondaire">
            {t('formulaire.facultatif')}
          </Text>
        </View>
        <PhotosSelection
          photos={photosBrouillon}
          onChange={setPhotosBrouillon}
          disabled={creation.isPending || envoiPhotos}
        />
      </Card>

      <Card variant="tonal" style={styles.carte}>
        <View style={styles.titreCarte}>
          <ShieldCheck size={18} color={theme.couleurs.texteSecondaire} />
          <Text variant="label">{t('libelles.reglesServeur')}</Text>
        </View>
        <Text variant="bodySmall" color="texteSecondaire">
          {`• ${t('recoltes.regleUnique')}\n• ${t('recoltes.regleDate')}\n• ${t('recoltes.regleTransaction')}`}
        </Text>
      </Card>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  carte: { gap: 16 },
  titreCarte: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
});
