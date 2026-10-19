import type { PointGPS } from '@/types';
import { i18n } from '@/i18n/instance';
import type { CulturePolygon } from '@/screens/CultureScreen/CultureDelimiterScreen.helpers';
import { useStylesDelimitation } from '@/screens/CultureScreen/CultureDelimiterScreen.styles';
import type { Dispatch, SetStateAction } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { router } from 'expo-router';
import {
  Check,
  Hand,
  Info,
  Layers,
  MapPin,
  Scan,
  Sprout,
  TriangleAlert,
  Waypoints,
} from 'lucide-react-native';

import { Button } from '@/components/CommonComponent/Button';
import { useTheme } from '@/hooks/common/useTheme';

type Props = {
  cultureNom: string | undefined;
  culturesExistantes: CulturePolygon[];
  handleAddPointGPS: () => Promise<void>;
  handleFinish: () => Promise<void>;
  handleMapMessage: (event: any) => void;
  loading: boolean;
  mapHtml: string;
  mapKey: number;
  mode: 'manuel' | 'gps';
  pointsGPS: PointGPS[];
  setMode: Dispatch<SetStateAction<'manuel' | 'gps'>>;
  superficie: number;
};

const POINTS_REQUIS = 3;

/**
 * Vue de délimitation d'une culture : étapes guidées, carte Leaflet et
 * commandes tactiles alignées sur le design system de l'application
 * (jetons, cartes arrondies, icônes Lucide, boutons communs).
 */
export function VueDelimitation({
  cultureNom,
  culturesExistantes,
  handleAddPointGPS,
  handleFinish,
  handleMapMessage,
  loading,
  mapHtml,
  mapKey,
  mode,
  pointsGPS,
  setMode,
  superficie,
}: Props) {
  const styles = useStylesDelimitation();
  const { jetons } = useTheme();

  const nombrePoints = pointsGPS.length;
  const polygoneValide = nombrePoints >= POINTS_REQUIS;
  const pointsRestants = Math.max(0, POINTS_REQUIS - nombrePoints);
  // Étape courante : 1) mode choisi → toujours faite ; 2) ≥3 points ;
  // 3) fermer et valider.
  const etapeCourante = polygoneValide ? 3 : 2;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── En-tête ─────────────────────────────────────────────── */}
        <View style={styles.enteteCarte}>
          <View style={styles.enteteLigne}>
            <View style={styles.enteteIcone}>
              <Scan size={21} color={jetons.primaire.base} strokeWidth={2.2} />
            </View>
            <View style={styles.enteteTextes}>
              <Text style={styles.enteteSurLigne}>Délimitation</Text>
              <Text style={styles.enteteTitre}>
                {cultureNom || i18n.t('libelles.culture')}
              </Text>
              <Text style={styles.enteteNom}>Nouvelle culture</Text>
            </View>
          </View>
          <View style={styles.enteteInfo}>
            <Info size={15} color={jetons.info.base} strokeWidth={2} />
            <Text style={styles.enteteInfoTexte}>
              Tracez le contour de la culture : elle doit rester entièrement à
              l’intérieur de la parcelle, sans toucher ni chevaucher une
              culture existante.
            </Text>
          </View>
        </View>

        {/* ── Étapes ──────────────────────────────────────────────── */}
        <View
          style={styles.etapesCarte}
          accessibilityRole="progressbar"
          accessibilityLabel={`Étape ${etapeCourante} sur 3`}
        >
          {[
            { numero: 1, libelle: 'Choix du mode' },
            { numero: 2, libelle: `${POINTS_REQUIS} points minimum` },
            { numero: 3, libelle: 'Fermer et valider' },
          ].map(({ numero, libelle }, index) => {
            const faite = numero < etapeCourante;
            const active = numero === etapeCourante;
            return (
              <View key={numero} style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                {index > 0 ? <View style={styles.etapeSeparateur} /> : null}
                <View style={styles.etape}>
                  <View
                    style={[
                      styles.etapePastille,
                      active && styles.etapePastilleActive,
                      faite && styles.etapePastilleFaite,
                    ]}
                  >
                    {faite ? (
                      <Check size={13} color={jetons.primaire.contraste} strokeWidth={3} />
                    ) : (
                      <Text
                        style={[
                          styles.etapePastilleTexte,
                          active && styles.etapePastilleTexteActive,
                        ]}
                      >
                        {numero}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[styles.etapeLibelle, active && styles.etapeLibelleActive]}
                    numberOfLines={2}
                  >
                    {libelle}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* ── Légende + rappel de la règle ────────────────────────── */}
        <View style={styles.carte}>
          <View style={styles.pointsEntete}>
            <Text style={styles.carteTitre}>Légende de la carte</Text>
            <Layers size={16} color={jetons.texte.discret} strokeWidth={2} />
          </View>
          <View style={styles.legendRow}>
            <View style={styles.legendParcelle} />
            <Text style={styles.legendText}>Parcelle</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={styles.legendCultureExistante} />
            <Text style={styles.legendText}>Cultures existantes</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={styles.legendCulture} />
            <Text style={styles.legendText}>Nouvelle culture</Text>
          </View>
          <Text style={styles.legendAide}>
            Les points bleus numérotés marquent le contour de votre culture ; la
            nouvelle zone apparaît en bleu une fois 3 points placés.
          </Text>
        </View>

        {/* ── Cultures déjà délimitées ────────────────────────────── */}
        {culturesExistantes.length > 0 ? (
          <View style={styles.carte}>
            <Text style={styles.carteTitre}>
              Cultures déjà délimitées ({culturesExistantes.length})
            </Text>
            {culturesExistantes.map((culture) => (
              <View key={culture.cultureId} style={styles.existingCulture}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Sprout size={14} color={jetons.texte.secondaire} strokeWidth={2} />
                  <Text style={styles.existingNom} numberOfLines={1}>
                    {culture.cultureNom}
                  </Text>
                </View>
                <Text style={styles.existingPoints}>{culture.points.length} points</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* ── Mode d'ajout ────────────────────────────────────────── */}
        <View style={styles.modeContainer} accessibilityRole="tablist">
          <TouchableOpacity
            accessibilityRole="tab"
            accessibilityState={{ selected: mode === 'manuel' }}
            style={[styles.modeButton, mode === 'manuel' && styles.modeButtonActive]}
            onPress={() => setMode('manuel')}
            activeOpacity={0.85}
          >
            <Hand
              size={16}
              color={mode === 'manuel' ? jetons.primaire.fonce : jetons.texte.secondaire}
              strokeWidth={2}
            />
            <Text style={[styles.modeText, mode === 'manuel' && styles.modeTextActive]}>
              Manuel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="tab"
            accessibilityState={{ selected: mode === 'gps' }}
            style={[styles.modeButton, mode === 'gps' && styles.modeButtonActive]}
            onPress={() => setMode('gps')}
            activeOpacity={0.85}
          >
            <Waypoints
              size={16}
              color={mode === 'gps' ? jetons.primaire.fonce : jetons.texte.secondaire}
              strokeWidth={2}
            />
            <Text style={[styles.modeText, mode === 'gps' && styles.modeTextActive]}>
              Marchez avec le GPS
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Carte ───────────────────────────────────────────────── */}
        <View style={styles.map}>
          <WebView
            key={mapKey}
            originWhitelist={['*']}
            onMessage={handleMapMessage}
            javaScriptEnabled
            source={{ html: mapHtml }}
          />
        </View>

        {/* ── Compteur + superficie ───────────────────────────────── */}
        <View style={styles.jumeles}>
          <View style={styles.compteCarte}>
            <Text style={styles.compteLabel}>Points placés</Text>
            <Text style={styles.compteValeur}>{nombrePoints}</Text>
            <Text style={styles.compteAide}>
              {polygoneValide
                ? 'Polygone fermable ✓'
                : `Encore ${pointsRestants} point${pointsRestants > 1 ? 's' : ''} à placer`}
            </Text>
          </View>
          <View style={styles.compteCarte}>
            <Text style={styles.compteLabel}>Superficie estimée</Text>
            <Text style={styles.superficieValeur}>{superficie.toFixed(0)} m²</Text>
            <Text style={styles.superficieHectare}>
              {(superficie / 10000).toFixed(4)} ha
            </Text>
          </View>
        </View>

        {/* ── Points placés ───────────────────────────────────────── */}
        {nombrePoints > 0 ? (
          <View style={styles.carte}>
            <Text style={styles.carteTitre}>Contours posés</Text>
            <View style={styles.pointsListe}>
              {pointsGPS.map((point) => (
                <View key={point.id} style={styles.pointPuce}>
                  <Text style={styles.pointPuceNumero}>P{point.ordre}</Text>
                  <Text style={styles.pointPuceCoord}>
                    {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* ── Message de validation implicite ─────────────────────── */}
        {!polygoneValide ? (
          <View style={styles.alerteInvalide}>
            <TriangleAlert size={16} color={jetons.alerte.base} strokeWidth={2} />
            <Text style={styles.alerteInvalideTexte}>
              {mode === 'manuel'
                ? `Touchez la carte pour poser un point. La validation sera possible avec au moins ${POINTS_REQUIS} points (encore ${pointsRestants}).`
                : `Utilisez le bouton GPS pour poser votre position. La validation sera possible avec au moins ${POINTS_REQUIS} points (encore ${pointsRestants}).`}
            </Text>
          </View>
        ) : null}

        {/* ── Actions ─────────────────────────────────────────────── */}
        {mode === 'gps' ? (
          <Button
            onPress={() => void handleAddPointGPS()}
            loading={loading}
            variant="secondary"
            fullWidth
            leftIcon={<MapPin size={16} color={jetons.primaire.fonce} />}
          >
            Ajouter ma position GPS
          </Button>
        ) : null}

        <Button
          onPress={() => void handleFinish()}
          loading={loading}
          disabled={!polygoneValide}
          fullWidth
          rightIcon={<Check size={16} color={jetons.primaire.contraste} />}
        >
          {polygoneValide ? 'Valider la délimitation' : `Valider (${pointsRestants} point${pointsRestants > 1 ? 's' : ''} manquant${pointsRestants > 1 ? 's' : ''})`}
        </Button>

        <Button variant="ghost" onPress={() => router.back()} disabled={loading} fullWidth>
          Annuler
        </Button>
      </ScrollView>
    </View>
  );
}
