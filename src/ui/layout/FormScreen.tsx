import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { useTheme } from '../theme';
import { FormScrollContext, type FormScrollContextValue, type NoeudMesurable } from './FormScrollContext';
import { StickyFooter } from './StickyFooter';
import { TopAppBar } from './TopAppBar';
import { defilementPourVisibilite } from './visibilite';

export interface FormScreenProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  backLabel: string;
  /** Actions du pied collant (bouton « Enregistrer »), toujours visibles. */
  footer: ReactNode;
  children: ReactNode;
  testID?: string;
}

/**
 * Gabarit de formulaire conforme au contrat clavier (K1–K10), compatible
 * Expo Go :
 * - `KeyboardAvoidingView` en `padding` sur iOS **et** Android (le mode
 *   bord-à-bord d'Android rend `adjustResize` inopérant) ;
 * - le pied d'action est dans la zone évitée : il reste au-dessus du clavier ;
 * - le champ actif est ramené à 16 px au moins au-dessus du pied, au focus et
 *   à chaque changement de hauteur de la zone visible (ouverture du clavier) ;
 * - un tap hors champ ferme le clavier (`keyboardShouldPersistTaps="handled"`),
 *   un glissement aussi ;
 * - `KeyboardAvoidingView` compare sa position *relative* au haut du clavier
 *   (position *absolue*) : on lui fournit donc la position réelle de l'écran
 *   dans la fenêtre (`keyboardVerticalOffset`), qui change quand un bandeau
 *   (synchronisation, hors ligne) s'affiche au-dessus de la pile.
 */
export function FormScreen({ title, subtitle, onBack, backLabel, footer, children, testID }: FormScreenProps) {
  const theme = useTheme();
  const racine = useRef<View>(null);
  const [decalageFenetre, setDecalageFenetre] = useState(0);
  const defilement = useRef<ScrollView>(null);
  const contenu = useRef<View>(null);
  const champActif = useRef<NoeudMesurable>(null);
  const decalage = useRef(0);
  const hauteurVue = useRef(0);
  const marge = theme.dimensions.margeClavier;

  const assurerVisible = useCallback(
    (noeud: NoeudMesurable) => {
      const reference = contenu.current;
      if (!noeud || !reference) return;
      noeud.measureLayout(
        reference,
        (_x, y, _largeur, hauteur) => {
          const cible = defilementPourVisibilite({
            haut: y,
            bas: y + hauteur,
            decalageActuel: decalage.current,
            hauteurVue: hauteurVue.current,
            marge,
          });
          if (cible !== null) defilement.current?.scrollTo({ y: cible, animated: true });
        },
        () => {
          // Mesure impossible (champ démonté) : rien à faire.
        },
      );
    },
    [marge],
  );

  const contexte = useMemo<FormScrollContextValue>(
    () => ({
      surFocus: (noeud) => {
        champActif.current = noeud;
        // Le clavier n'est pas encore ouvert : on recadre une première fois,
        // puis à nouveau quand la zone visible rétrécit (onLayout).
        requestAnimationFrame(() => assurerVisible(noeud));
      },
      surBlur: (noeud) => {
        if (champActif.current === noeud) champActif.current = null;
      },
      assurerVisible,
    }),
    [assurerVisible],
  );

  const surMiseEnPage = useCallback(
    (event: LayoutChangeEvent) => {
      hauteurVue.current = event.nativeEvent.layout.height;
      if (champActif.current) assurerVisible(champActif.current);
    },
    [assurerVisible],
  );

  const mesurerRacine = useCallback(() => {
    racine.current?.measureInWindow((_x, y) => {
      if (Number.isFinite(y)) setDecalageFenetre(Math.max(0, y));
    });
  }, []);

  const surDefilement = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    decalage.current = event.nativeEvent.contentOffset.y;
  }, []);

  return (
    <View
      ref={racine}
      collapsable={false}
      onLayout={mesurerRacine}
      style={[styles.racine, { backgroundColor: theme.couleurs.fond }]}
      testID={testID}
    >
      <TopAppBar title={title} subtitle={subtitle} onBack={onBack} backLabel={backLabel} />
      <KeyboardAvoidingView style={styles.racine} behavior="padding" keyboardVerticalOffset={decalageFenetre}>
        <FormScrollContext.Provider value={contexte}>
          <ScrollView
            ref={defilement}
            style={styles.racine}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            onLayout={surMiseEnPage}
            onScroll={surDefilement}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            <View
              ref={contenu}
              collapsable={false}
              style={[styles.contenu, { padding: theme.dimensions.margeEcran, gap: theme.espace.lg }]}
            >
              {children}
            </View>
          </ScrollView>
        </FormScrollContext.Provider>
        <StickyFooter>{footer}</StickyFooter>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  racine: { flex: 1 },
  contenu: { paddingBottom: 32 },
});
