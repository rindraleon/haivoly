import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { getToken } from '@/storage/authStorage';
import { colors } from '@/theme';

import { styles } from './BootstrapScreen.styles';

export default function BootstrapScreen() {
  const [token, setToken] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    let actif = true;

    const verifierSession = async () => {
      try {
        const jetonStocke = await getToken();
        if (actif) setToken(jetonStocke);
      } catch {
        if (actif) setToken(null);
      } finally {
        if (actif) setChargement(false);
      }
    };

    void verifierSession();

    // Évite une mise à jour d'état après démontage (rechargement à chaud).
    return () => {
      actif = false;
    };
  }, []);

  if (chargement) {
    return (
      <View style={styles.centre}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.texte}>Haivoly — Chargement...</Text>
      </View>
    );
  }

  return <Redirect href={token ? '/home' : '/(auth)/bienvenue'} />;
}
