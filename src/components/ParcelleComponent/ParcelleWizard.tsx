import { useState } from 'react';
import { i18n } from '@/i18n/instance';
import { StyleSheet, Text, View } from 'react-native';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Layers,
  Save,
  Sprout,
  Trash2,
  X,
} from 'lucide-react-native';

import { ParcelleFormShell } from '@/components/ParcelleComponent/ParcelleFormShell';
import { ParcelleMap } from '@/components/ParcelleComponent/ParcelleMap';
import { CapturePositionButton } from '@/components/ParcelleComponent/CapturePositionButton';
import { AppSelect } from '@/components/CommonComponent/AppSelect';
import { Badge } from '@/components/CommonComponent/Badge';
import { Button } from '@/components/CommonComponent/Button';
import { Card } from '@/components/CommonComponent/Card';
import { Input } from '@/components/CommonComponent/Input';
import { colors, radius } from '@/theme';
import { centroid, formatSuperficie, polishPolygon } from '@/utils/parcelle';
import type { PointGPS } from '@/types';

export interface ParcelleWizardValues {
  nom: string;
  typeSol: string | null;
  description: string | null;
  pointsGPS: PointGPS[];
}

export interface ParcelleWizardInitialValues {
  id?: string;
  nom?: string | null;
  typeSol?: string | null;
  description?: string | null;
  pointsGPS?: PointGPS[] | null;
}

export interface ParcelleWizardProps {
  mode: 'create' | 'edit';
  initialValues?: ParcelleWizardInitialValues | null;
  submitting?: boolean;
  errorMessage?: string | null;
  onCancel: () => void;
  onSubmit: (values: ParcelleWizardValues) => void | Promise<void>;
}

const TYPES_SOL = [
  { value: 'ARGILEUX', label: 'Argileux' },
  { value: 'LIMONEUX', label: 'Limoneux' },
  { value: 'SABLEUX', label: 'Sableux' },
  { value: 'HUMIFERE', label: i18n.t('parcelles.humifere') },
  { value: 'CALCAIRE', label: 'Calcaire' },
  { value: 'AUTRE', label: 'Autre' },
];

const ETAPES = ['Informations', i18n.t('domaine.delimitation'), i18n.t('parcelles.resume'), 'Enregistrement'];

export function ParcelleWizard({
  mode,
  initialValues,
  submitting = false,
  errorMessage,
  onCancel,
  onSubmit,
}: Readonly<ParcelleWizardProps>) {
  const creation = mode === 'create';
  const [etape, setEtape] = useState(0);
  const [nom, setNom] = useState(initialValues?.nom ?? '');
  const [typeSol, setTypeSol] = useState<string | null>(initialValues?.typeSol ?? null);
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [points, setPoints] = useState<PointGPS[]>(
    () => polishPolygon(initialValues?.pointsGPS ?? []) ?? [],
  );

  const centre = centroid(points);
  const superficie = formatSuperficie(points);

  // ── Validation de chaque étape ──
  const etapeValide = (index: number): boolean => {
    if (index === 0) return nom.trim().length >= 2;
    if (index === 1) return points.length >= 3;
    return true;
  };

  const motifBlocage = (index: number): string | null => {
    if (index === 0) return i18n.t('parcelles.nomRequis');
    if (index === 1) return i18n.t('parcelles.ajoutezMoins3Sommets');
    return null;
  };

  const valeurs: ParcelleWizardValues = {
    nom: nom.trim(),
    typeSol,
    description: description.trim() ? description.trim() : null,
    pointsGPS: points,
  };

  const dernier = etape === ETAPES.length - 1;
  const suivantPossible = etapeValide(etape);

  const reculer = () => setEtape((valeur) => Math.max(valeur - 1, 0));
  const avancer = () => setEtape((valeur) => (etapeValide(etape) ? valeur + 1 : valeur));

  const deplacerPoint = (index: number, position: { latitude: number; longitude: number }) => {
    setPoints((actuels) =>
      actuels.map((point, rang) => (rang === index ? { ...point, ...position } : point)),
    );
  };

  const ajouterPoint = (position: { latitude: number; longitude: number }) => {
    setPoints((actuels) => [...actuels, { ...position }]);
  };

  const retirerDernierPoint = () => setPoints((actuels) => actuels.slice(0, -1));

  const reinitialiser = () => {
    setPoints([]);
  };

  return (
    <ParcelleFormShell
      title={creation ? 'Nouvelle parcelle' : i18n.t('parcelles.modifierParcelle')}
      subtitle={`Étape ${etape + 1}/${ETAPES.length} · ${ETAPES[etape]}`}
      onBack={etape === 0 ? onCancel : reculer}
      footer={
        <View style={styles.footer}>
          {etape > 0 ? (
            <Button
              variant="outline"
              onPress={reculer}
              leftIcon={<ArrowLeft size={16} color={colors.neutral[700]} />}
              style={styles.footerButton}
            >
              Précédent
            </Button>
          ) : (
            <Button
              variant="ghost"
              onPress={onCancel}
              leftIcon={<X size={16} color={colors.neutral[700]} />}
              style={styles.footerButton}
            >
              Annuler
            </Button>
          )}

          {dernier ? (
            <Button
              onPress={() => onSubmit(valeurs)}
              loading={submitting}
              disabled={submitting}
              leftIcon={<Save size={16} color={colors.neutral[0]} />}
              style={styles.footerButton}
            >
              Enregistrer
            </Button>
          ) : (
            <Button
              onPress={avancer}
              disabled={!suivantPossible}
              leftIcon={<ArrowRight size={16} color={colors.neutral[0]} />}
              style={styles.footerButton}
            >
              Suivant
            </Button>
          )}
        </View>
      }
    >
      {/* Progression -------------------------------------------------- */}
      <View style={styles.progression}>
        {ETAPES.map((libelle, index) => (
          <View key={index} style={styles.progressionEtape}>
            <View
              style={[
                styles.progressionPastille,
                index <= etape && styles.progressionPastilleActive,
              ]}
            >
              {index < etape ? (
                <Check size={12} color={colors.neutral[0]} />
              ) : (
                <Text style={[styles.progressionNumero, index <= etape && styles.texteActif]}>
                  {index + 1}
                </Text>
              )}
            </View>
            <Text
              style={[styles.progressionLabel, index === etape && styles.progressionLabelActif]}
              numberOfLines={1}
            >
              {libelle}
            </Text>
          </View>
        ))}
      </View>

      {/* Étape 1 — Informations --------------------------------------- */}
      {etape === 0 ? (
        <Card style={styles.carte}>
          <View style={styles.entete}>
            <Sprout size={16} color={colors.primary[700]} />
            <Text style={styles.titre}>{i18n.t('libelles.informationsParcelle')}</Text>
          </View>

          <Input
            label={i18n.t('libelles.nomParcelle')}
            required
            value={nom}
            onChangeText={setNom}
            placeholder="Ex. : Champ Nord"
            autoCapitalize="sentences"
          />

          <AppSelect
            label="Type de sol"
            value={typeSol}
            options={TYPES_SOL}
            onChange={setTypeSol}
            placeholder={i18n.t('parcelles.selectionnerTypeSol')}
          />

          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder={i18n.t('parcelles.descriptionPlaceholder')}
            multiline
          />

          {!etapeValide(0) && motifBlocage(0) ? (
            <Text style={styles.aide}>{motifBlocage(0)}</Text>
          ) : null}
        </Card>
      ) : null}

      {/* Étape 2 — Délimitation --------------------------------------- */}
      {etape === 1 ? (
        <Card style={styles.carte}>
          <View style={styles.entete}>
            <Layers size={16} color={colors.primary[700]} />
            <Text style={styles.titre}>Délimitation du terrain</Text>
          </View>

          {/* État « mode délimitation » visible en permanence */}
          <View style={styles.bandeau}>
            <Layers size={14} color={colors.primary[700]} />
            <Text style={styles.bandeauTexte}>
              Mode délimitation actif · {points.length} sommet(s)
            </Text>
          </View>

          <Text style={styles.aide}>
            Capturez votre position GPS à chaque coin, ou touchez la carte pour
            ajouter des sommets, puis déplacez un sommet pour l’ajuster. Un polygone
            valide comporte au moins 3 sommets.
          </Text>

          <View style={styles.carteMap}>
            <ParcelleMap
              points={points}
              center={centre}
              editable
              defaultToNearestCity={creation && points.length === 0}
              onPointMove={deplacerPoint}
              onPress={ajouterPoint}
              style={styles.map}
            />
          </View>

          <CapturePositionButton onCapture={ajouterPoint} disabled={submitting} />

          <View style={styles.rangee}>
            <View style={styles.rangeeGauche}>
              <Badge
                label={`${points.length} sommet(s)`}
                variant={points.length >= 3 ? 'success' : 'warning'}
              />
              {superficie ? <Badge label={`≈ ${superficie}`} variant="neutral" /> : null}
            </View>
            <View style={styles.rangeeGauche}>
              <Button
                size="sm"
                variant="ghost"
                onPress={retirerDernierPoint}
                disabled={points.length === 0}
                leftIcon={<Trash2 size={14} color={colors.neutral[700]} />}
              >
                Dernier point
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onPress={reinitialiser}
                disabled={points.length === 0}
              >
                Tout effacer
              </Button>
            </View>
          </View>

          {!etapeValide(1) && motifBlocage(1) ? (
            <Text style={styles.aide}>{motifBlocage(1)}</Text>
          ) : null}
        </Card>
      ) : null}

      {/* Étape 3 — Résumé --------------------------------------------- */}
      {etape === 2 ? (
        <Card style={styles.carte}>
          <View style={styles.entete}>
            <Check size={16} color={colors.primary[700]} />
            <Text style={styles.titre}>Résumé</Text>
          </View>

          <View style={styles.ligneResume}>
            <Text style={styles.cleResume}>Nom</Text>
            <Text style={styles.valeurResume}>{nom.trim() || '—'}</Text>
          </View>
          <View style={styles.ligneResume}>
            <Text style={styles.cleResume}>Type de sol</Text>
            <Text style={styles.valeurResume}>
              {TYPES_SOL.find((option) => option.value === typeSol)?.label ?? i18n.t('domaine.nonPrecise')}
            </Text>
          </View>
          <View style={styles.ligneResume}>
            <Text style={styles.cleResume}>Description</Text>
            <Text style={styles.valeurResume}>{description.trim() || '—'}</Text>
          </View>
          <View style={styles.ligneResume}>
            <Text style={styles.cleResume}>Sommets</Text>
            <Text style={styles.valeurResume}>{points.length}</Text>
          </View>
          <View style={styles.ligneResume}>
            <Text style={styles.cleResume}>Superficie estimée</Text>
            <Text style={styles.valeurResume}>{superficie ?? i18n.t('parcelles.nonCalculee')}</Text>
          </View>

          <Text style={styles.aide}>
            La superficie définitive est recalculée par le serveur à partir du polygone
            envoyé, et non par l’application mobile.
          </Text>
        </Card>
      ) : null}

      {/* Étape 4 — Enregistrement ------------------------------------- */}
      {etape === 3 ? (
        <Card style={styles.carte}>
          <View style={styles.entete}>
            <Save size={16} color={colors.primary[700]} />
            <Text style={styles.titre}>Enregistrement</Text>
          </View>

          <Text style={styles.aide}>
            {creation
              ? i18n.t('divers.wizard.creation')
              : i18n.t('divers.wizard.modification')}
          </Text>

          {superficie ? (
            <Badge label={`Superficie estimée : ${superficie}`} variant="neutral" />
          ) : null}

          {errorMessage ? <Text style={styles.erreur}>{errorMessage}</Text> : null}

          <Button
            onPress={() => onSubmit(valeurs)}
            loading={submitting}
            disabled={submitting}
            leftIcon={<Save size={16} color={colors.neutral[0]} />}
          >
            {creation ? i18n.t('parcelles.creer') : 'Enregistrer les modifications'}
          </Button>
        </Card>
      ) : null}

      {errorMessage && etape !== 3 ? <Text style={styles.erreur}>{errorMessage}</Text> : null}
    </ParcelleFormShell>
  );
}

const styles = StyleSheet.create({
  footer: { flexDirection: 'row', gap: 10 },
  footerButton: { flex: 1 },
  progression: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  progressionEtape: { flex: 1, alignItems: 'center', gap: 4 },
  progressionPastille: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[150],
  },
  progressionPastilleActive: { backgroundColor: colors.primary[500] },
  progressionNumero: { fontSize: 11, fontWeight: '700', color: colors.neutral[500] },
  texteActif: { color: colors.neutral[0] },
  progressionLabel: { fontSize: 10, color: colors.neutral[500], textAlign: 'center' },
  progressionLabelActif: { color: colors.primary[700], fontWeight: '700' },
  carte: { gap: 12 },
  entete: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titre: { fontSize: 15, fontWeight: '700', color: colors.neutral[900] },
  aide: { fontSize: 12.5, color: colors.neutral[600], lineHeight: 18 },
  bandeau: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: radius.md,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  bandeauTexte: { flex: 1, fontSize: 12.5, fontWeight: '600', color: colors.primary[700] },
  carteMap: { borderRadius: radius.md, overflow: 'hidden' },
  map: { height: 300 },
  rangee: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  rangeeGauche: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  ligneResume: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cleResume: { width: 130, fontSize: 12.5, color: colors.neutral[600] },
  valeurResume: { flex: 1, fontSize: 13, color: colors.neutral[900], fontWeight: '600' },
  erreur: { fontSize: 12.5, color: colors.error[600], lineHeight: 18 },
});
