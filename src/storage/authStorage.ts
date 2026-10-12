import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'haivoly_access_token';
const USER_ID_KEY = 'haivoly_session_user_id';
const EXPIRES_AT_KEY = 'haivoly_session_expires_at';

export interface SecureSession {
  token: string | null;
  userId: string | null;
  expiresAt: string | null;
}

function isSessionValid(session: SecureSession): boolean {
  if (!session.token || !session.userId || !session.expiresAt) return false;
  const expiration = Date.parse(session.expiresAt);
  return Number.isFinite(expiration) && expiration > Date.now();
}

/** Enregistre d'abord les métadonnées puis le jeton, dans le stockage sécurisé. */
export async function saveSession(
  token: string,
  userId: string,
  expiresAt: string,
): Promise<void> {
  if (!token.trim() || !userId.trim()) throw new Error('Session invalide.');
  if (!Number.isFinite(Date.parse(expiresAt)) || Date.parse(expiresAt) <= Date.now()) {
    throw new Error('La durée de la session reçue est invalide.');
  }

  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await Promise.all([
    SecureStore.setItemAsync(USER_ID_KEY, userId),
    SecureStore.setItemAsync(EXPIRES_AT_KEY, expiresAt),
  ]);
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

/**
 * Compatibilité pour les anciens appels : un token sans compte/expiration ne
 * constitue volontairement pas une session utilisable hors ligne.
 */
export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getSecureSession(): Promise<SecureSession> {
  const [token, userId, expiresAt] = await Promise.all([
    SecureStore.getItemAsync(TOKEN_KEY),
    SecureStore.getItemAsync(USER_ID_KEY),
    SecureStore.getItemAsync(EXPIRES_AT_KEY),
  ]);
  return { token, userId, expiresAt };
}

/** Le token n'est utilisable que jusqu'à l'expiration déclarée par le serveur. */
export async function getToken(): Promise<string | null> {
  try {
    const session = await getSecureSession();
    if (!isSessionValid(session)) {
      if (session.token) await clearToken();
      return null;
    }
    return session.token;
  } catch {
    return null;
  }
}

/** Compte actif uniquement si la session antérieure reste valide. */
export async function getActiveAccountId(): Promise<string | null> {
  try {
    const session = await getSecureSession();
    if (!isSessionValid(session)) {
      if (session.token) await clearToken();
      return null;
    }
    return session.userId;
  } catch {
    return null;
  }
}

export async function getUserId(): Promise<string | null> {
  return SecureStore.getItemAsync(USER_ID_KEY);
}

/** Déconnexion/changement de compte : efface toute la session sécurisée. */
export async function removeToken(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    SecureStore.deleteItemAsync(USER_ID_KEY),
    SecureStore.deleteItemAsync(EXPIRES_AT_KEY),
  ]);
}

/** 401/expiration : empêche toute requête, garde l'identité pour le diagnostic. */
export async function clearToken(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    SecureStore.deleteItemAsync(EXPIRES_AT_KEY),
  ]);
}

export const authStorage = {
  saveToken,
  saveSession,
  getToken,
  getUserId,
  getActiveAccountId,
  getSecureSession,
  removeToken,
  clearToken,
};

export default authStorage;
