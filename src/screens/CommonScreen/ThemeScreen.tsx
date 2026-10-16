import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Check, LayoutTemplate, Moon, Palette, Smartphone, Sparkles, Sun } from 'lucide-react-native';
import { router } from 'expo-router';

import { AppText } from '@/components/CommonComponent/AppText';
import { Card } from '@/components/CommonComponent/Card';
import { ScreenContainer } from '@/components/CommonComponent/ScreenContainer';
import { radius, spacing } from '@/theme';
import { useTheme } from '@/hooks/common/useTheme';
import { CHOIX_THEME, type ChoixTheme } from '@/theme/preference';
import { useVersionUi, type VersionUi } from '@/features/shell/versionUi';
import { catalogueActif } from '@/features/catalogue/CatalogueScreen';

export function ThemeScreen() {
  const { t } = useTranslation();
  const { jetons, mode, choix, definirTheme } = useTheme();
  const { version, definirVersion } = useVersionUi();

  const selectionner = useCallback(
    (valeur: ChoixTheme) => {
      definirTheme(valeur);
    },
    [definirTheme],
  );

  const options: {
    valeur: ChoixTheme;
    libelle: string;
    detail: string;
    Icone: typeof Sun;
  }[] = [
    {
      valeur: 'system',
      libelle: t('theme.systeme'),
      detail: t('theme.detailSysteme'),
      Icone: Smartphone,
    },
    {
      valeur: 'light',
      libelle: t('theme.clair'),
      detail: t('theme.detailClair'),
      Icone: Sun,
    },
    {
      valeur: 'dark',
      libelle: t('theme.sombre'),
      detail: t('theme.detailSombre'),
      Icone: Moon,
    },
  ];

  return (
    <ScreenContainer
      title={t('theme.titre')}
      subtitle={t('theme.description')}
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))}
    >
      <View style={styles.liste}>
        {options.map((option) => {
          const actif = choix === option.valeur;
          const { Icone } = option;

          return (
            <Card
              key={option.valeur}
              onPress={() => selectionner(option.valeur)}
              style={[
                styles.carte,
                { borderColor: jetons.bordure.defaut, backgroundColor: jetons.fond.carte },
                actif && {
                  borderColor: jetons.primaire.base,
                  backgroundColor: jetons.primaire.clair,
                },
              ]}
            >
              <View style={styles.ligne}>
                <View
                  style={[
                    styles.vignette,
                    { backgroundColor: actif ? jetons.primaire.clair : jetons.fond.attenue },
                  ]}
                  accessibility-hidden
                >
                  <Icone
                    size={20}
                    color={actif ? jetons.primaire.base : jetons.texte.secondaire}
                  />
                </View>

                <View style={styles.textes}>
                  <AppText variant="body" weight="medium">
                    {option.libelle}
                  </AppText>
                  <AppText variant="caption" tone="muted">
                    {option.detail}
                  </AppText>
                </View>

                {actif ? (
                  <Check
                    size={20}
                    color={jetons.primaire.base}
                    accessibilityLabel={option.libelle}
                  />
                ) : null}
              </View>
            </Card>
          );
        })}

        <AppText variant="caption" tone="muted" style={styles.rappel}>
          {t('theme.systeme')} : {mode === 'dark' ? t('theme.sombre') : t('theme.clair')}
        </AppText>

        {/* Drapeau de migration V1 → V2 : l'ancien design reste disponible. */}
        <AppText variant="label" weight="semibold" style={styles.titreSection} accessibilityRole="header">
          {t('theme.designTitre')}
        </AppText>
        {(
          [
            { valeur: 'v2', libelle: t('theme.designV2'), detail: t('theme.designV2Detail'), Icone: Sparkles },
            { valeur: 'v1', libelle: t('theme.designV1'), detail: t('theme.designV1Detail'), Icone: LayoutTemplate },
          ] as { valeur: VersionUi; libelle: string; detail: string; Icone: typeof Sun }[]
        ).map((option) => {
          const actif = version === option.valeur;
          const { Icone } = option;
          return (
            <Card
              key={option.valeur}
              onPress={() => definirVersion(option.valeur)}
              style={[
                styles.carte,
                { borderColor: jetons.bordure.defaut, backgroundColor: jetons.fond.carte },
                actif && { borderColor: jetons.primaire.base, backgroundColor: jetons.primaire.clair },
              ]}
            >
              <View style={styles.ligne}>
                <View
                  style={[styles.vignette, { backgroundColor: actif ? jetons.primaire.clair : jetons.fond.attenue }]}
                  accessibility-hidden
                >
                  <Icone size={20} color={actif ? jetons.primaire.base : jetons.texte.secondaire} />
                </View>
                <View style={styles.textes}>
                  <AppText variant="body" weight="medium">
                    {option.libelle}
                  </AppText>
                  <AppText variant="caption" tone="muted">
                    {option.detail}
                  </AppText>
                </View>
                {actif ? <Check size={20} color={jetons.primaire.base} accessibilityLabel={option.libelle} /> : null}
              </View>
            </Card>
          );
        })}

        {catalogueActif() ? (
          <Card
            onPress={() => router.push('/catalogue')}
            style={[styles.carte, { borderColor: jetons.bordure.defaut, backgroundColor: jetons.fond.carte }]}
          >
            <View style={styles.ligne}>
              <View style={[styles.vignette, { backgroundColor: jetons.fond.attenue }]} accessibility-hidden>
                <Palette size={20} color={jetons.texte.secondaire} />
              </View>
              <View style={styles.textes}>
                <AppText variant="body" weight="medium">
                  {t('theme.catalogue')}
                </AppText>
              </View>
            </View>
          </Card>
        ) : null}
      </View>
    </ScreenContainer>
  );
}

export default ThemeScreen;

export { CHOIX_THEME };

const styles = StyleSheet.create({
  liste: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  carte: {
    borderWidth: 1,
    borderRadius: radius.md,
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
  },
  textes: {
    flex: 1,
    gap: 2,
  },
  rappel: {
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  titreSection: {
    marginTop: spacing.lg,
  },
});
