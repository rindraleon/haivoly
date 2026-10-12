import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Modal, Pressable, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { AlertTriangle, LogOut, Trash2, Info, X } from 'lucide-react-native';
import { colors, radius, shadows, spacing, typography } from '@/theme';

type Variant = 'danger' | 'primary' | 'warning' | 'info';

interface Props {
  visible: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
  icon?: React.ReactNode;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const variantCfg: Record<Variant, { bg: string; border: string; accent: string; iconBg: string; confirmBg: string }> = {
  danger: { bg: colors.error[50], border: colors.error[100], accent: colors.error[500], iconBg: '#FEF3F2', confirmBg: colors.error[500] },
  primary: { bg: colors.primary[50], border: colors.primary[100], accent: colors.primary[500], iconBg: '#EDF7ED', confirmBg: colors.primary[500] },
  warning: { bg: colors.warning[50], border: colors.warning[100], accent: colors.warning[500], iconBg: '#FFFAEB', confirmBg: colors.warning[500] },
  info: { bg: colors.info[50], border: colors.info[100], accent: colors.info[500], iconBg: '#EFF8FF', confirmBg: colors.info[500] },
};

function VariantIcon({ variant, custom }: { variant: Variant; custom?: React.ReactNode }) {
  if (custom) return <>{custom}</>;
  const size = 20;
  const color = variantCfg[variant].accent;
  if (variant === 'danger') return <Trash2 size={size} color={color} strokeWidth={2} />;
  if (variant === 'primary') return <LogOut size={size} color={color} strokeWidth={2} />;
  if (variant === 'warning') return <AlertTriangle size={size} color={color} strokeWidth={2} />;
  return <Info size={size} color={color} strokeWidth={2} />;
}

export function ConfirmDialog({
  visible,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'danger',
  icon,
  loading,
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useTranslation();
  // Les valeurs animées sont créées une seule fois via un initialiseur de
  // `useState` : aucune référence n'est lue pendant le rendu.
  const [backdrop] = useState(() => new Animated.Value(0));
  const [scale] = useState(() => new Animated.Value(0.96));
  const [translate] = useState(() => new Animated.Value(8));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdrop, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, damping: 18, stiffness: 220, mass: 0.9, useNativeDriver: true }),
        Animated.timing(translate, { toValue: 0, duration: 260, useNativeDriver: true }),
      ]).start();
    } else {
      backdrop.setValue(0);
      scale.setValue(0.96);
      translate.setValue(8);
    }
  }, [visible, backdrop, scale, translate]);

  if (!visible) return null;

  const cfg = variantCfg[variant];

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onCancel}>
      <Animated.View style={[styles.backdrop, { opacity: backdrop }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ scale }, { translateY: translate }],
              opacity: backdrop,
            },
          ]}
        >
          {/* accent */}
          <View style={[styles.accent, { backgroundColor: cfg.accent }]} />

          <View style={styles.header}>
            <View style={[styles.iconWrap, { backgroundColor: cfg.iconBg, borderColor: cfg.border }]}>
              <VariantIcon variant={variant} custom={icon} />
            </View>
            <View style={styles.titleWrap}>
              <Text style={styles.title} numberOfLines={2}>
                {title}
              </Text>
              {description ? (
                <Text style={styles.desc} numberOfLines={4}>
                  {description}
                </Text>
              ) : null}
            </View>
            <Pressable
              onPress={onCancel}
              hitSlop={8}
              style={({ pressed }) => [styles.close, pressed && { opacity: 0.7, transform: [{ scale: 0.96 }] }]}
              accessibilityRole="button"
              accessibilityLabel="Fermer"
            >
              <X size={16} color={colors.neutral[500]} />
            </Pressable>
          </View>

          {variant === 'danger' && (
            <View style={styles.warningBox}>
              <AlertTriangle size={14} color={colors.warning[600]} style={{ marginTop: 1 }} />
              <Text style={styles.warningText}>Cette action est irréversible et supprimera définitivement les données.</Text>
            </View>
          )}

          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              disabled={!!loading}
              style={({ pressed }) => [
                styles.btn,
                styles.btnGhost,
                pressed && !loading && styles.btnPressed,
                loading && styles.btnDisabled,
              ]}
            >
              <Text style={styles.btnGhostText}>{cancelLabel}</Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              disabled={!!loading}
              style={({ pressed }) => [
                styles.btn,
                { backgroundColor: cfg.confirmBg, borderColor: cfg.confirmBg },
                pressed && !loading && styles.btnPressed,
                loading && styles.btnDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  {variant === 'danger' ? (
                    <Trash2 size={16} color="white" />
                  ) : variant === 'primary' ? (
                    <LogOut size={16} color="white" />
                  ) : variant === 'warning' ? (
                    <AlertTriangle size={16} color="white" />
                  ) : (
                    <Info size={16} color="white" />
                  )}
                </>
              )}
              <Text style={styles.btnPrimaryText}>{loading ? t('commun.etats.patientez') : confirmLabel}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,.46)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: 'white',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
    ...shadows.lg,
  },
  accent: { height: 4, width: '100%' },
  header: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  titleWrap: { flex: 1, minWidth: 0, gap: 4 },
  title: {
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.weight.extrabold as any,
    color: colors.neutral[900],
    letterSpacing: -0.3,
  },
  desc: {
    fontSize: typography.size.base,
    lineHeight: 20,
    fontWeight: typography.weight.medium as any,
    color: colors.neutral[600],
  },
  close: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningBox: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: 10,
    borderRadius: radius.md,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEDF89',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  warningText: {
    flex: 1,
    fontSize: typography.size.sm,
    lineHeight: 16,
    color: '#92400E',
    fontWeight: typography.weight.semibold as any,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
    padding: spacing.lg,
    paddingTop: 4,
    alignItems: 'center',
  },
  btn: {
    minWidth: 110,
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  btnGhost: {
    backgroundColor: 'white',
    borderColor: colors.border.strong,
  },
  btnGhostText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold as any,
    color: colors.neutral[700],
  },
  btnPrimaryText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold as any,
    color: 'white',
  },
  btnPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  btnDisabled: { opacity: 0.6 },
});
