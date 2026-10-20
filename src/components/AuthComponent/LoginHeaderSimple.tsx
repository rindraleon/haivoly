import { StyleSheet, Text, View } from 'react-native';
import { i18n } from '@/i18n/instance';

import { MarqueHaivoly } from '@/components/AuthComponent/MarqueHaivoly';

export function LoginHeaderSimple() {
  return (
    <View style={styles.bloc}>
      <MarqueHaivoly taille={86} testID="login-header-logo" />
      <Text style={styles.titre}>Haivoly</Text>
      <Text style={styles.sousTitre}>{i18n.t('auth.login.sousTitre')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bloc: { alignItems: 'center', gap: 4, paddingHorizontal: 24 },
  titre: { marginTop: 2, fontSize: 21, fontWeight: '800', letterSpacing: -0.3, color: '#17301D' },
  sousTitre: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#66706A',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
});
