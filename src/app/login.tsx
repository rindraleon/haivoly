import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLogin } from '@/hooks/useLogin';
import { saveToken } from '@/storage/authStorage';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useLogin();

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        'Champs obligatoires',
        'Veuillez saisir votre email et votre mot de passe.',
      );
      return;
    }

    loginMutation.mutate(
      {
        email: email.trim(),
        password,
      },
      {
        onSuccess: async (data) => {
          await saveToken(data.access_token);

          Alert.alert(
            'Connexion réussie',
            `Bienvenue ${data.utilisateur.prenom} ${data.utilisateur.nom}`,
            [
              {
                text: 'OK',
                onPress: () => router.replace('/'),
              },
            ],
          );
        },
        onError: (error: any) => {
          const message =
            error?.response?.data?.message ||
            'Email ou mot de passe incorrect.';

          Alert.alert('Erreur de connexion', message);
        },
      },
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          HaiVoly
        </ThemedText>

        <ThemedText style={styles.subtitle}>
          Gestion agricole
        </ThemedText>

        <View style={styles.form}>
          <ThemedText style={styles.label}>Email</ThemedText>

          <TextInput
            style={styles.input}
            placeholder="Votre email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />

          <ThemedText style={styles.label}>Mot de passe</ThemedText>

          <TextInput
            style={styles.input}
            placeholder="Votre mot de passe"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Pressable
            style={[
              styles.button,
              loginMutation.isPending && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>
                SE CONNECTER
              </ThemedText>
            )}
          </Pressable>
          <TouchableOpacity
  onPress={() => router.push('/register')}
>
  <Text>
    Pas encore de compte ? S'inscrire
  </Text>
</TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  title: {
    textAlign: 'center',
    fontSize: 36,
    fontWeight: '700',
  },

  subtitle: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 40,
  },

  form: {
    width: '100%',
    gap: 10,
  },

  label: {
    fontWeight: '600',
    marginTop: 10,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    color: '#000',
  },

  button: {
    height: 52,
    borderRadius: 10,
    backgroundColor: '#2e7d32',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});