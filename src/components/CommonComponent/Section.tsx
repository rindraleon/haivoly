import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';

interface SectionProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function Section({ title, subtitle, action, children }: SectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titles}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {action}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  titles: { flex: 1, gap: 2 },
  title: { fontSize: 14.5, fontWeight: '700', color: colors.neutral[900], letterSpacing: -0.2 },
  subtitle: { fontSize: 12.5, color: colors.neutral[500], lineHeight: 17 },
});
