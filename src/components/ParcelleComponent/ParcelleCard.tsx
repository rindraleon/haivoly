/**
 * Sous-composant `ParcelleCard` extrait de `ParcelleListScreen`.
 *
 * Regroupe la présentation d'un élément de liste et ses interactions
 * locales, ce qui allège nettement le composant principal.
 */
import { Badge } from '@/components/CommonComponent/Badge';
import { MapPinned, ChevronRight, Ruler, Layers, Calendar } from 'lucide-react-native';
import { Card } from '@/components/CommonComponent/Card';

import { Pressable, Text, View } from 'react-native';
import { colors } from '@/theme';
import { router } from 'expo-router';
import { styles } from '@/screens/ParcelleScreen/ParcelleListScreen.styles';

import { formatDate } from '@/utils/date';
import type {
  Parcelle,
} from '@/types';
export function ParcelleCard({
  parcelle,
}: {
  parcelle: Parcelle;
}) {
  const superficie =
    parcelle.superficie
      ? {
          m2: parcelle.superficie,
          ha:
            parcelle.superficie /
            10000,
          are:
            parcelle.superficie /
            100,
        }
      : null;

  const variant: any =
    parcelle.statut === 'ACTIVE'
      ? 'success'
      : parcelle.statut ===
          'ABANDONNEE'
        ? 'warning'
        : 'neutral';

  return (
    <Pressable
      onPress={() =>
        router.push(
          `/detail-parcelle?parcelleId=${parcelle.id}` as any,
        )
      }
      style={({ pressed }) => [
        pressed && {
          opacity: 0.93,
          transform: [
            {
              scale: 0.99,
            },
          ],
        },
      ]}
    >
      <Card style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.cardIcon}>
            <MapPinned
              size={18}
              color={
                colors.primary[600]
              }
              strokeWidth={1.9}
            />
          </View>

          <View
            style={{
              flex: 1,
              gap: 3,
            }}
          >
            <Text
              numberOfLines={1}
              style={styles.cardTitle}
            >
              {parcelle.nom}
            </Text>

            <View
              style={styles.metaRow}
            >
              {parcelle.typeSol ? (
                <View
                  style={
                    styles.metaPill
                  }
                >
                  <Layers
                    size={11}
                    color={
                      colors.neutral[500]
                    }
                  />

                  <Text
                    style={
                      styles.metaText
                    }
                  >
                    {parcelle.typeSol}
                  </Text>
                </View>
              ) : null}

              {superficie ? (
                <View
                  style={
                    styles.metaPill
                  }
                >
                  <Ruler
                    size={11}
                    color={
                      colors.neutral[500]
                    }
                  />

                  <Text
                    style={
                      styles.metaText
                    }
                  >
                    {superficie.ha.toFixed(
                      2,
                    )}{' '}
                    ha •{' '}
                    {superficie.m2.toFixed(
                      0,
                    )}{' '}
                    m²
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <Badge
            label={parcelle.statut}
            variant={variant}
            dot
          />
        </View>

        {parcelle.description ? (
          <Text
            numberOfLines={2}
            style={styles.desc}
          >
            {parcelle.description}
          </Text>
        ) : (
          <Text
            style={styles.descMuted}
          >
            Aucune description
          </Text>
        )}

        <View
          style={styles.cardFooter}
        >
          <View
            style={styles.dateRow}
          >
            <Calendar
              size={12}
              color={
                colors.neutral[400]
              }
            />

            <Text
              style={styles.dateText}
            >
              {formatDate(parcelle.modifieA)}
            </Text>
          </View>

          <View
            style={styles.chev}
          >
            <ChevronRight
              size={16}
              color={
                colors.neutral[500]
              }
            />
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
