import React, { useMemo } from 'react';
import { i18n } from '@/i18n/instance';
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
import { radius, spacing } from '@/theme';
import { useTheme } from '@/hooks/common/useTheme';
import type { Jetons } from '@/theme/jetons';

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
  const { jetons } = useTheme();
  const styles = useMemo(() => creerStyles(jetons), [jetons]);

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
                  accessibilityLabel={i18n.t('divers.revenirEnArriere')}
                >
                  <ChevronLeft size={20} color={jetons.texte.principal} />
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

/**
 * Ce composant pose le fond de tous les écrans : c'est lui qui rend le thème
 * visible immédiatement. Ses styles dépendent donc des jetons.
 */
function creerStyles(jetons: Jetons) {
  return StyleSheet.create({
    flex: { flex: 1 },
    root: { flex: 1, backgroundColor: jetons.fond.app },
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
      backgroundColor: jetons.fond.carte,
      borderWidth: 1,
      borderColor: jetons.bordure.defaut,
    },
    headerTexts: { flex: 1 },
    title: { fontSize: 19, fontWeight: '700', color: jetons.texte.principal },
    subtitle: { marginTop: 2 },
    content: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing['3xl'],
      gap: spacing.md,
    },
    footer: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      backgroundColor: jetons.fond.app,
      borderTopWidth: 1,
      borderTopColor: jetons.bordure.defaut,
    },
  });
}

export default ScreenContainer;
