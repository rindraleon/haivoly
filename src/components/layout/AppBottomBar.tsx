import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePathname, router } from 'expo-router';
import { House, MapPinned, Sprout, ClipboardList, User } from 'lucide-react-native';
import { colors, radius } from '@/design/tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const tabs = [
  { label: 'Accueil', icon: House, href: '/(app)/home' as const, match: 'home' },
  { label: 'Parcelles', icon: MapPinned, href: '/(app)/parcelles' as const, match: 'parcelles' },
  { label: 'Cultures', icon: Sprout, href: '/(app)/cultures' as const, match: 'cultures' },
  { label: 'Suivi', icon: ClipboardList, href: '/(app)/observations' as const, match: 'observations' },
  { label: 'Profil', icon: User, href: '/(app)/home' as const, match: 'profile' },
] as const;

export function AppBottomBar() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.bar}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = pathname.includes(tab.match);
          return (
            <Pressable
              key={tab.label}
              onPress={() => {
                // Pour l'instant, les routes cultures/observations nécessitent parcelleId — on redirige vers parcelles
                if (tab.match === 'cultures' || tab.match === 'observations') {
                  router.push('/(app)/parcelles' as any);
                  return;
                }
                if (tab.match === 'profile') {
                  router.push('/(app)/home' as any);
                  return;
                }
                router.push(tab.href as any);
              }}
              style={({ pressed }) => [styles.item, pressed && { opacity: 0.7 }]}
            >
              <View style={[styles.iconWrap, active && styles.iconActive]}>
                <Icon size={20} color={active ? '#FFFFFF' : colors.neutral[500]} strokeWidth={active ? 2.2 : 1.9} />
              </View>
              <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  bar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  item: { alignItems: 'center', gap: 4, minWidth: 56, paddingVertical: 4 },
  iconWrap: {
    width: 36,
    height: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconActive: { backgroundColor: colors.primary[500] },
  label: { fontSize: 10.5, fontWeight: '600', color: colors.neutral[500], letterSpacing: -0.1 },
  labelActive: { color: colors.primary[700] },
});
