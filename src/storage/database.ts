import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageKeys = {
  OFFLINE_QUEUE: 'haivoly:offline:queue',
  OFFLINE_ACTIONS: 'haivoly:offline:actions', // alias
  SYNC_META: 'haivoly:sync:meta',
  NOTIFICATIONS: 'haivoly:notifications',
  RECOMMENDATIONS: 'haivoly:recommendations',
} as const;

export async function getItem<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeItem(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export async function updateItem<T>(key: string, updater: (prev: T) => T, fallback: T): Promise<T> {
  const prev = await getItem<T>(key, fallback);
  const next = updater(prev);
  await setItem(key, next);
  return next;
}
