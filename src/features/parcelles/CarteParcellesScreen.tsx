import { router, useLocalSearchParams } from 'expo-router';
import { GitCompareArrows, LocateFixed, ZoomIn, ZoomOut } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PanResponder, StyleSheet, View } from 'react-native';
import { G, Svg, Polygon, Text as TexteSvg } from 'react-native-svg';

import { bornerTransform, centrageForme, decompterStatutsCarte, projeterCarte } from '@/features/parcelles/reglesCarte';
import { tonStatutParcelle } from '@/features/parcelles/regles';
import { useCulturesDuCompte, useParcelles, useRecoltesDuCompte } from '@/hooks';
import type { Parcelle } from '@/types';
import { Card, EmptyState, IconButton, PrimaryButton, Skeleton, Text, Touchable, useTheme } from '@/ui';
import { Screen, TopAppBar } from '@/ui/layout';
import { formatNombreDecimal } from '@/utils/formatNombre';

const CADRE = 360;

function couleurTon(ton: string, couleurs: ReturnType<typeof useTheme>['couleurs']): { fond: string; trait: string } {
  switch (ton) {
    case 'succes':
      return { fond: couleurs.primaireConteneur, trait: couleurs.primaire };
    case 'alerte':
      return { fond: couleurs.alerteConteneur, trait: couleurs.alerte };
    default:
      return { fond: couleurs.surfaceAlt, trait: couleurs.texteTertiaire };
  }
}

/**
 * Carte des parcelles plein écran V2 (lot 6) : projection SVG partagée de
 * tous les contours du compte (positions et proportions relatives),
 * déplacement au doigt, zoom borné 1×–4×, recentrage, et panneau de
 * détail par parcelle (superficie, cultures en cours, ouverture du détail).
 * Sans dépendance cartographique ni réseau ; alternative lecteur d'écran
 * par étiquettes nommées sur chaque polygone.
 */
export function CarteParcellesScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { couleurs } = theme;
  const parcelles = useParcelles({ limit: 200 });
  const cultures = useCulturesDuCompte();
  const params = useLocalSearchParams<{ parcelleId?: string; comparer?: string }>();
  const [zoom, setZoom] = useState(1);
  // Lot 7 : tant que l'utilisateur n'a pas interagi, la parcelle demandée par
  // paramètre d'URL reste centrée et sélectionnée (état dérivé, sans effet).
  const [interaction, setInteraction] = useState(false);
  const [translation, setTranslation] = useState({ x: 0, y: 0 });
  const [selection, setSelection] = useState<string | null>(null);
  const [origine, setOrigine] = useState({ x: 0, y: 0 });
  // Lot 8 : comparaison de deux parcelles (mode dédié, sélection multiple).
  // Initialisable par paramètre d'URL (`?comparer=id1,id2`) : état dérivé au
  // premier rendu, sans effet — utile aux recettes et aux liens profonds.
  const [modeComparaison, setModeComparaison] = useState(() => Boolean(params.comparer));
  const [comparaison, setComparaison] = useState<string[]>(() =>
    params.comparer ? String(params.comparer).split(',').filter(Boolean).slice(0, 2) : [],
  );

  const liste = useMemo(() => parcelles.data?.items ?? [], [parcelles.data]);
  const projection = useMemo(
    () =>
      projeterCarte(
        liste.map((parcelle) => ({ id: parcelle.id, points: parcelle.pointsGPS ?? [] })),
        CADRE,
        CADRE,
      ),
    [liste],
  );
  const formeParId = useMemo(() => new Map(projection.formes.map((forme) => [forme.id, forme])), [projection]);
  const decompte = useMemo(() => decompterStatutsCarte(liste), [liste]);

  const formeCible = !interaction && params.parcelleId ? formeParId.get(String(params.parcelleId)) : undefined;
  const zoomEffectif = formeCible ? 2 : zoom;
  const translationEffective = formeCible ? centrageForme(formeCible, 2, CADRE) : translation;
  const selectionEffective = formeCible ? formeCible.id : selection;
  const culturesParParcelle = useMemo(() => {
    const compte = new Map<string, number>();
    for (const culture of cultures.data?.items ?? []) {
      if (culture.statut !== 'EN_COURS') continue;
      compte.set(culture.parcelleId, (compte.get(culture.parcelleId) ?? 0) + 1);
    }
    return compte;
  }, [cultures.data]);
  const recoltes = useRecoltesDuCompte();
  const recoltesParParcelle = useMemo(() => {
    const parcelleDeCulture = new Map<string, string>();
    for (const culture of cultures.data?.items ?? []) {
      parcelleDeCulture.set(culture.id, culture.parcelleId);
    }
    const kilos = new Map<string, number>();
    for (const recolte of recoltes.data ?? []) {
      const parcelleId = parcelleDeCulture.get(recolte.cultureId);
      if (!parcelleId) continue;
      kilos.set(parcelleId, (kilos.get(parcelleId) ?? 0) + (recolte.quantite ?? 0));
    }
    return kilos;
  }, [cultures.data, recoltes.data]);

  const basculerComparaison = (parcelleId: string) => {
    setComparaison((actuel) => {
      if (actuel.includes(parcelleId)) return actuel.filter((id) => id !== parcelleId);
      if (actuel.length < 2) return [...actuel, parcelleId];
      return [actuel[1], parcelleId];
    });
  };

  const parcellesComparees = comparaison
    .map((id) => liste.find((item) => item.id === id))
    .filter((item): item is Parcelle => Boolean(item));

  // recréé à chaque rendu : les gestes lisent l'état courant sans ref.
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: () => zoomEffectif > 1,
    onPanResponderGrant: () => {
      setInteraction(true);
      setOrigine({ ...translationEffective });
    },
    onPanResponderMove: (_evenement, position) => {
      const borne = bornerTransform(
        zoomEffectif,
        { x: origine.x + position.dx, y: origine.y + position.dy },
        CADRE,
      );
      setTranslation(borne.translation);
    },
  });

  const zoomer = (delta: number) => {
    const suivant = bornerTransform(zoomEffectif + delta, translationEffective, CADRE);
    setInteraction(true);
    setZoom(suivant.zoom);
    setTranslation(suivant.translation);
  };

  const parcelleSelectionnee: Parcelle | undefined = liste.find((item) => item.id === selectionEffective);

  if (parcelles.isLoading) {
    return (
      <View style={styles.racine} testID="ecran-carte-parcelles-v2">
        <TopAppBar
          title={t('ecranCarteParcelles.titre')}
          onBack={() => (router.canGoBack() ? router.back() : router.replace('/parcelles'))}
          backLabel={t('commun.actions.retour')}
        />
        <Screen scroll={false}>
          <Skeleton height={CADRE} radius={20} />
        </Screen>
      </View>
    );
  }

  return (
    <View style={styles.racine} testID="ecran-carte-parcelles-v2">
      <TopAppBar
        title={t('ecranCarteParcelles.titre')}
        subtitle={t('ecranCarteParcelles.sousTitre', { count: projection.formes.length })}
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/parcelles'))}
        backLabel={t('commun.actions.retour')}
        right={
          <View style={styles.outils}>
            <IconButton
              icon={ZoomIn}
              accessibilityLabel={t('ecranCarteParcelles.zoomPlus')}
              onPress={() => zoomer(0.5)}
              testID="carte-zoom-plus"
            />
            <IconButton
              icon={ZoomOut}
              accessibilityLabel={t('ecranCarteParcelles.zoomMoins')}
              onPress={() => zoomer(-0.5)}
              testID="carte-zoom-moins"
            />
            <IconButton
              icon={LocateFixed}
              accessibilityLabel={t('ecranCarteParcelles.recentrer')}
              onPress={() => {
                setInteraction(true);
                setZoom(1);
                setTranslation({ x: 0, y: 0 });
              }}
              testID="carte-recentrer"
            />
            <IconButton
              icon={GitCompareArrows}
              accessibilityLabel={t('ecranCarteParcelles.comparaison.bouton')}
              onPress={() => {
                setModeComparaison((actif) => !actif);
                setComparaison([]);
                setSelection(null);
                setInteraction(true);
              }}
              variant={modeComparaison ? 'surface' : 'ghost'}
              testID="carte-comparer"
            />
          </View>
        }
      />
      {parcelles.isError ? (
        <Screen>
          <EmptyState title={t('ecranCarteParcelles.erreur')} message={t('ecranCarteParcelles.erreurMessage')} testID="carte-erreur" />
        </Screen>
      ) : projection.vide ? (
        <Screen>
          <EmptyState
            title={t('ecranCarteParcelles.vide.titre')}
            message={t('ecranCarteParcelles.vide.message')}
            actionLabel={t('ecranCarteParcelles.vide.action')}
            onAction={() => router.push('/parcelles')}
            testID="carte-vide"
          />
        </Screen>
      ) : (
        <>
        <View style={styles.legende} testID="carte-legende" accessibilityLiveRegion="polite">
          {([
            ['active', decompte.actives, couleurTon('succes', couleurs)],
            ['abandonnee', decompte.abandonnees, couleurTon('alerte', couleurs)],
            ['archivee', decompte.archivees, couleurTon('neutre', couleurs)],
          ] as const).map(([cle, nombre, teinte]) => (
            <View key={cle} style={styles.itemLegende} testID={`carte-legende-${cle}`}>
              <View style={[styles.pastilleLegende, { backgroundColor: teinte.fond, borderColor: teinte.trait }]} />
              <Text variant="micro" color="texteSecondaire" tabular>
                {t(`ecranCarteParcelles.legende.${cle}`, { count: nombre })}
              </Text>
            </View>
          ))}
          {decompte.sansContour > 0 ? (
            <View style={styles.itemLegende} testID="carte-legende-sans-contour">
              <View style={[styles.pastilleLegende, styles.pastilleVide, { borderColor: couleurs.texteTertiaire }]} />
              <Text variant="micro" color="texteSecondaire" tabular>
                {t('ecranCarteParcelles.legende.sansContour', { count: decompte.sansContour })}
              </Text>
            </View>
          ) : null}
        </View>

        {modeComparaison ? (
          <View style={styles.bandeauComparaison} testID="carte-comparaison-aide" accessibilityLiveRegion="polite">
            <Text variant="caption" color="texteSecondaire">
              {comparaison.length === 2
                ? t('ecranCarteParcelles.comparaison.pret')
                : t('ecranCarteParcelles.comparaison.aide', { count: comparaison.length })}
            </Text>
          </View>
        ) : null}

        <View style={styles.cadre} {...panResponder.panHandlers}>
          <Svg
            width={CADRE}
            height={CADRE}
            viewBox={`0 0 ${CADRE} ${CADRE}`}
            accessibilityLabel={t('ecranCarteParcelles.a11y', { count: projection.formes.length })}
          >
            <Polygon points={`0,0 ${CADRE},0 ${CADRE},${CADRE} 0,${CADRE}`} fill={couleurs.fond} />
            <G
              transform={`translate(${CADRE / 2 + translationEffective.x}, ${CADRE / 2 + translationEffective.y}) scale(${zoomEffectif}) translate(${ -CADRE / 2 }, ${ -CADRE / 2 })`}
            >
              {liste.map((parcelle) => {
                const forme = formeParId.get(parcelle.id);
                if (!forme) return null;
                const teinte = couleurTon(tonStatutParcelle(parcelle.statut), couleurs);
                return (
                  <Polygon
                    key={parcelle.id}
                    points={forme.points}
                    fill={teinte.fond}
                    fillOpacity={selectionEffective === parcelle.id || comparaison.includes(parcelle.id) ? 1 : 0.75}
                    stroke={comparaison.includes(parcelle.id) ? couleurs.info : teinte.trait}
                    strokeWidth={selectionEffective === parcelle.id || comparaison.includes(parcelle.id) ? 3 : 2}
                    onPress={() => {
                      setInteraction(true);
                      if (modeComparaison) basculerComparaison(parcelle.id);
                      else setSelection(parcelle.id);
                    }}
                    accessibilityLabel={
                      t('ecranCarteParcelles.parcelleA11y', {
                        nom: parcelle.nom,
                        superficie: parcelle.superficie ? formatNombreDecimal(parcelle.superficie, 2) : '0',
                      }) + (selectionEffective === parcelle.id ? t('ecranCarteParcelles.selectionnee') : '')
                    }
                  />
                );
              })}
              {liste.map((parcelle) => {
                const forme = formeParId.get(parcelle.id);
                if (!forme) return null;
                return (
                  <TexteSvg
                    key={`label-${parcelle.id}`}
                    x={forme.centre.x}
                    y={forme.centre.y}
                    fontSize={11}
                    fill={couleurs.texte}
                    textAnchor="middle"
                  >
                    {parcelle.nom}
                  </TexteSvg>
                );
              })}
            </G>
          </Svg>
          {modeComparaison && parcellesComparees.length === 2 ? (
            <Card variant="elevated" style={styles.panneau} testID="carte-comparaison">
              <Text variant="h3" accessibilityRole="header">
                {t('ecranCarteParcelles.comparaison.titre')}
              </Text>
              <View style={styles.colonnesComparaison}>
                {parcellesComparees.map((parcelle, index) => (
                  <View
                    key={parcelle.id}
                    style={[styles.colonneComparaison, index === 0 && { borderRightWidth: 1, borderRightColor: couleurs.bordure }]}
                    testID={`carte-comparaison-colonne-${index + 1}`}
                  >
                    <Text variant="label" numberOfLines={1}>
                      {parcelle.nom}
                    </Text>
                    <Text variant="caption" color="texteSecondaire">
                      {t(`statuts.${parcelle.statut}`)}
                    </Text>
                    <Text variant="bodySmall" tabular>
                      {parcelle.superficie
                        ? t('ecranCarteParcelles.panneau.superficie', { valeur: formatNombreDecimal(parcelle.superficie, 2) })
                        : t('ecranParcelles.liste.sansSuperficie')}
                    </Text>
                    <Text variant="caption" color="texteSecondaire" tabular>
                      {t('ecranCarteParcelles.comparaison.cultures', { count: culturesParParcelle.get(parcelle.id) ?? 0 })}
                    </Text>
                    <Text variant="caption" color="texteSecondaire" tabular testID={`carte-comparaison-recolte-${index + 1}`}>
                      {t('ecranCarteParcelles.comparaison.recoltes', { valeur: formatNombreDecimal(recoltesParParcelle.get(parcelle.id) ?? 0, 1) })}
                    </Text>
                  </View>
                ))}
              </View>
              <Touchable
                onPress={() => setComparaison([])}
                feedback="opacity"
                accessibilityRole="button"
                accessibilityLabel={t('commun.actions.fermer')}
                testID="carte-comparaison-fermer"
                style={styles.fermer}
              >
                <Text variant="caption" color="texteSecondaire">
                  {t('commun.actions.fermer')}
                </Text>
              </Touchable>
            </Card>
          ) : null}
          {!modeComparaison && parcelleSelectionnee ? (
            <Card variant="elevated" style={styles.panneau} testID="carte-panneau">
              <Text variant="h3" accessibilityRole="header">
                {parcelleSelectionnee.nom}
              </Text>
              <Text variant="caption" color="texteSecondaire">
                {parcelleSelectionnee.superficie
                  ? t('ecranCarteParcelles.panneau.superficie', { valeur: formatNombreDecimal(parcelleSelectionnee.superficie, 2) })
                  : t('ecranParcelles.liste.sansSuperficie')}
                {' · '}
                {t('ecranCarteParcelles.panneau.cultures', { count: culturesParParcelle.get(parcelleSelectionnee.id) ?? 0 })}
              </Text>
              <PrimaryButton
                label={t('ecranCarteParcelles.panneau.ouvrir')}
                onPress={() => router.push({ pathname: '/detail-parcelle', params: { parcelleId: parcelleSelectionnee.id } })}
                testID="carte-panneau-ouvrir"
                fullWidth
              />
              <Touchable
                onPress={() => { setInteraction(true); setSelection(null); }}
                feedback="opacity"
                accessibilityRole="button"
                accessibilityLabel={t('commun.actions.fermer')}
                testID="carte-panneau-fermer"
                style={styles.fermer}
              >
                <Text variant="caption" color="texteSecondaire">
                  {t('commun.actions.fermer')}
                </Text>
              </Touchable>
            </Card>
          ) : null}
        </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bandeauComparaison: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 4 },
  colonnesComparaison: { flexDirection: 'row' },
  colonneComparaison: { flex: 1, gap: 2, paddingRight: 10 },
  racine: { flex: 1 },
  outils: { flexDirection: 'row', gap: 6 },
  legende: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 20, paddingTop: 4 },
  itemLegende: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  pastilleLegende: { width: 10, height: 10, borderRadius: 5, borderWidth: 1.5 },
  pastilleVide: { backgroundColor: 'transparent', borderStyle: 'dashed' },
  cadre: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  panneau: { position: 'absolute', left: 20, right: 20, bottom: 24, gap: 6 },
  fermer: { alignItems: 'center', paddingVertical: 6 },
});
