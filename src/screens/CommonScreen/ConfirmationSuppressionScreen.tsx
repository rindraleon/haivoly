import { useConfirm } from '@/components/CommonComponent/ConfirmProvider';
import { i18n } from '@/i18n/instance';
import {
  ActivityIndicator,
  Alert,
 
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { useDeleteParcelle } from '@/hooks';

import { styles } from './ConfirmationSuppressionScreen.styles';
import { logger } from '@/utils/logger';

export default function ConfirmationSuppressionScreen() {
  const confirm = useConfirm();
  const { parcelleId, nom } = useLocalSearchParams<{
    parcelleId: string;
    nom: string;
  }>();

  const [raison, setRaison] = useState('');

  const deleteParcelleMutation = useDeleteParcelle();

  const handleConfirmation = async () => {
    const raisonTrim = raison.trim();

    if (!raisonTrim) {
      Alert.alert(
        'Raison obligatoire',
        i18n.t('divers.suppression.raisonRequise'),
      );
      return;
    }

    const ok = await confirm({
      title: `Supprimer "${nom}" ?`,
      description: `Voulez-vous vraiment supprimer définitivement la parcelle "${nom}" ? Cette action est irréversible et marquera la parcelle comme SUPPRIMÉE.`,
      confirmLabel: i18n.t('libelles.supprimer'),
      cancelLabel: 'Annuler',
      variant: 'danger',
    });
    if (!ok) return;

    deleteParcelleMutation.mutate(
      {
        id: parcelleId as string,
        raison: raisonTrim,
      },
      {
        onSuccess: () => {
          Alert.alert(
            i18n.t('divers.suppression.confirmee'),
            i18n.t('divers.suppression.parcelleMarquee'),
            [
              {
                text: 'OK',
                onPress: () => router.replace('/parcelles' as any),
              },
            ],
          );
        },

        onError: (error: any) => {
          logger.debug('ConfirmationSuppressionScreen', 
            'DELETE PARCELLE ERROR:',
            error?.response?.data || error,
          );

          Alert.alert(
            i18n.t('domaine.erreur'),
            error?.response?.data?.message ||
              i18n.t('parcelles.impossibleSupprimerParcelle'),
          );
        },
      },
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Suppression de la parcelle
      </Text>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>
          Parcelle
        </Text>

        <Text style={styles.nom}>
          {nom}
        </Text>
      </View>

      <Text style={styles.warning}>
        Cette opération modifiera le statut de la parcelle
        en « SUPPRIMÉE ». Une confirmation pro vous sera demandée.
      </Text>

      <Text style={styles.label}>
        Raison de la suppression *
      </Text>

      <TextInput
        style={styles.input}
        placeholder={i18n.t('divers.suppression.raisonPlaceholder')}
        value={raison}
        onChangeText={setRaison}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        editable={!deleteParcelleMutation.isPending}
      />

      <TouchableOpacity
        style={[
          styles.confirmButton,
          deleteParcelleMutation.isPending &&
            styles.disabledButton,
        ]}
        onPress={handleConfirmation}
        disabled={deleteParcelleMutation.isPending}
      >
        {deleteParcelleMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.confirmText}>
            Confirmer la suppression
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
        disabled={deleteParcelleMutation.isPending}
      >
        <Text style={styles.cancelText}>
          Annuler
        </Text>
      </TouchableOpacity>
    </View>
  );
}
