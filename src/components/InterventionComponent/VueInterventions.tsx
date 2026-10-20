import type { Intervention } from '@/screens/InterventionScreen/InterventionListScreen.helpers';
import { i18n } from '@/i18n/instance';
import { useStylesInterventions } from '@/screens/InterventionScreen/stylesInterventions';
import { useTheme } from '@/hooks/common/useTheme';
import type { InterventionPayload, Intervention as InterventionInterventions, UpdateInterventionPayload } from '@/types';
import type { UseMutationResult } from '@tanstack/react-query';
import { X } from 'lucide-react-native';
import { useMemo, type Dispatch, type SetStateAction } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppSelect, type SelectOption } from '@/components/CommonComponent/AppSelect';
import { PhotosSelection, type PhotoBrouillon } from '@/components/CommonComponent/PhotosSelection';
import { PhotosIntervention } from '@/components/InterventionComponent/PhotosIntervention';
import { DateTimeInput } from '@/components/CommonComponent/DateTimeInput';
import {
  PRODUITS_INTERVENTION,
  TYPES_INTERVENTION,
  UNITES_INTERVENTION,
} from '@/utils/intervention';

type Props = {
  cout: string;
  createMutation: UseMutationResult<InterventionInterventions, Error, { cultureId: string; body: InterventionPayload; }, unknown>;
  cultureLabel: string;
  date: string;
  description: string;
  enregistrerIntervention: () => Promise<void>;
  fermerFormulaire: () => void;
  interventionEnModification: Intervention | null;
  /** Identifiants de contexte : requis pour la gestion des photos en modification. */
  parcelleId?: string;
  cultureId?: string;
  /** Photos mises en attente à la création (envoyées après enregistrement). */
  photosBrouillon?: PhotoBrouillon[];
  onChangePhotosBrouillon?: (photos: PhotoBrouillon[]) => void;
  parcelleLabel: string;
  produit: string;
  quantite: string;
  setCout: Dispatch<SetStateAction<string>>;
  setDate: Dispatch<SetStateAction<string>>;
  setDescription: Dispatch<SetStateAction<string>>;
  setProduit: Dispatch<SetStateAction<string>>;
  setQuantite: Dispatch<SetStateAction<string>>;
  setType: Dispatch<SetStateAction<string>>;
  setUnite: Dispatch<SetStateAction<string>>;
  type: string;
  unite: string;
  updateMutation: UseMutationResult<InterventionInterventions, Error, { id: string; cultureId: string; body: UpdateInterventionPayload; }, unknown>;
};

/** Ajoute la valeur courante à une liste d'options si elle n'y figure pas. */
function avecValeurCourante(
  options: SelectOption[],
  valeur: string,
): SelectOption[] {
  if (!valeur || options.some((option) => option.value === valeur)) {
    return options;
  }
  return [{ value: valeur, label: valeur }, ...options];
}

export function VueInterventions({
  cout,
  createMutation,
  cultureLabel,
  date,
  description,
  enregistrerIntervention,
  fermerFormulaire,
  interventionEnModification,
  parcelleId,
  cultureId,
  photosBrouillon,
  onChangePhotosBrouillon,
  parcelleLabel,
  produit,
  quantite,
  setCout,
  setDate,
  setDescription,
  setProduit,
  setQuantite,
  setType,
  setUnite,
  type,
  unite,
  updateMutation,
}: Props) {
  const styles = useStylesInterventions();
  const { jetons } = useTheme();
  const optionsType = useMemo(
    () => avecValeurCourante(TYPES_INTERVENTION, type),
    [type],
  );
  const optionsProduit = useMemo(
    () => avecValeurCourante(PRODUITS_INTERVENTION, produit),
    [produit],
  );
  const optionsUnite = useMemo(
    () => avecValeurCourante(UNITES_INTERVENTION, unite),
    [unite],
  );

  return (
<View style={styles.formCard}>
          <View style={styles.formHeaderRow}>
            <View style={styles.formHeaderCopy}>
              <Text style={styles.formTitle}>
                {interventionEnModification
                  ? 'Modifier l’intervention'
                  : i18n.t('libelles.nouvelleIntervention')}
              </Text>
              <Text style={styles.formSubtitle}>
                {cultureLabel || i18n.t('libelles.culture')} • {parcelleLabel || i18n.t('libelles.parcelle')}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.formCloseButton}
              onPress={fermerFormulaire}
              activeOpacity={0.8}
            >
              <X size={19} color={jetons.texte.principal} />
            </TouchableOpacity>
          </View>

          <AppSelect
            label={i18n.t('libelles.typeIntervention')}
            required
            placeholder={i18n.t('libelles.choisirType')}
            value={type || null}
            options={optionsType}
            onChange={setType}
            disabled={createMutation.isPending || updateMutation.isPending}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={description}
            onChangeText={setDescription}
            placeholder={i18n.t('interventions.decrirePlaceholder')}
            placeholderTextColor={jetons.texte.discret}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            editable={!createMutation.isPending && !updateMutation.isPending}
          />

          <DateTimeInput
            label={i18n.t('libelles.dateEtHeure')}
            required
            value={date}
            onChange={setDate}
            hint={i18n.t('interventions.statutCalculeDepuisDate')}
            disabled={createMutation.isPending || updateMutation.isPending}
          />

          <AppSelect
            label="Produit"
            placeholder={i18n.t('libelles.choisirProduit')}
            hint="Facultatif"
            value={produit || null}
            options={optionsProduit}
            onChange={setProduit}
            disabled={createMutation.isPending || updateMutation.isPending}
          />

          <View style={styles.formTwoColumns}>
            <View style={styles.formColumn}>
              <Text style={styles.label}>Quantité</Text>
              <TextInput
                style={styles.input}
                value={quantite}
                onChangeText={setQuantite}
                placeholder="0"
                placeholderTextColor={jetons.texte.discret}
                keyboardType="decimal-pad"
                editable={!createMutation.isPending && !updateMutation.isPending}
              />
            </View>

            <View style={styles.formColumn}>
              <AppSelect
                label={i18n.t('domaine.unite')}
                placeholder={i18n.t('interventions.choisirUnite')}
                value={unite || null}
                options={optionsUnite}
                onChange={setUnite}
                disabled={createMutation.isPending || updateMutation.isPending}
              />
            </View>
          </View>

          <Text style={styles.label}>Coût (Ar)</Text>
          <TextInput
            style={styles.input}
            value={cout}
            onChangeText={setCout}
            placeholder="0"
            placeholderTextColor={jetons.texte.discret}
            keyboardType="decimal-pad"
            editable={!createMutation.isPending && !updateMutation.isPending}
          />

          {/* Photos : en direct lors d'une modification, mises en attente à la création */}
          {interventionEnModification && parcelleId && cultureId ? (
            <PhotosIntervention
              parcelleId={parcelleId}
              cultureId={cultureId}
              interventionId={interventionEnModification.id}
              modificationAutorisee
            />
          ) : null}
          {!interventionEnModification && photosBrouillon && onChangePhotosBrouillon ? (
            <PhotosSelection
              photos={photosBrouillon}
              onChange={onChangePhotosBrouillon}
              disabled={createMutation.isPending}
            />
          ) : null}

          <View style={styles.formButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={fermerFormulaire}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={enregistrerIntervention}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <ActivityIndicator color={jetons.primaire.contraste} />
              ) : (
                <Text style={styles.saveButtonText}>{i18n.t('libelles.enregistrer')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
  );
}
