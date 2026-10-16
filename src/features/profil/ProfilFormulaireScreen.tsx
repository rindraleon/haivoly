import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { validerProfil, type ValeursProfil } from '@/features/profil/regles';
import { useProfile, useUpdateProfile } from '@/hooks';
import { FormInput, PrimaryButton, Skeleton, useToast } from '@/ui';
import { FormScreen } from '@/ui/layout';

function Formulaire({ initial }: { initial: ValeursProfil }) {
  const { t } = useTranslation();
  const toast = useToast();
  const modification = useUpdateProfile();

  const [nom, setNom] = useState(initial.nom);
  const [prenom, setPrenom] = useState(initial.prenom);
  const [username, setUsername] = useState(initial.username);
  const [telephone, setTelephone] = useState(initial.telephone);
  const [erreurs, setErreurs] = useState<Partial<Record<keyof ValeursProfil, string>>>({});

  const enregistrer = useCallback(async () => {
    const valeurs = { nom, prenom, username, telephone };
    const codes = validerProfil(valeurs);
    if (Object.values(codes).some(Boolean)) {
      setErreurs({
        nom: codes.nom ? t(`profilFormulaire.erreurs.${codes.nom}`) : undefined,
        username: codes.username ? t(`profilFormulaire.erreurs.${codes.username}`) : undefined,
        telephone: codes.telephone ? t(`profilFormulaire.erreurs.${codes.telephone}`) : undefined,
      });
      return;
    }
    setErreurs({});
    try {
      await modification.mutateAsync({
        nom: nom.trim(),
        prenom: prenom.trim() || null,
        username: username.trim().toLowerCase(),
        telephone: telephone.trim() || null,
      });
      toast({ message: t('profilFormulaire.enregistre'), tone: 'success' });
      if (router.canGoBack()) router.back();
      else router.replace('/profil');
    } catch {
      toast({ message: t('profilFormulaire.erreurEnvoi'), tone: 'error' });
    }
  }, [nom, prenom, username, telephone, modification, toast, t]);

  return (
    <FormScreen
      testID="ecran-profil-formulaire-v2"
      title={t('profilFormulaire.titre')}
      subtitle={t('profilFormulaire.sousTitre')}
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/profil'))}
      backLabel={t('commun.actions.retour')}
      footer={
        <PrimaryButton
          testID="profil-enregistrer"
          label={t('profilFormulaire.enregistrer')}
          onPress={() => void enregistrer()}
          loading={modification.isPending}
        />
      }
    >
      <View style={styles.corps}>
        <FormInput
          testID="profil-nom"
          label={t('profilFormulaire.nom')}
          required
          value={nom}
          onChangeText={setNom}
          error={erreurs.nom}
          autoCapitalize="words"
        />
        <FormInput
          testID="profil-prenom"
          label={t('profilFormulaire.prenom')}
          value={prenom}
          onChangeText={setPrenom}
          autoCapitalize="words"
        />
        <FormInput
          testID="profil-username"
          label={t('profilFormulaire.identifiant')}
          required
          value={username}
          onChangeText={setUsername}
          error={erreurs.username}
          autoCapitalize="none"
          helper={t('profilFormulaire.identifiantAide')}
        />
        <FormInput
          testID="profil-telephone"
          label={t('profilFormulaire.telephone')}
          value={telephone}
          onChangeText={setTelephone}
          error={erreurs.telephone}
          keyboardType="phone-pad"
          helper={t('profilFormulaire.telephoneAide')}
        />
      </View>
    </FormScreen>
  );
}

/**
 * Modification du profil V2 (lot 5) : mêmes champs que l'écran d'origine
 * (nom, prénom, identifiant, téléphone) avec le contrat clavier `FormScreen`
 * et l'état initial venu des props (composant keyé, conforme compilateur React).
 */
export function ProfilFormulaireScreen() {
  const { t } = useTranslation();
  const profil = useProfile();

  if (profil.isLoading || profil.isPending) {
    return (
      <FormScreen
        testID="ecran-profil-formulaire-v2"
        title={t('profilFormulaire.titre')}
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/profil'))}
        backLabel={t('commun.actions.retour')}
        footer={<PrimaryButton label={t('profilFormulaire.enregistrer')} loading />}
      >
        <Skeleton height={96} radius={16} />
      </FormScreen>
    );
  }

  const donnees = profil.data;
  return (
    <Formulaire
      key={donnees?.id ?? 'profil'}
      initial={{
        nom: donnees?.nom ?? '',
        prenom: donnees?.prenom ?? '',
        username: donnees?.username ?? '',
        telephone: donnees?.telephone ?? '',
      }}
    />
  );
}

const styles = StyleSheet.create({
  corps: { gap: 16, paddingVertical: 8 },
});
