/**
 * Substitut de test pour `@react-native-async-storage/async-storage`.
 *
 * Le paquet réel livre de l'ESM que Jest ne transforme pas (il est dans
 * `node_modules`, donc exclu de `transform`), et il s'appuie sur un module
 * natif. Une Map en mémoire suffit : les tests vérifient la persistance
 * logique des préférences, pas le stockage Android/iOS.
 */
const memoire = new Map<string, string>();

const AsyncStorage = {
  async getItem(cle: string): Promise<string | null> {
    return memoire.get(cle) ?? null;
  },
  async setItem(cle: string, valeur: string): Promise<void> {
    memoire.set(cle, valeur);
  },
  async removeItem(cle: string): Promise<void> {
    memoire.delete(cle);
  },
  async clear(): Promise<void> {
    memoire.clear();
  },
  async getAllKeys(): Promise<string[]> {
    return [...memoire.keys()];
  },
};

export default AsyncStorage;
