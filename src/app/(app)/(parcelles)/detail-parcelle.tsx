import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { router, useLocalSearchParams } from 'expo-router';
import {
  MapPinned,
  Ruler,
  Layers,
  Calendar,
  Edit3,
  Sprout,
  Navigation,
  Info,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react-native';
import { useParcelle } from '@/hooks/useParcelles';
import { colors, radius } from '@/design/tokens';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';

const formatSuperficie = (s?: number) => {
  if (s == null) return null;
  return { m2: s, are: s / 100, ha: s / 10000 };
};

export default function DetailParcelleScreen() {
  const { parcelleId } = useLocalSearchParams<{ parcelleId: string }>();
  const { data: parcelle, isLoading, isError, refetch } = useParcelle(parcelleId ?? '');

  if (isLoading) return <LoadingState message="Chargement de la parcelle..." />;
  if (isError || !parcelle)
    return (
      <ErrorState
        title="Parcelle introuvable"
        message="Impossible de récupérer les informations de cette parcelle."
        onRetry={() => refetch()}
        onBack={() => router.back()}
      />
    );

  const superficie = formatSuperficie(parcelle.superficie);
  const pointsGPS = (parcelle.pointsGPS || []).map((p, i) => ({
    id: p.id,
    ordre: p.ordre ?? i + 1,
    latitude: Number(p.latitude),
    longitude: Number(p.longitude),
  }));
  const mapLatitude = pointsGPS.length > 0 ? pointsGPS[0].latitude : parcelle.latitude;
  const mapLongitude = pointsGPS.length > 0 ? pointsGPS[0].longitude : parcelle.longitude;
  const canShowMap = mapLatitude !== undefined && mapLongitude !== undefined;
  const isDeleted = parcelle.statut === 'SUPPRIMEE';

  return (
    <View style={styles.root}>
      <ScreenHeader title={parcelle.nom} subtitle="Détail de la parcelle" showBack />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <Card style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroIcon}>
              <MapPinned size={20} color={colors.primary[600]} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.heroTitle}>{parcelle.nom}</Text>
              <Text style={styles.heroSub}>
                {parcelle.typeSol ? `${parcelle.typeSol} • ` : ''}
                {superficie ? `${superficie.ha.toFixed(2)} ha` : 'Superficie non renseignée'}
              </Text>
            </View>
            <Badge
              label={parcelle.statut}
              variant={parcelle.statut === 'ACTIVE' ? 'success' : parcelle.statut === 'SUPPRIMEE' ? 'error' : 'warning'}
              dot
            />
          </View>

          {parcelle.description ? <Text style={styles.heroDesc}>{parcelle.description}</Text> : null}

          {isDeleted && parcelle.raisonSuppression ? (
            <View style={styles.deletedBox}>
              <AlertTriangle size={16} color={colors.error[600]} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.deletedTitle}>Parcelle supprimée</Text>
                <Text style={styles.deletedText}>{parcelle.raisonSuppression}</Text>
              </View>
            </View>
          ) : null}
        </Card>

        {/* Stats grid */}
        <View style={styles.grid}>
          <Card style={styles.stat}>
            <View style={[styles.statIcon, { backgroundColor: colors.primary[50], borderColor: colors.primary[100] }]}>
              <Ruler size={16} color={colors.primary[600]} />
            </View>
            <Text style={styles.statLabel}>Superficie</Text>
            {superficie ? (
              <>
                <Text style={styles.statValue}>{superficie.ha.toFixed(4)} ha</Text>
                <Text style={styles.statHint}>
                  {superficie.m2.toFixed(0)} m² • {superficie.are.toFixed(2)} a
                </Text>
              </>
            ) : (
              <Text style={styles.statHint}>Non calculée</Text>
            )}
          </Card>

          <Card style={styles.stat}>
            <View style={[styles.statIcon, { backgroundColor: colors.info[50], borderColor: colors.info[100] }]}>
              <Layers size={16} color={colors.info[600]} />
            </View>
            <Text style={styles.statLabel}>Type de sol</Text>
            <Text style={styles.statValue}>{parcelle.typeSol || '—'}</Text>
            <Text style={styles.statHint}>{pointsGPS.length} points GPS</Text>
          </Card>

          <Card style={styles.stat}>
            <View style={[styles.statIcon, { backgroundColor: colors.neutral[100], borderColor: colors.border.default }]}>
              <Calendar size={16} color={colors.neutral[600]} />
            </View>
            <Text style={styles.statLabel}>Création</Text>
            <Text style={styles.statValue}>{parcelle.creeA ? new Date(parcelle.creeA).toLocaleDateString('fr-FR') : '—'}</Text>
            <Text style={styles.statHint} numberOfLines={1}>
              {parcelle.modifieA ? `Modifiée ${new Date(parcelle.modifieA).toLocaleDateString('fr-FR')}` : '—'}
            </Text>
          </Card>
        </View>

        {/* Infos complémentaires */}
        <Card>
          <View style={styles.cardHeader}>
            <Info size={16} color={colors.neutral[600]} />
            <Text style={styles.cardTitle}>Informations</Text>
          </View>
          <View style={styles.infoRows}>
            <InfoRow label="Identifiant" value={parcelle.id.slice(0, 8) + '…'} />
            <InfoRow
              label="Coordonnées"
              value={
                parcelle.latitude != null && parcelle.longitude != null
                  ? `${parcelle.latitude.toFixed(5)}, ${parcelle.longitude.toFixed(5)}`
                  : 'Non renseignées'
              }
            />
            <InfoRow label="Créée le" value={parcelle.creeA ? new Date(parcelle.creeA).toLocaleString('fr-FR') : '—'} />
            <InfoRow label="Modifiée le" value={parcelle.modifieA ? new Date(parcelle.modifieA).toLocaleString('fr-FR') : '—'} />
          </View>
        </Card>

        {/* Carte */}
        {canShowMap ? (
          <Card padded={false} style={{ overflow: 'hidden' }}>
            <View style={styles.mapHeader}>
              <View style={styles.mapHeaderIcon}>
                <Navigation size={16} color={colors.primary[600]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.mapTitle}>Délimitation GPS</Text>
                <Text style={styles.mapSub}>{pointsGPS.length} points • Leaflet • Standard & Satellite</Text>
              </View>
              <Badge label={`${pointsGPS.length} pts`} variant="neutral" />
            </View>

            <View style={styles.mapWrap}>
              <WebView
                originWhitelist={['*']}
                source={{
                  html: `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
html,body,#map{margin:0;padding:0;width:100%;height:100%;}
.point-label{background:#2E7D32;color:white;border-radius:50%;width:30px;height:30px;line-height:30px;text-align:center;font-weight:bold;border:2px solid white;}
</style>
</head>
<body>
<div id="map"></div>
<script>
const points = ${JSON.stringify(pointsGPS)};
const map = L.map('map', { zoomControl:true, scrollWheelZoom:true, doubleClickZoom:true, touchZoom:true, minZoom:5, maxZoom:22 }).setView([${mapLatitude}, ${mapLongitude}], 19);
const standard = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution:'&copy; OpenStreetMap', maxZoom:19 });
const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution:'Tiles &copy; Esri', maxZoom:19 });
standard.addTo(map);
L.control.layers({ '🗺️ Standard': standard, '🛰️ Satellite': satellite }, null, { position:'topright' }).addTo(map);
points.forEach(function(point){
  const marker = L.marker([point.latitude, point.longitude]).addTo(map);
  marker.bindPopup('<b>P'+point.ordre+'</b><br>Latitude : '+point.latitude+'<br>Longitude : '+point.longitude);
});
if (points.length >= 3){
  const coordinates = points.map(function(point){ return [point.latitude, point.longitude]; });
  L.polygon(coordinates, { color:'#2E7D32', fillColor:'#2E7D32', fillOpacity:0.25, weight:3 }).addTo(map);
  const bounds = L.latLngBounds(coordinates);
  map.fitBounds(bounds, { padding:[30,30] });
}
</script>
</body>
</html>
          `,
                }}
                style={styles.map}
              />
            </View>

            {!isDeleted ? (
              <View style={styles.mapActions}>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() =>
                    router.push({ pathname: '/delimiter-parcelle', params: { parcelleId: parcelle.id, mode: 'EDIT' } } as any)
                  }
                  leftIcon={<Edit3 size={14} color={colors.neutral[700]} />}
                >
                  Modifier la délimitation
                </Button>
              </View>
            ) : (
              <View style={styles.mapWarning}>
                <AlertTriangle size={14} color={colors.error[500]} />
                <Text style={styles.mapWarningText}>Parcelle supprimée — modification désactivée</Text>
              </View>
            )}
          </Card>
        ) : (
          <Card>
            <View style={styles.emptyMap}>
              <MapPinned size={20} color={colors.neutral[400]} />
              <Text style={styles.emptyMapTitle}>Aucune délimitation GPS</Text>
              <Text style={styles.emptyMapText}>Ajoutez une délimitation pour voir la carte et calculer la superficie.</Text>
              {!isDeleted ? (
                <Button
                  size="sm"
                  onPress={() =>
                    router.push({ pathname: '/delimiter-parcelle', params: { parcelleId: parcelle.id, mode: 'EDIT' } } as any)
                  }
                >
                  Délimiter la parcelle
                </Button>
              ) : null}
            </View>
          </Card>
        )}

        {/* Points list */}
        {pointsGPS.length > 0 ? (
          <Card>
            <View style={styles.cardHeader}>
              <Navigation size={16} color={colors.neutral[600]} />
              <Text style={styles.cardTitle}>Points de délimitation</Text>
              <Badge label={`${pointsGPS.length}`} variant="neutral" />
            </View>
            <View style={styles.pointsList}>
              {pointsGPS.map((p, idx) => (
                <View key={p.id} style={styles.pointRow}>
                  <View style={styles.pointBadge}>
                    <Text style={styles.pointBadgeText}>P{idx + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pointCoord}>
                      {p.latitude.toFixed(6)}, {p.longitude.toFixed(6)}
                    </Text>
                    <Text style={styles.pointOrder}>Ordre {p.ordre}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        ) : null}

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            fullWidth
            size="lg"
            onPress={() =>
              router.push({ pathname: '/cultures', params: { parcelleId: parcelle.id, parcelleNom: parcelle.nom } } as any)
            }
            leftIcon={<Sprout size={18} color="#FFFFFF" />}
            rightIcon={<ChevronRight size={16} color="#FFFFFF" />}
          >
            Voir les cultures
          </Button>

          <View style={styles.secondaryActions}>
            <Button
              variant="outline"
              fullWidth
              onPress={() =>
                router.push({ pathname: '/modifier-parcelle', params: { parcelleId: parcelle.id } } as any)
              }
              disabled={isDeleted}
              leftIcon={<Edit3 size={16} color={isDeleted ? colors.neutral[400] : colors.neutral[700]} />}
            >
              Modifier les informations
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background.app },
  scroll: { padding: 16, gap: 14, paddingBottom: 28 },
  hero: { gap: 12, padding: 16 },
  heroTop: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { fontSize: 17, fontWeight: '800', color: colors.neutral[900], letterSpacing: -0.3 },
  heroSub: { fontSize: 12.5, color: colors.neutral[500] },
  heroDesc: { fontSize: 13, lineHeight: 19, color: colors.neutral[600] },
  deletedBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: colors.error[50],
    borderWidth: 1,
    borderColor: colors.error[200],
    borderRadius: radius.md,
    padding: 12,
  },
  deletedTitle: { fontSize: 12.5, fontWeight: '700', color: colors.error[700] },
  deletedText: { fontSize: 12.5, lineHeight: 17, color: colors.error[600] },
  grid: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, gap: 8, padding: 12 },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: { fontSize: 11, fontWeight: '700', color: colors.neutral[500], textTransform: 'uppercase', letterSpacing: 0.4 },
  statValue: { fontSize: 14, fontWeight: '800', color: colors.neutral[900] },
  statHint: { fontSize: 11, color: colors.neutral[500] },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { flex: 1, fontSize: 13.5, fontWeight: '700', color: colors.neutral[900] },
  infoRows: { gap: 10, marginTop: 6 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  infoLabel: { fontSize: 12.5, color: colors.neutral[500] },
  infoValue: { fontSize: 12.5, fontWeight: '600', color: colors.neutral[800], maxWidth: '60%', textAlign: 'right' },
  mapHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border.default },
  mapHeaderIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapTitle: { fontSize: 13.5, fontWeight: '700', color: colors.neutral[900] },
  mapSub: { fontSize: 11.5, color: colors.neutral[500] },
  mapWrap: { height: 280, backgroundColor: colors.neutral[100] },
  map: { flex: 1 },
  mapActions: { padding: 12, alignItems: 'flex-start' },
  mapWarning: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: colors.error[50],
    borderTopWidth: 1,
    borderTopColor: colors.error[200],
    padding: 12,
  },
  mapWarningText: { fontSize: 12, color: colors.error[700], fontWeight: '600' },
  emptyMap: { alignItems: 'center', gap: 8, paddingVertical: 12 },
  emptyMapTitle: { fontSize: 14, fontWeight: '700', color: colors.neutral[800] },
  emptyMapText: { fontSize: 12.5, color: colors.neutral[500], textAlign: 'center', maxWidth: 280 },
  pointsList: { gap: 8, marginTop: 8 },
  pointRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    padding: 10,
  },
  pointBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  pointCoord: { fontSize: 12.5, fontWeight: '600', color: colors.neutral[800], fontFamily: 'monospace' },
  pointOrder: { fontSize: 11, color: colors.neutral[500] },
  actions: { gap: 10, paddingTop: 4 },
  secondaryActions: { gap: 8 },
});
