import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'haivoly_access_token';

// Web : SecureStore n'existe pas → fallback localStorage
const isWeb = Platform.OS === 'web';

export async function saveToken(token: string): Promise<void> {
  if (isWeb) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {}
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  if (isWeb) {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }
  // Sur natif, SecureStore peut parfois être undefined si le module n'est pas lié
  try {
    // @ts-ignore
    if (!SecureStore || typeof SecureStore.getItemAsync !== 'function') return null;
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function removeToken(): Promise<void> {
  if (isWeb) {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
    return;
  }
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {}
}

// Compat web pour les anciens imports
export const authStorage = { saveToken, getToken, removeToken };
