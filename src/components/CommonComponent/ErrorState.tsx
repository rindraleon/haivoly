import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { colors, radius } from '@/theme';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onBack?: () => void;
}

export function ErrorState({
  title = 'Une erreur est survenue',
  message = 'Impossible de charger les données. Vérifiez votre connexion.',
  onRetry,
  onBack,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <AlertTriangle size={22} color={colors.error[500]} strokeWidth={1.9} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.actions}>
        {onRetry ? <Button onPress={onRetry}>Réessayer</Button> : null}
        {onBack ? (
          <Button variant="outline" onPress={onBack}>
            Retour
          </Button>
        ) : null}
      </View>
    </View>
  );
}

export function InlineError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.inline}>
      <AlertTriangle size={14} color={colors.error[500]} />
      <Text style={styles.inlineText}>{message}</Text>
      {onRetry ? (
        <Text onPress={onRetry} style={styles.retry}>
          Réessayer
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10, backgroundColor: colors.background.app },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.error[50],
    borderWidth: 1,
    borderColor: colors.error[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: { fontSize: 16, fontWeight: '700', color: colors.neutral[900], textAlign: 'center' },
  message: { fontSize: 13.5, lineHeight: 20, color: colors.neutral[600], textAlign: 'center', maxWidth: 320 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.error[50],
    borderWidth: 1,
    borderColor: colors.error[200],
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inlineText: { flex: 1, fontSize: 13, color: colors.error[700], fontWeight: '500' },
  retry: { fontSize: 13, fontWeight: '700', color: colors.error[600] },
});
