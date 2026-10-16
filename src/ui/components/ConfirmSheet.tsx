import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Text } from '../primitives';
import { useTheme } from '../theme';
import { AlertCard } from './AlertCard';
import { BottomSheet } from './BottomSheet';
import { PrimaryButton } from './PrimaryButton';

export interface ConfirmSheetProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
  closeLabel: string;
  /** `danger` pour une action destructive ; `primary` pour une action réversible. */
  tone?: 'primary' | 'danger';
  icon?: LucideIcon;
  loading?: boolean;
  /** Erreur affichée dans la feuille : l'utilisateur peut réessayer ou annuler. */
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  testID?: string;
}

/**
 * Confirmation en feuille basse (F-61) : conséquences expliquées, action
 * principale en haut, « Annuler » en bas (loin des taps involontaires).
 */
export function ConfirmSheet({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  closeLabel,
  tone = 'primary',
  icon: Icone,
  loading = false,
  error,
  onConfirm,
  onCancel,
  testID,
}: ConfirmSheetProps) {
  const theme = useTheme();
  const danger = tone === 'danger';

  return (
    <BottomSheet visible={visible} onClose={onCancel} closeLabel={closeLabel} dismissible={!loading} testID={testID}>
      <View style={styles.entete}>
        {Icone ? (
          <View
            style={[
              styles.pastille,
              {
                backgroundColor: danger ? theme.couleurs.erreurConteneur : theme.couleurs.primaireConteneur,
                borderRadius: theme.rayon.lg,
              },
            ]}
          >
            <Icone size={24} color={danger ? theme.couleurs.erreurTexte : theme.couleurs.surPrimaireConteneur} />
          </View>
        ) : null}
        <View style={styles.textes}>
          <Text variant="h3" accessibilityRole="header">
            {title}
          </Text>
          {message ? (
            <Text variant="body" color="texteSecondaire">
              {message}
            </Text>
          ) : null}
        </View>
      </View>
      {error ? <AlertCard tone="error" title={error} testID={testID ? `${testID}-erreur` : undefined} /> : null}
      <View style={styles.actions}>
        <PrimaryButton
          label={confirmLabel}
          variant={danger ? 'danger' : 'primary'}
          size="lg"
          fullWidth
          loading={loading}
          onPress={onConfirm}
          testID={testID ? `${testID}-confirmer` : undefined}
        />
        <PrimaryButton
          label={cancelLabel}
          variant="ghost"
          size="lg"
          fullWidth
          disabled={loading}
          onPress={onCancel}
          testID={testID ? `${testID}-annuler` : undefined}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  entete: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  pastille: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  textes: { flex: 1, gap: 6 },
  actions: { gap: 4 },
});
