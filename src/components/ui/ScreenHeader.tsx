import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, type LucideIcon } from 'lucide-react-native';
import { colors, spacing } from '@/design/tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
  icon?: LucideIcon;
}

export function ScreenHeader({ title, subtitle, showBack, onBack, right, icon: Icon }: ScreenHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) return onBack();
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.row}>
        {showBack ? (
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            hitSlop={8}
            accessibilityLabel="Retour"
            accessibilityRole="button"
          >
            <ArrowLeft size={22} color={colors.neutral[800]} strokeWidth={2.1} />
          </Pressable>
        ) : Icon ? (
          <View style={styles.iconBox}>
            <Icon size={20} color={colors.primary[500]} strokeWidth={2} />
          </View>
        ) : (
          <View style={{ width: 40 }} />
        )}

        <View style={styles.center}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.right}>{right}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    paddingBottom: 12,
    paddingHorizontal: spacing.lg,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: '#D1FADF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { flex: 1, alignItems: 'center', gap: 2 },
  title: { fontSize: 16.5, fontWeight: '700', color: colors.neutral[900], letterSpacing: -0.3, textAlign: 'center' },
  subtitle: { fontSize: 12.5, color: colors.neutral[500], textAlign: 'center' },
  right: { width: 40, alignItems: 'flex-end', justifyContent: 'center' },
  pressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
});
