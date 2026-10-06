/**
 * Conteneur d'écran (`ScreenContainer`) — structure commune des écrans.
 *
 * Il porte ce qui doit être identique partout : **fond applicatif**, marges
 * sûres (`SafeAreaView` haut/bas), clavier (`KeyboardAvoidingView`), défilement
 * du contenu et zone d'action fixée en bas.
 *
 * C'est ce composant qui garantit qu'un écran de modification a exactement le
 * même fond et la même structure qu'un écran de création.
 */
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';

import { AppText } from '@/components/CommonComponent/AppText';
import { colors, radius, spacing } from '@/theme';

export interface ScreenContainerProps {
  /** En-tête affiché seulement si un titre est fourni. */
  title?: string;
  subtitle?: string | null;
  onBack?: () => void;
  /** Élément aligné à droite de l'en-tête (action, badge…). */
  headerRight?: React.ReactNode;
  /** Barre d'actions fixée en bas de l'écran. */
  footer?: React.ReactNode;
  /** `false` pour un contenu non défilant (écran plein, carte…). */
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export function ScreenContainer({
  title,
  subtitle,
  onBack,
  headerRight,
  footer,
  scroll = true,
  contentStyle,
  children,
}: ScreenContainerProps) {
  const contenu = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.content, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, styles.content, contentStyle]}>{children}</View>
  );

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {title ? (
            <View style={styles.header}>
              {onBack ? (
                <Pressable
                  onPress={onBack}
                  style={styles.backButton}
                  accessibilityRole="button"
                  accessibilityLabel="Revenir en arrière"
                >
                  <ChevronLeft size={20} color={colors.neutral[800]} />
                </Pressable>
              ) : null}

              <View style={styles.headerTexts}>
                <AppText numberOfLines={1} style={styles.title}>
                  {title}
                </AppText>
                {subtitle ? (
                  <AppText variant="subtitle" numberOfLines={1} style={styles.subtitle}>
                    {subtitle}
                  </AppText>
                ) : null}
              </View>

              {headerRight}
            </View>
          ) : null}

          {contenu}

          {footer ? (
            <SafeAreaView edges={['bottom']} style={styles.footer}>
              {footer}
            </SafeAreaView>
          ) : null}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, backgroundColor: colors.background.app },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  headerTexts: { flex: 1 },
  title: { fontSize: 19, fontWeight: '700', color: colors.neutral[900] },
  subtitle: { marginTop: 2 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['3xl'],
    gap: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background.app,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
});

export default ScreenContainer;
