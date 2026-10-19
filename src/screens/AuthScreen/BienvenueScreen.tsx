import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ClipboardList, Map, Sprout } from 'lucide-react-native';

import { Button } from '@/components/CommonComponent/Button';
import { MarqueHaivoly } from '@/components/AuthComponent/MarqueHaivoly';

export default function BienvenueScreen() {
  const { t } = useTranslation();

  const ouvrirConnexion = () => router.push('/(auth)/login');
  const ouvrirInscription = () => router.push('/(auth)/register');

  const fonctionnalites = [
    { icone: <Map size={17} color="#1B4E1F" strokeWidth={2.1} />, texte: t('auth.landing.foncParcelles') },
    { icone: <Sprout size={17} color="#1B4E1F" strokeWidth={2.1} />, texte: t('auth.landing.foncCultures') },
    { icone: <ClipboardList size={17} color="#1B4E1F" strokeWidth={2.1} />, texte: t('auth.landing.foncTravaux') },
  ];

  return (
    <View style={styles.root}>
      {/* Halo vert discret, même identité que l'écran de connexion */}
      <View pointerEvents="none" style={styles.haloUn} />
      <View pointerEvents="none" style={styles.haloDeux} />

      <View style={styles.centre} testID="ecran-bienvenue">
        <MarqueHaivoly taille={128} testID="logo-bienvenue" />
        <Text style={styles.titre}>{t('auth.landing.titre')}</Text>
        <Text style={styles.sousTitre}>{t('auth.landing.sousTitre')}</Text>

        <View style={styles.liste}>
          {fonctionnalites.map((f) => (
            <View key={f.texte} style={styles.item}>
              <View style={styles.itemIcone}>{f.icone}</View>
              <Text style={styles.itemTexte}>{f.texte}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <Button fullWidth size="lg" onPress={ouvrirConnexion} testID="bienvenue-se-connecter">
          {t('auth.login.seConnecter')}
        </Button>
        <View style={{ height: 12 }} />
        <Button
          fullWidth
          size="lg"
          variant="secondary"
          onPress={ouvrirInscription}
          testID="bienvenue-creer-compte"
        >
          {t('libelles.creerCompte')}
        </Button>
        <Text style={styles.pied}>{t('auth.piedDePage', { annee: new Date().getFullYear() })}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F4F2' },
  haloUn: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(46, 125, 50, 0.07)',
    top: -170,
    right: -140,
  },
  haloDeux: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(46, 125, 50, 0.05)',
    bottom: -110,
    left: -120,
  },
  centre: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    gap: 8,
  },
  titre: {
    marginTop: 8,
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '800',
    letterSpacing: -0.6,
    color: '#17301D',
    textAlign: 'center',
  },
  sousTitre: {
    marginTop: 4,
    fontSize: 13.5,
    lineHeight: 20,
    color: '#66706A',
    textAlign: 'center',
    maxWidth: 320,
  },
  liste: { marginTop: 20, gap: 10, alignSelf: 'stretch' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EBE7',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  itemIcone: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDF5EB',
  },
  itemTexte: { flex: 1, fontSize: 13.5, fontWeight: '600', color: '#2B3A30' },
  actions: { paddingHorizontal: 24, paddingBottom: 30 },
  pied: { marginTop: 18, textAlign: 'center', fontSize: 11.5, color: '#98A29A' },
});
