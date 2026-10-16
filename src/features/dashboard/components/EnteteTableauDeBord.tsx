import { Bell } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Avatar, IconButton, Text, useTheme } from '@/ui';

import type { CleSalutation } from '../selectors';

interface Props {
  prenom: string;
  nomComplet: string;
  cleSalutation: CleSalutation;
  enLigne: boolean;
  nonLues: number;
  onNotifications: () => void;
  onProfil: () => void;
}

/** Salutation, état du réseau, cloche (compteur) et avatar (profil). */
export function EnteteTableauDeBord({
  prenom,
  nomComplet,
  cleSalutation,
  enLigne,
  nonLues,
  onNotifications,
  onProfil,
}: Props) {
  const { t } = useTranslation();
  const { couleurs } = useTheme();

  return (
    <View style={styles.ligne}>
      <View style={styles.textes}>
        <Text variant="bodySmall" color="texteSecondaire">
          {t(`accueil.${cleSalutation}`)}
        </Text>
        <Text variant="h1" numberOfLines={1} accessibilityRole="header">
          {prenom}
        </Text>
        <View style={styles.reseau} accessibilityLiveRegion="polite">
          <View style={[styles.point, { backgroundColor: enLigne ? couleurs.succes : couleurs.texteTertiaire }]} />
          <Text variant="caption" color="texteSecondaire">
            {enLigne ? t('tableauDeBord.enLigne') : t('tableauDeBord.horsLigne')}
          </Text>
        </View>
      </View>
      <IconButton
        icon={Bell}
        badge={nonLues}
        onPress={onNotifications}
        accessibilityLabel={t('tableauDeBord.ouvrirNotifications', { count: nonLues })}
        testID="tableau-de-bord-cloche"
      />
      <Avatar nom={nomComplet} onPress={onProfil} accessibilityLabel={t('libelles.ouvrirProfil')} />
    </View>
  );
}

const styles = StyleSheet.create({
  ligne: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  textes: { flex: 1, gap: 2 },
  reseau: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  point: { width: 8, height: 8, borderRadius: 4 },
});
