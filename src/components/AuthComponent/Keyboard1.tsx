


import type { Errors } from '@/screens/AuthScreen/RegisterScreen.helpers';
import { styles } from '@/screens/AuthScreen/RegisterScreen.styles';


import { Leaf, Sprout } from 'lucide-react-native';
import type { Dispatch, SetStateAction } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { RegisterCard } from '@/components/AuthComponent/RegisterCard';
type Props = {
  clearFieldError: (field: "nom" | "prenom" | "email" | "telephone" | "password") => void;
  email: string;
  errors: Errors;
  handleRegister: () => void;
  isLoading: boolean;
  nom: string;
  password: string;
  /** Libellé affiché : `string`, pas une union de littéraux français (i18n). */
  passwordLabel: string;
  passwordScore: number;
  prenom: string;
  pwdChecks: { len: boolean; upper: boolean; lower: boolean; number: boolean; };
  setEmail: Dispatch<SetStateAction<string>>;
  setNom: Dispatch<SetStateAction<string>>;
  setPassword: Dispatch<SetStateAction<string>>;
  setPrenom: Dispatch<SetStateAction<string>>;
  setTelephone: Dispatch<SetStateAction<string>>;
  telephone: string;
};

export function Keyboard1({
  clearFieldError,
  email,
  errors,
  handleRegister,
  isLoading,
  nom,
  password,
  passwordLabel,
  passwordScore,
  prenom,
  pwdChecks,
  setEmail,
  setNom,
  setPassword,
  setPrenom,
  setTelephone,
  telephone,
}: Readonly<Props>) {
  return (
<ScrollView
  contentContainerStyle={
    styles.scroll
  }
  keyboardShouldPersistTaps="handled"
  keyboardDismissMode="on-drag"
  showsVerticalScrollIndicator={false}
>

  {}

  <View
    style={
      styles.contenu
    }
  >

    <View
      style={
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }
      }
    >

      <View
        style={
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }
        }
      >

        <Sprout
          size={13}
          color="#FFFFFF"
          strokeWidth={2}
        />

          <Text
            style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}
      >
        Haivoly
      </Text>

      </View>

      <View
        style={
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 999,
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
          }
        }
      >

        <Leaf
          size={13}
          color="#FFFFFF"
          strokeWidth={2}
        />

        <Text
          style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700', letterSpacing: 1 }}
        >
          AGRICULTURE
        </Text>

      </View>

    </View>

    <View
      style={{ gap: 8 }}
    >

      <Text
        style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '800' }}
      >
        Cultivez votre réussite.
      </Text>

      <Text
        style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 14, lineHeight: 21 }}
      >
        Gérez vos parcelles,
        cultures et activités
        agricoles simplement.
      </Text>

    </View>

    <View
      style={
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }
      }
    >

      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: '#FFFFFF',
        }}
      />

      <Text
        style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '600' }}
      >
        Votre exploitation,
        au même endroit.
      </Text>

    </View>

  </View>

  {}

  <RegisterCard
    clearFieldError={clearFieldError}
    email={email}
    errors={errors}
    handleRegister={handleRegister}
    isLoading={isLoading}
    nom={nom}
    password={password}
    passwordLabel={passwordLabel}
    passwordScore={passwordScore}
    prenom={prenom}
    pwdChecks={pwdChecks}
    setEmail={setEmail}
    setNom={setNom}
    setPassword={setPassword}
    setPrenom={setPrenom}
    setTelephone={setTelephone}
    telephone={telephone}
  />

</ScrollView>
  );
}
