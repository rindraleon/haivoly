import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';

import { removeToken } from '@/storage/authStorage';
import { useProfile } from '@/hooks/useProfile';

export default function Home() {
  const {
    data: utilisateur,
    isLoading,
    isError,
  } = useProfile();

  const handleLogout = async () => {
    await removeToken();
    router.replace('/login');
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
        <Text>Chargement du profil...</Text>
      </View>
    );
  }

  if (isError || !utilisateur) {
    return (
      <View style={styles.loading}>
        <Text>Impossible de récupérer le profil.</Text>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>
            Se déconnecter
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HaiVoly</Text>

      <Text style={styles.subtitle}>
        Gestion agricole
      </Text>

      <Text style={styles.welcome}>
        Bienvenue {utilisateur.prenom} {utilisateur.nom} 
      </Text>

      <Text style={styles.role}>
        {utilisateur.role === 'AGRICULTEUR'
          ? 'Agriculteur'
          : 'Propriétaire'}
      </Text>

      <TouchableOpacity
  style={styles.card}
  onPress={() => router.push('/parcelles')}
>
  <Text style={styles.cardText}>
    Mes parcelles
  </Text>
</TouchableOpacity>

      <TouchableOpacity
  style={styles.card}
  onPress={() =>
    router.push('/choisir-parcelle-culture')
  }
>
  <Text style={styles.cardText}>
    Mes cultures
  </Text>
</TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardText}>
          Mes interventions
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardText}>
          Carte GPS
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>
          Se déconnecter
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    justifyContent: 'center',
  },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
  },

  welcome: {
    fontSize: 22,
    marginBottom: 10,
  },

  role: {
    fontSize: 16,
    marginBottom: 25,
    color: '#666',
  },

  card: {
    padding: 18,
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: '#e8f5e9',
  },

  cardText: {
    fontSize: 17,
  },

  logoutButton: {
    marginTop: 30,
    padding: 15,
    alignItems: 'center',
  },

  logoutText: {
    color: 'red',
    fontSize: 16,
  },
});