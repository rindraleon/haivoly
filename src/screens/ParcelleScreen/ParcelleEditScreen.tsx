import { i18n } from '@/i18n/instance';
import { Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { ErrorState } from '@/components/CommonComponent/ErrorState';
import { LoadingState } from '@/components/CommonComponent/LoadingState';
import { ParcelleWizard } from '@/components/ParcelleComponent/ParcelleWizard';
import { useParcelle, useUpdateParcelle } from '@/hooks';
import { ApiError } from '@/services/http';

export default function ModifierParcelleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const parcelle = useParcelle(id);
  const miseAJour = useUpdateParcelle();

  if (parcelle.isLoading) {
    return <LoadingState message={i18n.t('parcelles.chargementParcelle')} />;
  }

  if (parcelle.isError || !parcelle.data) {
    return (
      <ErrorState
        title={i18n.t('libelles.parcelleIntrouvable')}
        message={i18n.t('parcelles.impossibleChargerInformationsParcelle')}
        onRetry={() => parcelle.refetch()}
        onBack={() => router.back()}
      />
    );
  }

  const data = parcelle.data;

  return (
    <ParcelleWizard
      mode="edit"
      submitting={miseAJour.isPending}
      errorMessage={miseAJour.error instanceof ApiError ? miseAJour.error.message : null}
      initialValues={data}
      onCancel={() => router.back()}
      onSubmit={async (values) => {
        try {
          await miseAJour.mutateAsync({
            id: data.id,
            body: {
              nom: values.nom,
              typeSol: values.typeSol || null,
              description: values.description || null,
              ...(values.pointsGPS.length >= 3
                ? { pointsGPS: values.pointsGPS }
                : {}),
            },
          });

          Alert.alert(i18n.t('parcelles.miseAJour'), i18n.t('parcelles.modificationsEnregistrees'));
          router.back();
        } catch (error) {
          Alert.alert(
            'Modification impossible',
            error instanceof ApiError ? error.message : i18n.t('domaine.erreurSurvenue'),
          );
        }
      }}
    />
  );
}
