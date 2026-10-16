import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react';

/**
 * Drapeau de migration V1 → V2 (migration progressive, écran par écran).
 *
 * - Valeur par défaut : `EXPO_PUBLIC_UI_VERSION` (`v1` ou `v2`), sinon `v2`.
 * - Le choix de l'utilisateur (écran Apparence) est persisté et prime.
 * - Chaque route migrée choisit son écran avec `avecVersionUi` : l'ancien
 *   écran reste disponible tant que la parité n'est pas validée.
 */
export type VersionUi = 'v1' | 'v2';

const CLE_VERSION_UI = 'haivoly:ui-version';

export function versionUiParDefaut(): VersionUi {
  return process.env.EXPO_PUBLIC_UI_VERSION === 'v1' ? 'v1' : 'v2';
}

/** Lue au démarrage, avant le premier rendu, pour éviter un flash V1/V2. */
let versionInitiale: VersionUi = versionUiParDefaut();

export async function initialiserVersionUi(): Promise<VersionUi> {
  try {
    const lue = await AsyncStorage.getItem(CLE_VERSION_UI);
    if (lue === 'v1' || lue === 'v2') versionInitiale = lue;
  } catch {
    // Lecture impossible : on garde la valeur par défaut.
  }
  return versionInitiale;
}

interface ValeurVersionUi {
  version: VersionUi;
  definirVersion: (version: VersionUi) => void;
}

const ContexteVersionUi = createContext<ValeurVersionUi>({
  version: versionUiParDefaut(),
  definirVersion: () => {},
});

export function VersionUiProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState<VersionUi>(versionInitiale);

  const definirVersion = useCallback((suivante: VersionUi) => {
    versionInitiale = suivante;
    setVersion(suivante);
    void AsyncStorage.setItem(CLE_VERSION_UI, suivante).catch(() => {
      // Un échec d'écriture ne doit pas bloquer le changement d'interface.
    });
  }, []);

  const valeur = useMemo(() => ({ version, definirVersion }), [version, definirVersion]);
  return <ContexteVersionUi.Provider value={valeur}>{children}</ContexteVersionUi.Provider>;
}

export function useVersionUi(): ValeurVersionUi {
  return useContext(ContexteVersionUi);
}

/**
 * Route versionnée : renvoie l'écran V1 ou V2 selon le drapeau. Utilisée par
 * les fichiers de `src/app` (une ligne, sans logique).
 */
export function avecVersionUi<P extends object>(ecrans: {
  v1: ComponentType<P>;
  v2: ComponentType<P>;
}): ComponentType<P> {
  const { v1: EcranV1, v2: EcranV2 } = ecrans;

  function RouteVersionnee(props: P) {
    const { version } = useVersionUi();
    return version === 'v2' ? <EcranV2 {...props} /> : <EcranV1 {...props} />;
  }

  return RouteVersionnee;
}
