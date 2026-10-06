import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { getToken } from '@/storage/authStorage';
import { colors } from '@/design/tokens';

export default function Index() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedToken = await getToken();
        setToken(storedToken);
      } catch {
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.app, gap: 12 }}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={{ fontSize: 13, color: colors.neutral[500], fontWeight: '500' }}>Haivoly — Chargement...</Text>
      </View>
    );
  }

  if (token) return <Redirect href="/home" />;
  return <Redirect href="/(auth)/login" />;
}
