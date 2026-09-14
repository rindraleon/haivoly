import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';

import { useRegister } from '@/hooks/useRegister';

export default function Register() {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');

  const registerMutation = useRegister();

  const handleRegister = () => {
    if (!nom || !prenom || !email || !password) {
      Alert.alert(
        'Champs obligatoires',
        'Veuillez remplir le nom, prénom, email et mot de passe.',
      );
      return;
    }

    registerMutation.mutate(
      {
        nom,
        prenom,
        email,
        telephone: telephone || undefined,
        password,
      },
      {
        onSuccess: () => {
          Alert.alert(
            'Inscription réussie',
            'Votre compte a été créé. Vous pouvez maintenant vous connecter.',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/login'),
              },
            ],
          );
        },

        onError: (error: any) => {
          console.log('REGISTER ERROR:', error?.response?.data);

          const message =
            error?.response?.data?.message ||
            'Une erreur est survenue lors de l’inscription.';

          Alert.alert('Inscription impossible', String(message));
        },
      },
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>HaiVoly</Text>

        <Text style={styles.subtitle}>
          Créer un compte
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Prénom"
          value={prenom}
          onChangeText={setPrenom}
        />

        <TextInput
          style={styles.input}
          placeholder="Nom"
          value={nom}
          onChangeText={setNom}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Téléphone (facultatif)"
          value={telephone}
          onChangeText={setTelephone}
          keyboardType="phone-pad"
        />

        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              CRÉER MON COMPTE
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => router.replace('/login')}
        >
          <Text style={styles.loginText}>
            Déjà un compte ? Se connecter
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 25,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 35,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },

  button: {
    height: 52,
    borderRadius: 8,
    backgroundColor: '#208AEF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  loginLink: {
    alignItems: 'center',
    marginTop: 25,
  },

  loginText: {
    fontSize: 15,
    color: '#208AEF',
  },
});