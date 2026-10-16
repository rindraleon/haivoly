import { ChevronRight } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Text, Touchable } from '../primitives';
import { useTheme } from '../theme';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionAccessibilityLabel?: string;
}

export function SectionHeader({ title, subtitle, actionLabel, onAction, actionAccessibilityLabel }: SectionHeaderProps) {
  const theme = useTheme();
  return (
    <View style={styles.ligne}>
      <View style={styles.textes}>
        <Text variant="h3" accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" color="texteSecondaire">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <Touchable
          onPress={onAction}
          feedback="opacity"
          accessibilityRole="link"
          accessibilityLabel={actionAccessibilityLabel ?? actionLabel}
          style={styles.action}
          hitSlop={12}
        >
          <Text variant="label" color="primaire">
            {actionLabel}
          </Text>
          <ChevronRight size={16} color={theme.couleurs.primaire} />
        </Touchable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  ligne: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  textes: { flex: 1, gap: 2 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 2, minHeight: 32 },
});
