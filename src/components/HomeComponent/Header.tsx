import { View, Text, Pressable, StyleSheet } from 'react-native';
import { i18n } from '@/i18n/instance';
import {
  Sprout,
  Bell,
  MapPinned,
  Clock3,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/theme';

type HomeHeaderProps = {
  user: {
    prenom?: string | null;
    nom: string;
  };

  greeting: string;

  loadingParcelles: boolean;
  parcellesCount: number;
  superficieHa: number;

  pendingCount: number;
  isOnline: boolean;

  notificationCount: number;
};

export function HomeHeader({
  user,
  greeting,
  loadingParcelles,
  parcellesCount,
  superficieHa,
  pendingCount,
  isOnline,
  notificationCount,
}: HomeHeaderProps) {
  const router = useRouter();

  const prenom = user.prenom?.trim();
  const displayName = prenom || user.nom;

  const initials =
    `${prenom?.[0] ?? ''}${user.nom?.[0] ?? ''}`.toUpperCase() || '?';

  const ouvrirProfil = () => {
    router.push('/(app)/(common)/profil');
  };

  const ouvrirNotifications = () => {
    router.push('/(app)/(common)/notifications' as never);
  };

  return (
    <View style={styles.hero}>
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />

      <View style={styles.topRow}>
        {/* Logo / Nom */}
        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <Sprout
              size={19}
              color="#FFFFFF"
              strokeWidth={2}
            />
          </View>

          <View>
            <Text style={styles.brandText}>
              Haivoly
            </Text>

            <Text style={styles.brandSub}>
              Agriculture
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {/* Notifications */}
          <Pressable
            onPress={ouvrirNotifications}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.pressed,
            ]}
            accessibilityLabel="Notifications"
            accessibilityRole="button"
            hitSlop={8}
          >
            <Bell
              size={19}
              color="#FFFFFF"
              strokeWidth={1.9}
            />

            {notificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {notificationCount > 9
                    ? '9+'
                    : notificationCount}
                </Text>
              </View>
            )}
          </Pressable>

          {/* Avatar */}
          <Pressable
            onPress={ouvrirProfil}
            style={({ pressed }) => [
              styles.avatar,
              pressed && styles.pressed,
            ]}
            accessibilityLabel={i18n.t('libelles.ouvrirProfil')}
            accessibilityRole="button"
            hitSlop={8}
          >
            <Text style={styles.avatarText}>
              {initials}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.greetingBlock}>
        <Text style={styles.greeting}>
          {greeting}, {displayName} 👋
        </Text>

        <Text style={styles.description}>
          Voici l&apos;état de votre exploitation
        </Text>
      </View>

      <View style={styles.statsRow}>
        {/* PARCELLES */}
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <MapPinned
              size={22}
              color="#A8D98B"
              strokeWidth={2.2}
            />
          </View>

          <Text style={styles.statValue}>
            {loadingParcelles ? '—' : parcellesCount}
          </Text>

          <Text
            style={styles.statLabel}
            numberOfLines={2}
          >
            PARCELLES ACTIVES
          </Text>

          <Text style={styles.statHint}>
            {superficieHa.toFixed(2)} ha
          </Text>
        </View>

        {/* EN ATTENTE */}
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Clock3
              size={22}
              color="#F8C65B"
              strokeWidth={2.2}
            />
          </View>

          <Text style={styles.statValue}>
            {pendingCount}
          </Text>

          <Text
            style={styles.statLabel}
            numberOfLines={2}
          >
            EN ATTENTE
          </Text>

          <Text style={styles.statHint}>
            {isOnline
              ? i18n.t('divers.aSynchroniser')
              : 'offline'}
          </Text>
        </View>

        {/* NOTIFICATIONS */}
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Bell
              size={22}
              color="#B7B8F4"
              strokeWidth={2.2}
            />
          </View>

          <Text style={styles.statValue}>
            {notificationCount}
          </Text>

          <Text
            style={styles.statLabel}
            numberOfLines={2}
          >
            NOTIFICATIONS
          </Text>

          <Text style={styles.statHint}>
            recommandations
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({

  hero: {
    position: 'relative',
    overflow: 'hidden',

    // Vert agricole principal
    backgroundColor: '#2F6B3A',

    borderRadius: 24,

    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,

    gap: 22,
  },

  // Lumière verte douce en haut à droite
  glowOne: {
    position: 'absolute',

    width: 190,
    height: 190,
    borderRadius: 95,

    backgroundColor: 'rgba(151, 205, 112, 0.18)',

    top: -105,
    right: -55,
  },

  // Décoration douce en bas à gauche
  glowTwo: {
    position: 'absolute',

    width: 155,
    height: 155,
    borderRadius: 78,

    backgroundColor: 'rgba(210, 235, 185, 0.08)',

    bottom: -82,
    left: -50,
  },


  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  brandIcon: {
    width: 38,
    height: 38,

    borderRadius: 13,

    backgroundColor: 'rgba(255,255,255,0.13)',

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',

    alignItems: 'center',
    justifyContent: 'center',
  },

  brandText: {
    fontSize: 16,
    fontWeight: '800',

    color: '#FFFFFF',

    letterSpacing: -0.3,
  },

  brandSub: {
    marginTop: 1,

    fontSize: 10.5,

    color: 'rgba(255,255,255,0.68)',

    letterSpacing: 0.3,
  },


  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  actionButton: {
    position: 'relative',

    width: 40,
    height: 40,

    borderRadius: 20,

    backgroundColor: 'rgba(255,255,255,0.11)',

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',

    alignItems: 'center',
    justifyContent: 'center',
  },

  avatar: {
    width: 40,
    height: 40,

    borderRadius: 20,

    backgroundColor: '#F4FAEF',

    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: '#2F6B3A',

    fontSize: 13,
    fontWeight: '800',
  },

  notificationBadge: {
    position: 'absolute',

    top: 3,
    right: 3,

    minWidth: 15,
    height: 15,

    borderRadius: 8,

    backgroundColor: colors.warning[500],

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 3,

    borderWidth: 1,
    borderColor: '#2F6B3A',
  },

  notificationBadgeText: {
    color: '#FFFFFF',

    fontSize: 8,
    fontWeight: '800',
  },


  greetingBlock: {
    gap: 5,
  },

  greeting: {
    fontSize: 22,
    lineHeight: 28,

    fontWeight: '800',

    color: '#FFFFFF',

    letterSpacing: -0.6,
  },

  description: {
    fontSize: 12.5,

    color: 'rgba(255,255,255,0.70)',
  },


  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },

  statIconContainer: {
    width: 15,
    height: 15,
    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 8,
  },

  statCard: {
    flex: 1,

    minHeight: 50,

    backgroundColor: 'rgba(255,255,255,0.105)',

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',

    borderRadius: 15,

    paddingHorizontal: 11,
    paddingVertical: 12,

    justifyContent: 'center',
  },

  statValue: {
    fontSize: 20,

    fontWeight: '800',

    color: '#FFFFFF',

    letterSpacing: -0.5,
  },

  statLabel: {
    marginTop: 4,

    fontSize: 9.5,

    fontWeight: '800',

    color: 'rgba(255,255,255,0.76)',

    letterSpacing: 0.3,
  },

  statHint: {
    marginTop: 3,

    fontSize: 9.5,

    color: 'rgba(255,255,255,0.52)',
  },


  pressed: {
    opacity: 0.72,

    transform: [
      {
        scale: 0.97,
      },
    ],
  },
});
