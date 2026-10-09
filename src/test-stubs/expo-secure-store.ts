const memoire = new Map<string, string>();

export async function setItemAsync(cle: string, valeur: string): Promise<void> {
  memoire.set(cle, valeur);
}

export async function getItemAsync(cle: string): Promise<string | null> {
  return memoire.get(cle) ?? null;
}

export async function deleteItemAsync(cle: string): Promise<void> {
  memoire.delete(cle);
}
