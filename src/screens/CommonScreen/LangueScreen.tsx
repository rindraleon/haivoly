import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Check, Languages, Smartphone } from 'lucide-react-native';
import { router } from 'expo-router';

import { AppText } from '@/components/CommonComponent/AppText';
import { Card } from '@/components/CommonComponent/Card';
import { ScreenContainer } from '@/components/CommonComponent/ScreenContainer';
import {
  CHOIX_SYSTEME,
  LANGUES_DISPONIBLES,
  definirLangue,
  langueDeLAppareil,
  lireChoixLangue,
  type ChoixLangue,
} from '@/i18n';
import { colors, radius, spacing } from '@/theme';

export function LangueScreen() {
  const { t } = useTranslation();
  const [choix, setChoix] = useState<ChoixLangue>(CHOIX_SYSTEME);

  useEffect(() => {
    let actif = true;
    lireChoixLangue()
      .then((valeur) => {
        if (actif) setChoix(valeur);
      })
      .catch(() => {
        if (actif) setChoix(CHOIX_SYSTEME);
      });
    return () => {
      actif = false;
    };
  }, []);

  const selectionner = useCallback(
    async (valeur: ChoixLangue) => {
      setChoix(valeur);
      await definirLangue(valeur);
    },
    []
  );

  const options: { valeur: ChoixLangue; libelle: string; detail?: string }[] = [
    {
      valeur: CHOIX_SYSTEME,
      libelle: t('langue.systeme'),
      detail: t(`langue.${langueDeLAppareil()}`),
    },
    ...LANGUES_DISPONIBLES.map((langue) => ({
      valeur: langue as ChoixLangue,
      libelle: t(`langue.${langue}`),
    })),
  ];

  return (
    <ScreenContainer
      title={t('langue.titre')}
      subtitle={t('langue.description')}
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))}
    >
      <View style={styles.liste}>
        {options.map((option) => {
          const actif = choix === option.valeur;
          const Icone = option.valeur === CHOIX_SYSTEME ? Smartphone : Languages;

          return (
            <Card
              key={option.valeur}
              onPress={() => void selectionner(option.valeur)}
              style={[styles.carte, actif && styles.carteActive]}
            >
              <View style={styles.ligne}>
                <View
                  style={[styles.vignette, actif && styles.vignetteActive]}
                  accessibility-hidden
                >
                  <Icone
                    size={20}
                    color={actif ? colors.primary[700] : colors.neutral[600]}
                  />
                </View>

                <View style={styles.textes}>
                  <AppText variant="body" weight="medium">
                    {option.libelle}
                  </AppText>
                  {option.detail ? (
                    <AppText variant="caption" tone="muted">
                      {option.detail}
                    </AppText>
                  ) : null}
                </View>

                {actif ? (
                  <Check
                    size={20}
                    color={colors.primary[700]}
                    accessibilityLabel={option.libelle}
                  />
                ) : null}
              </View>
            </Card>
          );
        })}
      </View>
    </ScreenContainer>
  );
}

export default LangueScreen;

const styles = StyleSheet.create({
  liste: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  carte: {
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
  },
  carteActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  ligne: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  vignette: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.muted,
  },
  vignetteActive: {
    backgroundColor: colors.primary[100],
  },
  textes: {
    flex: 1,
    gap: 2,
  },
});
