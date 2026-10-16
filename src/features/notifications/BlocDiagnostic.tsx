import { StyleSheet, View } from 'react-native';

import { env } from '@/config/env';
import { Text, useTheme } from '@/ui';

/**
 * Bandeau de diagnostic, rendu uniquement en développement (`env.isDev`).
 *
 * Il affiche deux informations déterminantes lorsqu'une synchronisation
 * échoue sur un téléphone :
 * - l'URL d'API que l'appareil appelle **réellement**, qui n'est pas
 *   nécessairement celle du serveur de développement (l'URL est dérivée de
 *   l'hôte Expo puisque `EXPO_PUBLIC_API_URL` peut être absent) ;
 * - la dernière erreur de synchronisation, distinguant une erreur réseau
 *   (le téléphone n'atteint pas la machine de dev) d'un refus HTTP.
 */
export function BlocDiagnostic({ erreur }: { erreur: string | null }) {
  const theme = useTheme();
  if (!env.isDev) return null;

  return (
    <View style={[styles.bloc, { borderTopColor: theme.couleurs.bordure, backgroundColor: theme.couleurs.surfaceAlt }]}>
      <Text variant="caption" color="texteSecondaire" selectable testID="diagnostic-api">
        API : {env.apiUrl}
      </Text>
      <Text variant="caption" color="texteSecondaire" selectable testID="diagnostic-erreur">
        Dernière erreur : {erreur ?? 'aucune'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bloc: {
    gap: 2,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
