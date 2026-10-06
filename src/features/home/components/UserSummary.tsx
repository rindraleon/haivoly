import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { colors, radius } from '@/design/tokens';

type UserSummaryProps = {
  user: {
    prenom?: string | null;
    nom: string;
    email: string;
    role: string;
  };
  greeting: string;
};

export function UserSummary({ user, greeting }: UserSummaryProps) {
  const prenom = user.prenom?.trim();

  return (
    <Card padded={false}>
      <View style={styles.inner}>
        {/*<View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {prenom?.[0]?.toUpperCase()}
            {user.nom?.[0]?.toUpperCase()}
          </Text>
        </View>*/}

        <View style={{ flex: 1, gap: 3 }}>
          <Text style={styles.greeting}>
            {greeting}, {prenom || user.nom} 👋
          </Text>

          <Text style={styles.sub}>
            {user.role === 'AGRICULTEUR' ? 'Agriculteur' : 'Propriétaire'} •{' '}
            {user.email}
          </Text>

          <View style={styles.verified}>
            <ShieldCheck size={12} color={colors.success[600]} />
            <Text style={styles.verifiedText}>Compte vérifié</Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  inner: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  greeting: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.neutral[900],
    letterSpacing: -0.3,
  },
  sub: {
    fontSize: 12.5,
    color: colors.neutral[500],
    lineHeight: 16,
  },
  verified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: colors.success[50],
    borderWidth: 1,
    borderColor: '#ABEFC6',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.full,
    marginTop: 2,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.success[700],
  },
});