import React, { useState } from 'react';
import { i18n } from '@/i18n/instance';
import { Alert, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle2, MapPin, PenTool, Plus, RotateCcw, Trash2 } from 'lucide-react-native';

import { colors } from '@/theme';
import { Button } from '@/components/CommonComponent/Button';
import { Card } from '@/components/CommonComponent/Card';
import { ErrorState } from '@/components/CommonComponent/ErrorState';
import { LoadingState } from '@/components/CommonComponent/LoadingState';
import { ParcelleMap } from '@/components/ParcelleComponent/ParcelleMap';
import { ParcelleFormShell } from '@/components/ParcelleComponent/ParcelleFormShell';
import { useDelimiterParcelle, useParcelle } from '@/hooks';
import { ApiError } from '@/services/http';
import { messageDesDefauts, validerGeometrie } from '@/utils/geometrie';
import { formatSuperficie, polishPolygon } from '@/utils/parcelle';
import type { PointGPS } from '@/types';


import { styles } from './ParcelleDelimiterScreen.styles';
export default function DelimiterParcelleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const parcelle = useParcelle(id);
  const delimitation = useDelimiterParcelle();

  const [points, setPoints] = useState<PointGPS[] | null>(null);

  const latitude = parcelle.data?.latitude ?? null;
  const longitude = parcelle.data?.longitude ?? null;

  const pointsEnregistres = parcelle.data?.pointsGPS ?? [];
  const pointsCourants = points ?? polishPolygon(pointsEnregistres);

  const center =
    latitude != null && longitude != null ? { latitude, longitude } : null;

  const superficie = formatSuperficie(pointsCourants);

  // Validation identique à celle du backend : on évite un aller-retour réseau
  // inutile (souvent impossible sur le terrain) et on explique le problème.
  const geometrie = validerGeometrie(pointsCourants);
  const valide = geometrie.valide;

  if (parcelle.isLoading) {
    return <LoadingState message={i18n.t('parcelles.chargementDelimitation')} />;
  }

  if (parcelle.isError || !parcelle.data) {
    return (
      <ErrorState
        title={i18n.t('libelles.parcelleIntrouvable')}
        onRetry={() => parcelle.refetch()}
        onBack={() => router.back()}
      />
    );
  }

  const handleEnregistrer = async () => {
    if (!valide) {
      Alert.alert(
        i18n.t('domaine.delimitationInvalide'),
        geometrie.defauts.length > 0
          ? messageDesDefauts(geometrie.defauts)
          : 'Ajoutez au moins 3 sommets distincts.',
      );
      return;
    }

    try {
      await delimitation.mutateAsync({ id: id as string, pointsGPS: pointsCourants });
      Alert.alert(i18n.t('domaine.delimitationEnregistree'), i18n.t('parcelles.superficieRecalculee'));
      router.back();
    } catch (error) {
      Alert.alert(
        'Enregistrement impossible',
        error instanceof ApiError ? error.message : i18n.t('domaine.erreurSurvenue'),
      );
    }
  };

  return (
    <ParcelleFormShell
      title={i18n.t('parcelles.delimiter')}
      subtitle={parcelle.data.nom}
      onBack={() => router.back()}
      footer={
        <View style={styles.footerRow}>
          <Button
            variant="outline"
            onPress={() => setPoints(null)}
            leftIcon={<RotateCcw size={16} color={colors.neutral[700]} />}
            style={styles.flex}
          >
            Réinitialiser
          </Button>
          <Button
            onPress={handleEnregistrer}
            loading={delimitation.isPending}
            disabled={!valide}
            leftIcon={<CheckCircle2 size={16} color={colors.neutral[0]} />}
            style={styles.flex}
          >
            Enregistrer
          </Button>
        </View>
      }
    >
      {/* Bandeau d'état : « mode délimitation » explicite */}
      <View style={styles.modeBanner}>
        <PenTool size={16} color={colors.primary[700]} />
        <Text style={styles.modeText}>
          Mode délimitation actif — touchez la carte pour ajouter un sommet.
        </Text>
      </View>

      <Card padded={false} style={styles.mapCard}>
        <ParcelleMap
          points={pointsCourants}
          center={center}
          editable
          onPointMove={(index, position) =>
            setPoints(
              pointsCourants.map((point, position_) =>
                position_ === index ? { ...point, ...position } : point,
              ),
            )
          }
          onPress={(position) =>
            setPoints([
              ...pointsCourants,
              { ...position, ordre: pointsCourants.length },
            ])
          }
          style={styles.map}
        />

        <View style={styles.mapFooter}>
          <View style={styles.stat}>
            <MapPin size={14} color={colors.neutral[500]} />
            <Text style={styles.statText}>
              {pointsCourants.length} sommet{pointsCourants.length > 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statText}>
              {superficie ?? 'Superficie : 3 sommets minimum'}
            </Text>
          </View>
        </View>
      </Card>

      <View style={styles.actionsRow}>
        <Button
          variant="outline"
          size="sm"
          onPress={() =>
            setPoints([
              ...pointsCourants,
              pointsCourants.length > 0
                ? {
                    latitude: pointsCourants[pointsCourants.length - 1].latitude + 0.0004,
                    longitude: pointsCourants[pointsCourants.length - 1].longitude + 0.0004,
                    ordre: pointsCourants.length,
                  }
                : {
                    latitude: center?.latitude ?? -18.8792,
                    longitude: center?.longitude ?? 47.5079,
                    ordre: 0,
                  },
            ])
          }
          leftIcon={<Plus size={15} color={colors.neutral[700]} />}
        >
          Ajouter un sommet
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onPress={() => setPoints(pointsCourants.slice(0, -1))}
          disabled={pointsCourants.length === 0}
          leftIcon={<Trash2 size={15} color={colors.error[500]} />}
        >
          Retirer le dernier
        </Button>
      </View>

      <Card variant="muted">
        <Text style={styles.helpTitle}>Comment délimiter</Text>
        <Text style={styles.helpText}>
          1. Touchez la carte à chaque coin de la parcelle, dans le sens horaire.{'\n'}
          2. Faites glisser un point pour l&apos;ajuster précisément.{'\n'}
          3. Au moins 3 sommets sont nécessaires : le serveur recalcule alors la
          superficie et le centre de la parcelle.
        </Text>
      </Card>
    </ParcelleFormShell>
  );
}
