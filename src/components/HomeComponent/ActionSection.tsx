import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { i18n } from '@/i18n/instance';

import {
  MapPinned,
  Sprout,
  ClipboardList,
  Leaf,
  ChevronRight,
} from 'lucide-react-native';

import { router } from 'expo-router';
import { colors } from '@/theme';

type ActionCardProps = {
  icon: React.ComponentType<{
    size?: number;
    color?: string;
    strokeWidth?: number;
  }>;
  title: string;
  subtitle: string;
  accent: string;
  onPress: () => void;
};

function ActionCard({
  icon: Icon,
  title,
  subtitle,
  accent,
  onPress,
}: ActionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      {/* Icône */}
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: `${accent}12`,
            borderColor: `${accent}20`,
          },
        ]}
      >
        <Icon
          size={21}
          color={accent}
          strokeWidth={2}
        />
      </View>

      {/* Texte */}
      <View style={styles.content}>
        <Text
          style={styles.title}
          numberOfLines={1}
        >
          {title}
        </Text>

        <Text
          style={styles.subtitle}
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      </View>

      {/* Flèche */}
      <View style={styles.arrow}>
        <ChevronRight
          size={16}
          color={colors.neutral[400]}
          strokeWidth={2}
        />
      </View>
    </Pressable>
  );
}

export function ActionSection({
  parcellesCount,
}: {
  parcellesCount: number;
}) {
  return (
    <View style={styles.section}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.sectionTitle}>
            Actions rapides
          </Text>

          <Text style={styles.sectionSubtitle}>
            Gérez votre exploitation
          </Text>
        </View>
      </View>

      {/* ACTIONS */}
      <View style={styles.grid}>
        {/* PARCELLES */}
        <ActionCard
          icon={MapPinned}
          title={i18n.t('libelles.mesParcelles')}
          subtitle={`${parcellesCount} parcelles`}
          accent={colors.primary[500]}
          onPress={() =>
            router.push(
              '/(app)/(parcelles)/parcelles' as any,
            )
          }
        />

        {/* CULTURES */}
        <ActionCard
          icon={Sprout}
          title={i18n.t('libelles.mesCultures')}
          subtitle="Cultures en cours"
          accent={colors.info[500]}
          onPress={() =>
            router.push(
              '/(app)/(cultures)/cultures' as any,
            )
          }
        />

        {/* INTERVENTIONS */}
        <ActionCard
          icon={Leaf}
          title="Interventions"
          subtitle={i18n.t('libelles.historiqueSuivi')}
          accent={colors.warning[500]}
          onPress={() =>
            router.push(
              '/(app)/(interventions)/interventions-culture' as any,
            )
          }
        />

        {/* OBSERVATIONS */}
        <ActionCard
          icon={ClipboardList}
          title="Observations"
          subtitle="Suivi du terrain"
          accent={colors.success[500]}
          onPress={() =>
            router.push(
              '/(app)/(observations)/observations' as any,
            )
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.neutral[900],
    letterSpacing: -0.4,
  },

  sectionSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: colors.neutral[500],
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  card: {
    width: '48%',
    minHeight: 82,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  cardPressed: {
    opacity: 0.94,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  content: {
    flex: 1,
    paddingRight: 4,
  },

  title: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.neutral[900],
  },

  subtitle: {
    marginTop: 3,
    fontSize: 11.5,
    color: colors.neutral[500],
  },

  arrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
});