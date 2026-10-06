/**
 * ParcelleCreateScreen — implémentation de l’écran.
 *
 * Le fichier de route correspondant (`src/app/(app)/…`) ne fait que
 * réexporter ce composant : toute la logique vit ici.
 */
import React from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';

import { ParcelleWizard } from '@/components/ParcelleComponent/ParcelleWizard';
import { useCreateParcelle } from '@/hooks';
import { ApiError } from '@/services/http';

/**
 * Création d'une parcelle — assistant en 4 étapes.
 *
 * Aucune donnée métier n'est calculée côté mobile : le serveur recalcule la
 * superficie à partir du polygone et renvoie la parcelle enregistrée.
 */
export default function AjoutParcelleScreen() {
  const creation = useCreateParcelle();

  return (
    <ParcelleWizard
      mode="create"
      submitting={creation.isPending}
      errorMessage={
        creation.error instanceof ApiError ? creation.error.message : null
      }
      onCancel={() => router.back()}
      onSubmit={async (values) => {
        try {
          const parcelle = await creation.mutateAsync({
            nom: values.nom,
            typeSol: values.typeSol || null,
            description: values.description || null,
            pointsGPS: values.pointsGPS,
          });

          router.replace({
            pathname: '/(app)/(parcelles)/detail-parcelle',
            params: { id: parcelle.id },
          });
        } catch (error) {
          Alert.alert(
            'Enregistrement impossible',
            error instanceof ApiError
              ? error.message
              : 'Une erreur est survenue. Réessayez.',
          );
        }
      }}
    />
  );
}
