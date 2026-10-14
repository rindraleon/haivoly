import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Check, ChevronLeft, WifiOff } from 'lucide-react-native';

import { useProfile, useUpdateProfile } from '@/hooks/profile';
import type { Utilisateur } from '@/types';
import { useNetwork } from '@/hooks/common/useNetwork';
import { messageErreur, erreursParChamp } from '@/utils/erreur';
import { CLE_ERREUR_PSEUDO, normaliserPseudo, validerPseudo } from '@/utils/pseudo';
import { colors, radius } from '@/theme';

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const { isOnline } = useNetwork();
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const mutation = useUpdateProfile();
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [username, setUsername] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');
  const [noticeKind, setNoticeKind] = useState<'success' | 'info' | 'error' | null>(null);

  const [synchronise, setSynchronise] = useState<Utilisateur | null>(null);
  if (profile && profile !== synchronise) {
    setSynchronise(profile);
    setNom(profile.nom ?? '');
    setPrenom(profile.prenom ?? '');
    setTelephone(profile.telephone ?? '');
    setUsername(profile.username ?? '');
  }

  const dirty = useMemo(() => {
    if (!profile) return false;
    return (
      nom.trim() !== profile.nom ||
      prenom.trim() !== (profile.prenom ?? '') ||
      telephone.trim() !== (profile.telephone ?? '') ||
      // Comparer la forme normalisée : « @José » et « jose » sont le même nom.
      normaliserPseudo(username) !== (profile.username ?? '')
    );
  }, [nom, prenom, profile, telephone, username]);

  const submit = async () => {
    if (!profile || mutation.isPending) return;
    setErrors({});
    setNotice('');
    setNoticeKind(null);

    const nextErrors: Record<string, string> = {};
    if (nom.trim().length < 2) nextErrors.nom = t('profil.edition.nomInvalide');
    if (nom.trim().length > 80) nextErrors.nom = t('profil.edition.nomTropLong');
    if (prenom.trim().length > 80) nextErrors.prenom = t('profil.edition.prenomTropLong');
    if (telephone.trim().length > 30) nextErrors.telephone = t('profil.edition.telephoneTropLong');

    // Le nom d'utilisateur public ne peut pas être effacé une fois attribué, et
    // doit respecter la même règle que le serveur (miroir dans utils/pseudo).
    if (!username.trim() && profile.username) {
      nextErrors.username = t('pseudo.erreur.requis');
    } else if (username.trim() && username.trim() !== (profile.username ?? '')) {
      const verdict = validerPseudo(username);
      if (!verdict.valide && verdict.motif) nextErrors.username = t(CLE_ERREUR_PSEUDO[verdict.motif]);
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    if (isOnline !== true) {
      setNotice(t('profil.edition.horsLigne'));
      setNoticeKind('info');
      return;
    }

    const patch: {
      nom?: string;
      prenom?: string | null;
      telephone?: string | null;
      username?: string;
    } = {};
    if (nom.trim() !== profile.nom) patch.nom = nom.trim();
    if (prenom.trim() !== (profile.prenom ?? '')) patch.prenom = prenom.trim() || null;
    if (telephone.trim() !== (profile.telephone ?? '')) patch.telephone = telephone.trim() || null;
    const pseudo = normaliserPseudo(username);
    if (pseudo && pseudo !== (profile.username ?? '')) patch.username = pseudo;

    if (Object.keys(patch).length === 0) {
      setNotice(t('profil.edition.aucunChangement'));
      setNoticeKind('info');
      return;
    }

    try {
      await mutation.mutateAsync(patch);
      setNotice(t('profil.edition.succes'));
      setNoticeKind('success');
    } catch (cause) {
      setErrors(erreursParChamp(cause));
      setNotice(messageErreur(cause, t('profil.edition.echec')));
      setNoticeKind('error');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary[600]} />
        <Text style={styles.muted}>{t('profil.chargement')}</Text>
      </View>
    );
  }

  if (isError || !profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>{t('profil.erreurTitre')}</Text>
        <Text style={styles.muted}>{t('profil.erreurTexte')}</Text>
        <Pressable onPress={() => void refetch()} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>{t('commun.actions.reessayer')}</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.linkText}>{t('auth.verify.retourConnexion')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button">
            <ChevronLeft size={18} color={colors.primary[700]} />
            <Text style={styles.backText}>{t('commun.actions.precedent')}</Text>
          </Pressable>
          <Text style={styles.title}>{t('profil.edition.titre')}</Text>
          <Text style={styles.muted}>{t('profil.edition.sousTitre')}</Text>

          {isOnline === false && (
            <View style={styles.offlineNotice} accessibilityLiveRegion="polite">
              <WifiOff size={16} color={colors.warning[600]} />
              <Text style={styles.offlineText}>{t('profil.edition.horsLigne')}</Text>
            </View>
          )}

          <Field
            label={t('profil.edition.nom')}
            value={nom}
            onChangeText={(value) => { setNom(value); setNotice(''); setNoticeKind(null); setErrors((current) => ({ ...current, nom: '' })); }}
            error={errors.nom}
            autoComplete="name"
          />
          <Field
            label={t('profil.edition.prenom')}
            value={prenom}
            onChangeText={(value) => { setPrenom(value); setNotice(''); setNoticeKind(null); setErrors((current) => ({ ...current, prenom: '' })); }}
            error={errors.prenom}
            autoComplete="given-name"
          />
          <Field
            label={t('profil.edition.telephone')}
            value={telephone}
            onChangeText={(value) => { setTelephone(value); setNotice(''); setNoticeKind(null); setErrors((current) => ({ ...current, telephone: '' })); }}
            error={errors.telephone}
            keyboardType="phone-pad"
            autoComplete="tel"
          />
          <Field
            label={t('pseudo.label')}
            value={username}
            onChangeText={(value) => { setUsername(value); setNotice(''); setNoticeKind(null); setErrors((current) => ({ ...current, username: '' })); }}
            error={errors.username}
            hint={
              username.trim() && username.trim() !== (profile.username ?? '')
                ? t('pseudo.apercu', { pseudo: normaliserPseudo(username) })
                : t('pseudo.nonModifiable')
            }
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.readOnly}>
            <Text style={styles.label}>{t('profil.edition.email')}</Text>
            <Text style={styles.readOnlyValue}>{profile.email}</Text>
            <Text style={styles.helper}>{t('profil.edition.emailNonModifiable')}</Text>
          </View>

          {!!notice && (
            <View
              style={noticeKind === 'success' ? styles.successNotice : noticeKind === 'error' ? styles.errorNotice : styles.offlineNotice}
              accessibilityLiveRegion="polite"
            >
              {noticeKind === 'success' && <Check size={16} color={colors.primary[700]} />}
              <Text style={noticeKind === 'success' ? styles.successText : noticeKind === 'error' ? styles.errorText : styles.offlineText}>
                {notice}
              </Text>
            </View>
          )}

          <Pressable
            accessibilityRole="button"
            onPress={() => void submit()}
            disabled={mutation.isPending || !dirty || isOnline !== true}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
              (mutation.isPending || !dirty || isOnline !== true) && styles.disabled,
            ]}
          >
            {mutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryText}>{t('profil.edition.enregistrer')}</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  /** Aide sous le champ : aperçu de la forme enregistrée ou contrainte à connaître. */
  hint?: string;
  autoComplete?: 'name' | 'given-name' | 'tel';
  keyboardType?: 'default' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
};

function Field({
  label,
  value,
  onChangeText,
  error,
  hint,
  autoComplete,
  keyboardType = 'default',
  autoCapitalize,
  autoCorrect,
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, !!error && styles.inputError]}
        accessibilityLabel={label}
        aria-invalid={!!error}
        autoComplete={autoComplete}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        returnKeyType="next"
      />
      {!!error && <Text style={styles.fieldError}>{error}</Text>}
      {!error && !!hint && <Text style={styles.helper}>{hint}</Text>}
    </View>
  );
}

const styles = {
  root: { flex: 1, backgroundColor: colors.background.app },
  scroll: { flexGrow: 1, padding: 18, justifyContent: 'center' as const },
  card: {
    width: '100%' as const,
    maxWidth: 520,
    alignSelf: 'center' as const,
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: 22,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  center: { flex: 1, alignItems: 'center' as const, justifyContent: 'center' as const, gap: 12, padding: 24, backgroundColor: colors.background.app },
  backButton: { minHeight: 40, flexDirection: 'row' as const, alignItems: 'center' as const, gap: 4, alignSelf: 'flex-start' as const },
  backText: { color: colors.primary[700], fontSize: 13, fontWeight: '700' as const },
  backLink: { minHeight: 44, justifyContent: 'center' as const, alignItems: 'center' as const },
  linkText: { color: colors.primary[700], fontSize: 13, fontWeight: '700' as const },
  title: { fontSize: 22, fontWeight: '800' as const, color: colors.neutral[900] },
  muted: { color: colors.neutral[500], fontSize: 13.5, lineHeight: 19 },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '700' as const, color: colors.neutral[700] },
  input: { minHeight: 48, borderWidth: 1, borderColor: colors.border.default, borderRadius: radius.md, paddingHorizontal: 12, color: colors.neutral[900], fontSize: 14, backgroundColor: '#FFFFFF' },
  inputError: { borderColor: colors.error[500] },
  fieldError: { color: colors.error[700], fontSize: 12.5 },
  readOnly: { gap: 5, paddingVertical: 4 },
  readOnlyValue: { fontSize: 14, color: colors.neutral[700], padding: 12, borderRadius: radius.md, backgroundColor: colors.neutral[50] },
  helper: { fontSize: 12, color: colors.neutral[500] },
  offlineNotice: { flexDirection: 'row' as const, gap: 8, alignItems: 'center' as const, padding: 12, borderRadius: radius.md, backgroundColor: colors.warning[50] },
  offlineText: { flex: 1, color: colors.warning[600], fontSize: 12.5, lineHeight: 18 },
  successNotice: { flexDirection: 'row' as const, gap: 8, alignItems: 'center' as const, padding: 12, borderRadius: radius.md, backgroundColor: colors.primary[50] },
  successText: { flex: 1, color: colors.primary[700], fontSize: 13, lineHeight: 18 },
  errorNotice: { padding: 12, borderRadius: radius.md, backgroundColor: colors.error[50] },
  errorText: { color: colors.error[700], fontSize: 13, lineHeight: 18 },
  primaryButton: { minHeight: 48, alignItems: 'center' as const, justifyContent: 'center' as const, paddingHorizontal: 16, borderRadius: radius.md, backgroundColor: colors.primary[600] },
  primaryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' as const },
  secondaryButton: { minHeight: 44, alignItems: 'center' as const, justifyContent: 'center' as const, paddingHorizontal: 16, borderRadius: radius.md, backgroundColor: colors.primary[50] },
  secondaryText: { color: colors.primary[700], fontWeight: '700' as const },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.48 },
};
