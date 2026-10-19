import { useMemo, useState } from 'react';
import { i18n } from '@/i18n/instance';
import { StyleSheet, Text, View } from 'react-native';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Layers,
  Save,
  SkipForward,
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
import { radius } from '@/theme';
import { useTheme } from '@/hooks/common/useTheme';
import type { Jetons } from '@/theme/jetons';
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

/**
 * Assistant de parcelle : Informations → Délimitation → Description →
 * Résumé & validation → Enregistrement.
 *
 * Règle d'or : aucune étape ne doit pouvoir piéger l'utilisateur. La
 * délimitation est facultative (elle peut être faite plus tard depuis la
 * fiche parcelle) ; si elle est commencée, 3 sommets distincts minimum sont
 * exigés, avec un message expliquant précisément ce qui manque.
 */

const NB_ETAPES = 4;

export function ParcelleWizard({
  mode,
  initialValues,
  submitting = false,
  errorMessage,
  onCancel,
  onSubmit,
}: Readonly<ParcelleWizardProps>) {
  const { jetons } = useTheme();
  const styles = useMemo(() => creerStyles(jetons), [jetons]);
  const creation = mode === 'create';
  const [etape, setEtape] = useState(0);
  const [nom, setNom] = useState(initialValues?.nom ?? '');
  const [typeSol, setTypeSol] = useState<string | null>(initialValues?.typeSol ?? null);
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [points, setPoints] = useState<PointGPS[]>(
    () => polishPolygon(initialValues?.pointsGPS ?? []) ?? [],
  );

  const ETAPES = [
    i18n.t('parcelles.etapeInformations', { defaultValue: 'Informations' }),
    i18n.t('domaine.delimitation'),
    i18n.t('parcelles.etapeDescription', { defaultValue: 'Description' }),
    i18n.t('parcelles.etapeValidation', { defaultValue: 'Validation' }),
  ];

  const centre = centroid(points);
  const superficie = formatSuperficie(points);

  // ── Validation de chaque étape ──
  const etapeValide = (index: number): boolean => {
    if (index === 0) return nom.trim().length >= 2;
    // Délimitation : 0 point (ignorée) ou ≥ 3 sommets (polygone valide).
    if (index === 1) return points.length === 0 || points.length >= 3;
    return true;
  };

  const motifBlocage = (index: number): string | null => {
    if (index === 0) return i18n.t('parcelles.nomRequis');
    if (index === 1) {
      return i18n.t('parcelles.ajoutezMoins3Sommets');
    }
    return null;
  };

  const valeurs: ParcelleWizardValues = {
    nom: nom.trim(),
    typeSol,
    description: description.trim() ? description.trim() : null,
    pointsGPS: points,
  };

  const derniere = etape === NB_ETAPES - 1;
  const suivantPossible = etapeValide(etape);
  // L'étape délimitation ne doit jamais piéger : on peut l'ignorer tant
  // qu'aucun sommet n'a été posé, ou la terminer dès 3 sommets valides.
  const etapeDelimitationIgnorable = etape === 1 && points.length < 3;

  const reculer = () => setEtape((valeur) => Math.max(valeur - 1, 0));
  const avancer = () => setEtape((valeur) => Math.min(valeur + 1, NB_ETAPES - 1));
  const ignorerDelimitation = () => {
    setPoints([]);
    setEtape(2);
  };

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
      subtitle={`Étape ${etape + 1}/${NB_ETAPES} · ${ETAPES[etape]}`}
      onBack={etape === 0 ? onCancel : reculer}
      footer={
        <View style={styles.footer}>
          {etape > 0 ? (
            <Button
              variant="outline"
              onPress={reculer}
              leftIcon={<ArrowLeft size={16} color={jetons.texte.principal} />}
              style={styles.footerButton}
            >
              Précédent
            </Button>
          ) : (
            <Button
              variant="ghost"
              onPress={onCancel}
              leftIcon={<X size={16} color={jetons.texte.principal} />}
              style={styles.footerButton}
            >
              Annuler
            </Button>
          )}

          {derniere ? (
            <Button
              onPress={() => onSubmit(valeurs)}
              loading={submitting}
              disabled={submitting}
              leftIcon={<Save size={16} color={jetons.primaire.contraste} />}
              style={styles.footerButton}
            >
              Enregistrer
            </Button>
          ) : etapeDelimitationIgnorable ? (
            <Button
              onPress={ignorerDelimitation}
              variant="outline"
              leftIcon={<SkipForward size={16} color={jetons.texte.principal} />}
              style={styles.footerButton}
            >
              Ignorer pour l’instant
            </Button>
          ) : (
            <Button
              onPress={avancer}
              disabled={!suivantPossible}
              leftIcon={<ArrowRight size={16} color={jetons.primaire.contraste} />}
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
                <Check size={12} color={jetons.primaire.contraste} />
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
            <Sprout size={16} color={jetons.primaire.base} />
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

          {!etapeValide(0) && motifBlocage(0) ? (
            <Text style={styles.aide}>{motifBlocage(0)}</Text>
          ) : null}
        </Card>
      ) : null}

      {/* Étape 2 — Délimitation (facultative) -------------------------- */}
      {etape === 1 ? (
        <Card style={styles.carte}>
          <View style={styles.entete}>
            <Layers size={16} color={jetons.primaire.base} />
            <Text style={styles.titre}>Délimitation du terrain</Text>
          </View>

          {/* État « mode délimitation » visible en permanence */}
          <View style={styles.bandeau}>
            <Layers size={14} color={jetons.primaire.base} />
            <Text style={styles.bandeauTexte}>
              Mode délimitation actif · {points.length} sommet(s)
            </Text>
          </View>

          <Text style={styles.aide}>
            Capturez votre position GPS à chaque coin, ou touchez la carte pour
            ajouter des sommets, puis déplacez un sommet pour l’ajuster. Un polygone
            valide comporte au moins 3 sommets. Cette étape est facultative : vous
            pourrez délimiter la parcelle plus tard depuis sa fiche.
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
                variant={points.length >= 3 ? 'success' : points.length > 0 ? 'warning' : 'neutral'}
              />
              {superficie ? <Badge label={`≈ ${superficie}`} variant="neutral" /> : null}
            </View>
            <View style={styles.rangeeGauche}>
              <Button
                size="sm"
                variant="ghost"
                onPress={retirerDernierPoint}
                disabled={points.length === 0}
                leftIcon={<Trash2 size={14} color={jetons.texte.principal} />}
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

          {points.length > 0 && !etapeValide(1) && motifBlocage(1) ? (
            <Text style={styles.avertissement}>{motifBlocage(1)}</Text>
          ) : null}
        </Card>
      ) : null}

      {/* Étape 3 — Description ----------------------------------------- */}
      {etape === 2 ? (
        <Card style={styles.carte}>
          <View style={styles.entete}>
            <FileText size={16} color={jetons.primaire.base} />
            <Text style={styles.titre}>Description</Text>
          </View>

          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder={i18n.t('parcelles.descriptionPlaceholder')}
            multiline
            numberOfLines={4}
            hint="Facultatif — culture prévue, accès, irrigation…"
          />
        </Card>
      ) : null}

      {/* Étape 4 — Résumé & validation ---------------------------------- */}
      {etape === 3 ? (
        <Card style={styles.carte}>
          <View style={styles.entete}>
            <Check size={16} color={jetons.primaire.base} />
            <Text style={styles.titre}>Résumé et validation</Text>
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
            <Text style={styles.cleResume}>Délimitation</Text>
            <Text style={styles.valeurResume}>
              {points.length >= 3
                ? `${points.length} sommet(s)`
                : i18n.t('parcelles.sansDelimitation', { defaultValue: 'Aucune (à faire plus tard)' })}
            </Text>
          </View>
          <View style={styles.ligneResume}>
            <Text style={styles.cleResume}>Superficie estimée</Text>
            <Text style={styles.valeurResume}>{superficie ?? i18n.t('parcelles.nonCalculee')}</Text>
          </View>

          {points.length >= 3 ? (
            <View style={styles.carteMap}>
              <ParcelleMap points={points} center={centre} style={styles.mapResume} />
            </View>
          ) : null}

          <Text style={styles.aide}>
            La superficie définitive est recalculée par le serveur à partir du polygone
            envoyé, et non par l’application mobile.
          </Text>

          {errorMessage ? <Text style={styles.erreur}>{errorMessage}</Text> : null}

          <Button
            onPress={() => onSubmit(valeurs)}
            loading={submitting}
            disabled={submitting}
            leftIcon={<Save size={16} color={jetons.primaire.contraste} />}
          >
            {creation ? i18n.t('parcelles.creer') : 'Enregistrer les modifications'}
          </Button>
        </Card>
      ) : null}

      {errorMessage && !derniere ? <Text style={styles.erreur}>{errorMessage}</Text> : null}
    </ParcelleFormShell>
  );
}

function creerStyles(jetons: Jetons) {
  return StyleSheet.create({
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
      backgroundColor: jetons.fond.attenue,
    },
    progressionPastilleActive: { backgroundColor: jetons.primaire.base },
    progressionNumero: { fontSize: 11, fontWeight: '700', color: jetons.texte.secondaire },
    texteActif: { color: jetons.primaire.contraste },
    progressionLabel: { fontSize: 10, color: jetons.texte.secondaire, textAlign: 'center' },
    progressionLabelActif: { color: jetons.primaire.base, fontWeight: '700' },
    carte: { gap: 12 },
    entete: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    titre: { fontSize: 15, fontWeight: '700', color: jetons.texte.principal },
    aide: { fontSize: 12.5, color: jetons.texte.secondaire, lineHeight: 18 },
    avertissement: { fontSize: 12.5, color: jetons.alerte.texte, lineHeight: 18, fontWeight: '600' },
    bandeau: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 10,
      borderRadius: radius.md,
      backgroundColor: jetons.primaire.clair,
      borderWidth: 1,
      borderColor: jetons.primaire.base,
    },
    bandeauTexte: { flex: 1, fontSize: 12.5, fontWeight: '600', color: jetons.primaire.base },
    carteMap: { borderRadius: radius.md, overflow: 'hidden' },
    map: { height: 300 },
    mapResume: { height: 180 },
    rangee: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    rangeeGauche: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
    ligneResume: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    cleResume: { width: 130, fontSize: 12.5, color: jetons.texte.secondaire },
    valeurResume: { flex: 1, fontSize: 13, color: jetons.texte.principal, fontWeight: '600' },
    erreur: { fontSize: 12.5, color: jetons.erreur.texte, lineHeight: 18 },
  });
}
