/**
 * useNetwork — détection connexion (expo-network) + hook
 */
import { useEffect, useState, useCallback } from 'react';
import * as Network from 'expo-network';

export function useNetwork() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(null);

  const refresh = useCallback(async () => {
    try {
      const state = await Network.getNetworkStateAsync();
      setIsConnected(state.isConnected ?? null);
      setIsInternetReachable(state.isInternetReachable ?? state.isConnected ?? null);
    } catch {
      setIsConnected(null);
      setIsInternetReachable(null);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional sync with external Network API
    refresh();
    const id = setInterval(refresh, 4000);
    return () => clearInterval(id);
  }, [refresh]);

  return { isConnected, isInternetReachable, isOnline: isInternetReachable ?? isConnected, refresh };
}

export async function getIsOnline(): Promise<boolean> {
  try {
    const s = await Network.getNetworkStateAsync();
    return !!(s.isInternetReachable ?? s.isConnected);
  } catch {
    return false;
  }
}
