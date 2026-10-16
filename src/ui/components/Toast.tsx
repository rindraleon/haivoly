import { CircleCheck, CircleX, Info, TriangleAlert, type LucideIcon } from 'lucide-react-native';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '../primitives';
import { useTheme } from '../theme';

export type ToastTone = 'success' | 'info' | 'warning' | 'error';

export interface ToastOptions {
  message: string;
  tone?: ToastTone;
  /** Durée d'affichage en ms (4 s par défaut, 6 s pour une erreur). */
  duration?: number;
}

type AfficherToast = (options: ToastOptions) => void;

const ToastContext = createContext<AfficherToast>(() => {});

/** Affiche un message bref et non bloquant (succès, information, erreur). */
export function useToast(): AfficherToast {
  return useContext(ToastContext);
}

/**
 * Hauteur dégagée sous le toast : barre d'onglets permanente (≈ 60) + pied
 * d'action collant d'un détail ou d'un formulaire (≈ 72) + marge. Le toast ne
 * masque ainsi jamais le bouton principal ni le bouton flottant.
 */
const DECALAGE_BAS = 148;

const ICONES: Record<ToastTone, LucideIcon> = {
  success: CircleCheck,
  info: Info,
  warning: TriangleAlert,
  error: CircleX,
};

/**
 * Un seul toast à la fois (le plus récent remplace le précédent). Annoncé
 * aux lecteurs d'écran, posé au-dessus de la barre d'onglets et des pieds
 * d'action collants, fermé au tap ou à la fin du délai.
 */
export function ToastProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [toast, setToast] = useState<(ToastOptions & { id: number }) | null>(null);

  const afficher = useCallback<AfficherToast>((options) => {
    setToast({ ...options, id: Date.now() });
    AccessibilityInfo.announceForAccessibility(options.message);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const delai = toast.duration ?? (toast.tone === 'error' ? 6000 : 4000);
    const minuteur = setTimeout(() => setToast(null), delai);
    return () => clearTimeout(minuteur);
  }, [toast]);

  const fermer = useCallback(() => setToast(null), []);

  return (
    <ToastContext.Provider value={afficher}>
      {children}
      {toast ? <VueToast key={toast.id} message={toast.message} tone={toast.tone ?? 'info'} onFermer={fermer} /> : null}
    </ToastContext.Provider>
  );
}

function VueToast({ message, tone, onFermer }: Readonly<{ message: string; tone: ToastTone; onFermer: () => void }>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const Icone = ICONES[tone];
  // Surface inversée : contraste maximal dans les deux thèmes ; le ton est
  // porté par l'icône et le texte, jamais par la couleur seule.
  const fond = theme.couleurs.texte;
  const encre = theme.couleurs.surface;

  return (
    <View
      pointerEvents="box-none"
      // Lot 6 : les lecteurs d'écran annoncent le toast sans voler le focus.
      accessibilityLiveRegion="polite"
      style={[styles.calque, { bottom: Math.max(insets.bottom, 8) + DECALAGE_BAS }]}
    >
      <Animated.View entering={FadeInDown.duration(220)} exiting={FadeOutDown.duration(180)} style={styles.largeur}>
        <Pressable
          onPress={onFermer}
          accessibilityRole="button"
          accessibilityLabel={message}
          testID="toast"
          style={[styles.toast, { backgroundColor: fond, borderRadius: theme.rayon.lg, boxShadow: theme.ombres.elevee }]}
        >
          <Icone size={20} color={encre} />
          <Text variant="bodyStrong" style={[styles.message, { color: encre }]}>
            {message}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  calque: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
  largeur: { width: '100%', maxWidth: 520 },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, minHeight: 52 },
  message: { flex: 1 },
});
