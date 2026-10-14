import { useState } from 'react';
import { i18n } from '@/i18n/instance';
import { Alert, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { CalendarDays, Wheat } from 'lucide-react-native';

import { colors } from '@/theme';
import { Button } from '@/components/CommonComponent/Button';
import { Card } from '@/components/CommonComponent/Card';
import { DateInput } from '@/components/CommonComponent/DateInput';
import { Input } from '@/components/CommonComponent/Input';
import { AppSelect } from '@/components/CommonComponent/AppSelect';
import { ParcelleFormShell } from '@/components/ParcelleComponent/ParcelleFormShell';
import { useCreateRecolte } from '@/hooks';
import { ApiError } from '@/services/http';
import { todayDateOnly, isDateOnly } from '@/utils/date';


import { styles } from './RecolteCreateScreen.styles';
const UNITES = [
  { value: 'kg', label: 'Kilogrammes (kg)' },
  { value: 'tonne', label: 'Tonnes (t)' },
  { value: 'sac', label: 'Sacs' },
  { value: 'litre', label: 'Litres (L)' },
  { value: 'unite', label: i18n.t('domaine.unites') },
];

export default function AjoutRecolteScreen() {
  const { cultureId } = useLocalSearchParams<{
    cultureId: string;
    parcelleId: string;
  }>();

  const [dateRecolte, setDateRecolte] = useState(todayDateOnly());
  const [quantite, setQuantite] = useState('');
  const [unite, setUnite] = useState('kg');
  const [prixVente, setPrixVente] = useState('');
  const [coutRecolte, setCoutRecolte] = useState('');
  const [description, setDescription] = useState('');
  const [erreurs, setErreurs] = useState<{ date?: string; quantite?: string }>({});

  const creation = useCreateRecolte();

  const valider = (): boolean => {
    const suivantes: typeof erreurs = {};

    if (!isDateOnly(dateRecolte)) {
      suivantes.date = 'Format attendu : AAAA-MM-JJ';
    }

    const quantiteNombre = Number(quantite.replace(',', '.'));
    if (!quantite.trim() || !Number.isFinite(quantiteNombre) || quantiteNombre <= 0) {
      suivantes.quantite = i18n.t('recoltes.quantiteSuperieureZero');
    }

    setErreurs(suivantes);
    return Object.keys(suivantes).length === 0;
  };

  const enregistrer = async () => {
    if (!valider()) return;

    try {
      await creation.mutateAsync({
        cultureId: cultureId as string,
        body: {
          // Date calendaire : envoyée telle quelle, jamais convertie.
          dateRecolte,
          quantite: Number(quantite.replace(',', '.')),
          unite,
          prixVente: prixVente.trim() === '' ? null : Number(prixVente.replace(',', '.')),
          coutRecolte:
            coutRecolte.trim() === '' ? null : Number(coutRecolte.replace(',', '.')),
          description: description.trim() === '' ? null : description.trim(),
          // Aucun `statut` : c'est le serveur qui passe la culture en RECOLTEE.
        },
      });

      Alert.alert(
        i18n.t('recoltes.enregistree'),
        i18n.t('recoltes.cultureMarquee'),
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (error) {
      Alert.alert(
        'Enregistrement impossible',
        error instanceof ApiError
          ? error.message
          : i18n.t('domaine.reessayerErreur'),
      );
    }
  };

  return (
    <ParcelleFormShell
      title={i18n.t('recoltes.nouvelle')}
      subtitle={i18n.t('recoltes.passageAutomatique')}
      onBack={() => router.back()}
      footer={
        <Button
          onPress={enregistrer}
          loading={creation.isPending}
          leftIcon={<Wheat size={16} color={colors.neutral[0]} />}
        >
          Enregistrer la récolte
        </Button>
      }
    >
      <Card style={styles.section}>
        <DateInput
          label={i18n.t('recoltes.dateRecolte')}
          required
          value={dateRecolte}
          onChange={setDateRecolte}
          error={erreurs.date}
          hint={i18n.t('libelles.choisirDateCalendrier')}
          leftIcon={<CalendarDays size={16} color={colors.neutral[400]} />}
        />

        <View style={styles.rowFields}>
          <View style={styles.flex}>
            <Input
              label={i18n.t('domaine.quantite')}
              required
              value={quantite}
              onChangeText={setQuantite}
              placeholder="1200"
              keyboardType="decimal-pad"
              error={erreurs.quantite}
            />
          </View>

          <View style={styles.flex}>
            <AppSelect
              label={i18n.t('domaine.unite')}
              value={unite}
              options={UNITES}
              onChange={setUnite}
              required
            />
          </View>
        </View>
      </Card>

      <Card style={styles.section}>
        <Input
          label="Prix de vente"
          value={prixVente}
          onChangeText={setPrixVente}
          placeholder="En Ariary (facultatif)"
          keyboardType="decimal-pad"
        />
        <Input
          label={i18n.t('recoltes.coutRecolte')}
          value={coutRecolte}
          onChangeText={setCoutRecolte}
          placeholder="En Ariary (facultatif)"
          keyboardType="decimal-pad"
        />
        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder={i18n.t('recoltes.conditions')}
          multiline
          numberOfLines={3}
        />
      </Card>

      <Card variant="muted">
        <Text style={styles.noteTitle}>{i18n.t('libelles.reglesServeur')}</Text>
        <Text style={styles.noteText}>
          • Une seule récolte par culture : un second enregistrement est refusé.{'\n'}
          • La date de récolte ne peut pas précéder la date de plantation.{'\n'}
          • Le passage de la culture en « Récoltée » est transactionnel : en cas
          d&apos;échec, rien n&apos;est enregistré.
        </Text>
      </Card>
    </ParcelleFormShell>
  );
}
