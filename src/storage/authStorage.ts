import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'haivoly_access_token';

export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

/** Alias explicite utilisé par le client HTTP sur réponse 401. */
export function clearToken(): Promise<void> {
  return removeToken();
}

/** Alias groupé — évite d'importer plusieurs symboles dans chaque écran. */
export const authStorage = { saveToken, getToken, removeToken, clearToken };

export default authStorage;
