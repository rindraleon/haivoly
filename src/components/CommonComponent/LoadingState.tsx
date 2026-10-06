import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';

export function LoadingState({ message = 'Chargement...' }: { message?: string }) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
}

export function InlineLoading({ message }: { message?: string }) {
  return (
    <View style={styles.inline}>
      <ActivityIndicator size="small" color={colors.primary[500]} />
      {message ? <Text style={styles.inlineText}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.background.app },
  card: {
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingVertical: 28,
    paddingHorizontal: 24,
    minWidth: 220,
  },
  text: { fontSize: 13.5, fontWeight: '500', color: colors.neutral[600] },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, justifyContent: 'center' },
  inlineText: { fontSize: 13, color: colors.neutral[500], fontWeight: '500' },
});
