import { Stack } from 'expo-router';
import { colors } from '@/design/tokens';

/**
 * Layout du groupe (app) — routes protégées
 * Organisation par domaine via groupes (home), (parcelles), (cultures),
 * (interventions), (observations), (recoltes), (common)
 * Les groupes avec parenthèses sont ignorés dans l'URL, donc
 * /(app)/(parcelles)/parcelles.tsx reste accessible à /parcelles
 * Aucun Stack.Screen explicite nécessaire — Stack détecte automatiquement
 * tous les enfants, évite les erreurs de route et simplifie la maintenabilité.
 */
export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.app },
        animation: 'slide_from_right',
      }}
    />
  );
}
