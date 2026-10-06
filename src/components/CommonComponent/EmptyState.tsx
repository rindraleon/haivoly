import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '@/theme';
import { Button } from './Button';
import type { LucideIcon } from 'lucide-react-native';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {Icon && (
        <View style={styles.iconWrap}>
          <Icon size={26} color={colors.neutral[400]} strokeWidth={1.7} />
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <View style={styles.actions}>
          <Button onPress={onAction} size="md">
            {actionLabel}
          </Button>
          {secondaryLabel && onSecondary ? (
            <Button variant="outline" onPress={onSecondary} size="md">
              {secondaryLabel}
            </Button>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
    gap: 10,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.xl,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: { fontSize: 16, fontWeight: '700', color: colors.neutral[800], textAlign: 'center' },
  description: { fontSize: 13.5, lineHeight: 20, color: colors.neutral[500], textAlign: 'center', maxWidth: 320 },
  actions: { marginTop: 8, gap: 10, width: '100%', maxWidth: 320 },
});
