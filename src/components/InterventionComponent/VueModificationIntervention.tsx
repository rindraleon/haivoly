import { AppSelect } from '@/components/CommonComponent/AppSelect';
import { DateInput } from '@/components/CommonComponent/DateInput';
import { styles } from '@/screens/InterventionScreen/InterventionEditScreen.styles';
import { colors } from '@/theme';
import {
  PRODUITS_INTERVENTION,
  TYPES_INTERVENTION,
  UNITES_INTERVENTION,
  statutInterventionPrevu,
} from '@/utils/intervention';
import type { Intervention, UpdateInterventionPayload } from '@/types';
import type { UseMutationResult } from '@tanstack/react-query';
import { router } from 'expo-router';
import { CalendarDays } from 'lucide-react-native';
import type { Dispatch, SetStateAction } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Props = {
  cout: string;
  cultureNom: string;
  date: string;
  description: string;
  handleSubmit: () => Promise<void>;
  parcelleNom: string;
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
  updateMutation: UseMutationResult<Intervention, Error, { id: string; cultureId: string; body: UpdateInterventionPayload; }, unknown>;
};

export function VueModificationIntervention({
  cout,
  cultureNom,
  date,
  description,
  handleSubmit,
  parcelleNom,
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
  return (
<KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.content
          }
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>
            Modifier l’intervention
          </Text>

          <View style={styles.contextCard}>
            <Text style={styles.contextLabel}>
              Parcelle
            </Text>

            <Text style={styles.contextValue}>
              {parcelleNom || 'Parcelle'}
            </Text>

            <Text
              style={[
                styles.contextLabel,
                styles.cultureLabel,
              ]}
            >
              Culture
            </Text>

            <Text style={styles.contextValue}>
              {cultureNom || 'Culture'}
            </Text>
          </View>

          {/* TYPE — liste déroulante : aucun code technique à recopier */}
          <AppSelect
            label="Type d’intervention"
            required
            value={type}
            options={TYPES_INTERVENTION}
            onChange={setType}
            disabled={updateMutation.isPending}
          />

          {/* DATE — sélecteur natif, envoyée en `AAAA-MM-JJ` */}
          <DateInput
            label="Date"
            required
            value={date}
            onChange={setDate}
            disabled={updateMutation.isPending}
            leftIcon={
              <CalendarDays
                size={16}
                color={colors.neutral[400]}
              />
            }
            hint={
              statutInterventionPrevu(date)
                ? `Statut recalculé par le serveur : ${
                    statutInterventionPrevu(date) ===
                    'PLANIFIEE'
                      ? 'Planifiée'
                      : 'En cours'
                  }`
                : undefined
            }
          />

          {/* DESCRIPTION */}
          <Text style={styles.label}>
            Description
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.textarea,
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Description de l’intervention"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={
              !updateMutation.isPending
            }
          />

          {/* PRODUIT — liste déroulante */}
          <AppSelect
            label="Produit"
            value={produit || null}
            options={PRODUITS_INTERVENTION}
            onChange={setProduit}
            disabled={updateMutation.isPending}
            emptyLabel="Aucun produit renseigné"
          />

          {/* QUANTITE */}
          <Text style={styles.label}>
            Quantité
          </Text>

          <TextInput
            style={styles.input}
            value={quantite}
            onChangeText={setQuantite}
            placeholder="Ex : 30"
            placeholderTextColor="#999"
            keyboardType="decimal-pad"
            editable={
              !updateMutation.isPending
            }
          />

          {/* UNITE — liste déroulante */}
          <AppSelect
            label="Unité"
            value={unite || null}
            options={UNITES_INTERVENTION}
            onChange={setUnite}
            disabled={updateMutation.isPending}
          />

          {/* COUT */}
          <Text style={styles.label}>
            Coût
          </Text>

          <TextInput
            style={styles.input}
            value={cout}
            onChangeText={setCout}
            placeholder="Ex : 180000"
            placeholderTextColor="#999"
            keyboardType="decimal-pad"
            editable={
              !updateMutation.isPending
            }
          />

          {/* BOUTON ENREGISTRER */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              updateMutation.isPending &&
                styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={
              updateMutation.isPending
            }
          >
            {updateMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={styles.saveButtonText}
              >
                💾 Enregistrer les modifications
              </Text>
            )}
          </TouchableOpacity>

          {/* BOUTON ANNULER */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={
              updateMutation.isPending
            }
          >
            <Text
              style={styles.cancelButtonText}
            >
              ← Annuler
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
  );
}
