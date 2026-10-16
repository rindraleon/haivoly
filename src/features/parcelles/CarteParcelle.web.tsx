import { MapPinOff } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Polygon } from 'react-native-svg';

import { Text, projeterPolygone, useTheme } from '@/ui';

import type { CarteParcelleProps } from './carteParcelle.types';

/**
 * Aperçu web (export de recette) : la carte Leaflet repose sur une WebView,
 * absente du web. On dessine le contour enregistré en SVG, sans fond de carte.
 */
export function CarteParcelle({ points, hauteur, libelleApercu, libelleSansContour }: CarteParcelleProps) {
  const theme = useTheme();
  const [largeur, setLargeur] = useState(0);
  // Le contour occupe la zone au-dessus de la bande réservée à la mention :
  // aucun sommet n'est jamais masqué par celle-ci.
  const zoneDessin = hauteur - BANDE_MENTION;
  const contour = largeur > 0 ? projeterPolygone(points, largeur, zoneDessin, 24) : null;
  const sommets = contour ? contour.split(' ').map((paire) => paire.split(',').map(Number)) : [];

  return (
    <View
      style={[styles.zone, { height: hauteur, backgroundColor: theme.couleurs.surfaceAlt }]}
      onLayout={(evenement) => setLargeur(evenement.nativeEvent.layout.width)}
    >
      {contour ? (
        <Svg width={largeur} height={hauteur}>
          {Array.from({ length: Math.floor(hauteur / 32) }, (_, index) => (index + 1) * 32).map((y) => (
            <Line key={`h${y}`} x1={0} y1={y} x2={largeur} y2={y} stroke={theme.couleurs.bordure} strokeWidth={1} />
          ))}
          {Array.from({ length: Math.floor(largeur / 32) }, (_, index) => (index + 1) * 32).map((x) => (
            <Line key={`v${x}`} x1={x} y1={0} x2={x} y2={hauteur} stroke={theme.couleurs.bordure} strokeWidth={1} />
          ))}
          <Polygon
            points={contour}
            fill={theme.couleurs.primaireConteneur}
            fillOpacity={0.85}
            stroke={theme.couleurs.primaire}
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
          {sommets.map(([x, y]) => (
            <Circle key={`${x}-${y}`} cx={x} cy={y} r={5} fill={theme.couleurs.surface} stroke={theme.couleurs.primaire} strokeWidth={2} />
          ))}
        </Svg>
      ) : (
        <View style={styles.vide}>
          <MapPinOff size={28} color={theme.couleurs.texteSecondaire} />
          <Text variant="bodySmall" color="texteSecondaire" align="center">
            {libelleSansContour}
          </Text>
        </View>
      )}
      <View style={[styles.mention, { backgroundColor: theme.couleurs.surface, borderRadius: theme.rayon.pill }]}>
        <Text variant="micro" color="texteSecondaire">
          {libelleApercu}
        </Text>
      </View>
    </View>
  );
}

const BANDE_MENTION = 36;

const styles = StyleSheet.create({
  zone: { width: '100%', overflow: 'hidden' },
  vide: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16 },
  mention: { position: 'absolute', left: 12, bottom: 8, paddingHorizontal: 10, paddingVertical: 4 },
});
