import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

export interface EtatClavier {
  visible: boolean;
  hauteur: number;
}

/**
 * État du clavier. iOS annonce le clavier avant son animation (`Will`) ;
 * Android seulement une fois affiché (`Did`).
 */
export function useClavier(): EtatClavier {
  const [etat, setEtat] = useState<EtatClavier>(etatInitialClavier);

  useEffect(() => {
    const apparition = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const disparition = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const montre = Keyboard.addListener(apparition, (e) =>
      setEtat({ visible: true, hauteur: e.endCoordinates.height }),
    );
    const cache = Keyboard.addListener(disparition, () => setEtat({ visible: false, hauteur: 0 }));
    return () => {
      montre.remove();
      cache.remove();
    };
  }, []);

  return etat;
}

/**
 * État au montage. react-native-web n'implémente ni `Keyboard.isVisible`
 * ni `Keyboard.metrics` (aperçu web de recette) : clavier réputé fermé.
 */
function etatInitialClavier(): EtatClavier {
  const clavier: Partial<Pick<typeof Keyboard, 'isVisible' | 'metrics'>> = Keyboard;
  const visible = typeof clavier.isVisible === 'function' ? clavier.isVisible() : false;
  const mesures = typeof clavier.metrics === 'function' ? clavier.metrics() : undefined;
  return { visible, hauteur: mesures?.height ?? 0 };
}
