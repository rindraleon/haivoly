import { Redirect, router, useLocalSearchParams } from 'expo-router';
import {
  Bell,
  CircleCheck,
  ClipboardList,
  Clock3,
  History,
  Map as IconeCarte,
  MapPinned,
  Moon,
  Plus,
  Sprout,
  Sun,
  TriangleAlert,
  Wheat,
  Wrench,
} from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useThemeContexte } from '@/theme/ThemeProvider';
import {
  AlertCard,
  Card,
  ChoiceChips,
  CropCard,
  CropStatusBadge,
  DateField,
  DonutChart,
  EmptyState,
  Fab,
  FieldMapCard,
  FilterChips,
  FormInput,
  KpiCard,
  PrimaryButton,
  RecommendationCard,
  Screen,
  SearchField,
  SectionHeader,
  Skeleton,
  Text,
  contraste,
  couleursGraphique,
  useTheme,
  useToast,
  type CropStatus,
} from '@/ui';

import { EnteteTableauDeBord } from '../dashboard/components/EnteteTableauDeBord';
import { Raccourcis } from '../dashboard/components/Raccourcis';
import { PARCELLES_DEMO, RECOMMANDATIONS_DEMO } from './donneesDemo';
import { RecetteCultures } from './RecetteCultures';
import { RecetteLot4 } from './RecetteLot4';
import { RecetteLot5 } from './RecetteLot5';
import { RecetteLot6 } from './RecetteLot6';
import { RecetteLot7 } from './RecetteLot7';
import { RecetteLot8 } from './RecetteLot8';
import { RecetteParcelles } from './RecetteParcelles';

/** Catalogue réservé au développement (ou à une recette avec EXPO_PUBLIC_CATALOGUE=1). */
export function catalogueActif(): boolean {
  return __DEV__ || process.env.EXPO_PUBLIC_CATALOGUE === '1';
}

const STATUTS: CropStatus[] = ['healthy', 'growing', 'water_stress', 'disease', 'ready', 'planned', 'harvested', 'abandoned'];

const UNITES = [
  { value: 'kg', label: 'kg' },
  { value: 'tonne', label: 't' },
  { value: 'sac', label: 'Sacs' },
] as const;

/**
 * Catalogue UI du design system V2 : sert à la recette visuelle (clair et
 * sombre, police à 130 %) avant de migrer un écran. Textes de démonstration
 * en dur : écran de développement, non traduit.
 */
export default function CatalogueScreen() {
  const theme = useTheme();
  const { definirTheme, mode } = useThemeContexte();
  const [unite, setUnite] = useState<(typeof UNITES)[number]['value']>('kg');
  const [quantite, setQuantite] = useState('');
  const [date, setDate] = useState('2026-10-14');
  const series = couleursGraphique(theme.mode);
  const { ecran } = useLocalSearchParams<{ ecran?: string }>();
  const [recherche, setRecherche] = useState('');
  const [filtre, setFiltre] = useState<'TOUTES' | 'ACTIVE' | 'A_DELIMITER'>('TOUTES');
  const afficherToast = useToast();

  if (!catalogueActif()) return <Redirect href="/" />;
  // Recette des écrans réels (lots 2 et 2 bis) : /catalogue?ecran=parcelles | parcelle&parcelleId=demo-p1 | historique
  if (ecran === 'parcelles' || ecran === 'parcelle' || ecran === 'historique') return <RecetteParcelles ecran={ecran} />;
  // Recette du lot 3 : /catalogue?ecran=cultures[&parcelleId=demo-p1] | culture&parcelleId=demo-p1&id=demo-c1
  if (ecran === 'cultures' || ecran === 'culture') return <RecetteCultures ecran={ecran} />;
  // Recette du lot 4 : formulaires V2 et suivi unifié réels sur cache démo.
  if (
    ecran === 'observation' ||
    ecran === 'observation-edit' ||
    ecran === 'intervention' ||
    ecran === 'intervention-edit' ||
    ecran === 'suivi' ||
    ecran === 'parcelle-formulaire' ||
    ecran === 'parcelle-formulaire-edit'
  ) {
    return <RecetteLot4 ecran={ecran} />;
  }
  // Recette du lot 5 : profil, formulaire profil, récolte & rendement,
  // centre de notifications (état vide sans session).
  if (
    ecran === 'profil' ||
    ecran === 'profil-formulaire' ||
    ecran === 'recoltes' ||
    ecran === 'notifications'
  ) {
    return <RecetteLot5 ecran={ecran} />;
  }
  // Recette du lot 6 : historique des cultures, carte des parcelles plein
  // écran, cockpit parcelle enrichi.
  if (ecran === 'historique-cultures' || ecran === 'carte-parcelles' || ecran === 'parcelle-v2') {
    return <RecetteLot6 ecran={ecran} />;
  }
  // Recette du lot 7 : tableau de bord V2 virtualisé + cumul des récoltes.
  if (ecran === 'tableau-de-bord') {
    return <RecetteLot7 ecran={ecran} />;
  }
  // Recettes du lot 8 : tableau de bord propriétaire + file hors ligne.
  if (ecran === 'tableau-de-bord-projet' || ecran === 'file-synchronisation') {
    return <RecetteLot8 ecran={ecran} />;
  }

  const paires: [string, string, string][] = [
    ['primaire', theme.couleurs.primaire, theme.couleurs.surPrimaire],
    ['cta', theme.couleurs.cta, theme.couleurs.surCta],
    ['succès', theme.couleurs.succes, theme.couleurs.surSucces],
    ['alerte', theme.couleurs.alerte, theme.couleurs.surAlerte],
    ['erreur', theme.couleurs.erreurFonce, theme.couleurs.surErreurFonce],
    ['info (conteneur)', theme.couleurs.infoConteneur, theme.couleurs.surInfoConteneur],
  ];

  return (
    <Screen testID="catalogue">
      <View style={styles.ligne}>
        <View style={styles.flex}>
          <Text variant="caption" color="texteSecondaire">
            Haivoly · Design system V2
          </Text>
          <Text variant="h1">Catalogue UI</Text>
        </View>
        <PrimaryButton
          label={mode === 'dark' ? 'Clair' : 'Sombre'}
          icon={mode === 'dark' ? Sun : Moon}
          variant="secondary"
          size="sm"
          onPress={() => definirTheme(mode === 'dark' ? 'light' : 'dark')}
        />
      </View>

      <SectionHeader title="Recette : écrans Parcelles V2" subtitle="Écrans réels, cache isolé de démonstration (lot 2)" />
      <Card variant="tonal">
        <View style={styles.colonne}>
          <PrimaryButton
            label="Liste des parcelles"
            icon={IconeCarte}
            variant="secondary"
            size="md"
            onPress={() => router.push({ pathname: '/catalogue', params: { ecran: 'parcelles' } })}
          />
          <PrimaryButton
            label="Détail « cockpit »"
            icon={MapPinned}
            variant="secondary"
            size="md"
            onPress={() => router.push({ pathname: '/catalogue', params: { ecran: 'parcelle', parcelleId: 'demo-p1' } })}
          />
          <PrimaryButton
            label="Historique (V1) + Réactiver"
            icon={History}
            variant="secondary"
            size="md"
            onPress={() => router.push({ pathname: '/catalogue', params: { ecran: 'historique' } })}
          />
          <PrimaryButton
            label="Suivi des cultures (lot 3)"
            icon={Sprout}
            variant="secondary"
            size="md"
            onPress={() => router.push({ pathname: '/catalogue', params: { ecran: 'cultures' } })}
          />
          <PrimaryButton
            label="Cockpit culture (lot 3)"
            icon={Wheat}
            variant="secondary"
            size="md"
            onPress={() => router.push({ pathname: '/catalogue', params: { ecran: 'culture', parcelleId: 'demo-p1', id: 'demo-c1' } })}
          />
        </View>
      </Card>

      <SectionHeader title="Retours : toasts" subtitle="Un message à la fois, annoncé aux lecteurs d'écran" />
      <View style={styles.ligne}>
        <PrimaryButton
          label="Succès"
          variant="outline"
          size="sm"
          onPress={() => afficherToast({ tone: 'success', message: 'Parcelle archivée' })}
          testID="catalogue-toast-succes"
        />
        <PrimaryButton
          label="Hors ligne"
          variant="outline"
          size="sm"
          onPress={() => afficherToast({ tone: 'info', message: 'Enregistré sur le téléphone. Envoi au retour du réseau.' })}
          testID="catalogue-toast-info"
        />
        <PrimaryButton
          label="Erreur"
          variant="outline"
          size="sm"
          onPress={() => afficherToast({ tone: 'error', message: 'Le statut n’a pas pu être modifié. Réessayez.' })}
          testID="catalogue-toast-erreur"
        />
      </View>

      <SectionHeader title="Recherche, filtres et action flottante" subtitle="SearchField · FilterChips · Fab" />
      <View style={styles.colonne}>
        <SearchField
          value={recherche}
          onChangeText={setRecherche}
          placeholder="Rechercher une parcelle, un sol…"
          accessibilityLabel="Rechercher une parcelle"
          clearLabel="Effacer la recherche"
        />
        <FilterChips
          options={[
            { value: 'TOUTES', label: 'Toutes', count: 6 },
            { value: 'ACTIVE', label: 'Actives', count: 4 },
            { value: 'A_DELIMITER', label: 'À délimiter', count: 1 },
          ]}
          value={filtre}
          onChange={setFiltre}
          accessibilityLabel="Filtrer les parcelles"
          inset={theme.dimensions.margeEcran}
        />
        <View style={styles.finLigne}>
          <Fab label="Nouvelle parcelle" icon={Plus} onPress={() => {}} />
        </View>
      </View>

      <SectionHeader title="Aperçu : tableau de bord" subtitle="Composition réelle avec des données de démonstration" />
      <Card variant="tonal" style={styles.apercu}>
        <EnteteTableauDeBord
          prenom="Hery"
          nomComplet="Hery Rakoto"
          cleSalutation="bonjour"
          enLigne
          nonLues={2}
          onNotifications={() => {}}
          onProfil={() => {}}
        />
        <AlertCard
          tone="info"
          title="2 actions en attente d’envoi"
          message="Elles partiront automatiquement. Vous pouvez aussi les envoyer maintenant."
          actionLabel="Synchroniser"
          onAction={() => {}}
        />
        <View style={styles.grille}>
          <KpiCard label="Parcelles actives" value={4} hint="3,40 ha" icon={MapPinned} tone="primaire" />
          <KpiCard label="Cultures en cours" value={6} hint="2 planifiées" icon={Sprout} tone="succes" />
          <KpiCard label="Non lues" value={2} hint="recommandations" icon={Bell} tone="info" />
          <KpiCard label="En attente" value={2} hint="à synchroniser" icon={Clock3} tone="alerte" />
        </View>
        <SectionHeader title="Raccourcis" />
        <Raccourcis
          elements={[
            { cle: 'p', libelle: 'Nouvelle parcelle', icone: MapPinned, ton: 'primaire', onPress: () => {} },
            { cle: 'i', libelle: 'Interventions', icone: Wrench, ton: 'alerte', onPress: () => {} },
            { cle: 'o', libelle: 'Observations', icone: ClipboardList, ton: 'info', onPress: () => {} },
            { cle: 'c', libelle: 'Mes cultures', icone: Sprout, ton: 'succes', onPress: () => {} },
          ]}
        />
        <SectionHeader title="Parcelles prioritaires" actionLabel="Tout voir" onAction={() => {}} />
        <FieldMapCard
          nom={PARCELLES_DEMO[0].nom}
          points={PARCELLES_DEMO[0].points}
          meta={PARCELLES_DEMO[0].meta}
          tone="erreur"
          badges={[{ label: 'Récolte en retard', tone: 'erreur', icon: TriangleAlert }]}
          labelSansGeometrie="À délimiter"
          onPress={() => {}}
        />
        <FieldMapCard
          nom={PARCELLES_DEMO[1].nom}
          points={PARCELLES_DEMO[1].points}
          meta={PARCELLES_DEMO[1].meta}
          badges={[{ label: 'Récolte proche', tone: 'info', icon: Wheat }]}
          labelSansGeometrie="À délimiter"
          onPress={() => {}}
        />
        <SectionHeader title="Prochaines récoltes" actionLabel="Tout voir" onAction={() => {}} />
        <CropCard
          nom="Riz"
          variete="X265"
          parcelle="Rizière Ambohidratrimo"
          statut="ready"
          progression={0.86}
          libelleEcheance="Récolte dans 5 jours"
          onPress={() => {}}
        />
        <CropCard
          nom="Manioc"
          parcelle="Champ de manioc Andranovelona"
          statut="growing"
          progression={0.42}
          libelleEcheance="Récolte dans 96 jours"
          onPress={() => {}}
        />
        <SectionHeader title="Répartition des cultures" />
        <Card>
          <DonutChart
            segments={[
              { label: 'Riz', value: 3, color: series[0] },
              { label: 'Manioc', value: 2, color: series[1] },
              { label: 'Haricot', value: 1, color: series[3] },
            ]}
            centerValue="6"
            centerLabel="cultures"
            accessibilityLabel="6 cultures en cours : Riz 3, Manioc 2, Haricot 1"
          />
        </Card>
        <SectionHeader title="Recommandations" actionLabel="Tout voir" onAction={() => {}} />
        {RECOMMANDATIONS_DEMO.map((reco) => (
          <RecommendationCard
            key={reco.id}
            title={reco.title}
            message={reco.message}
            priority={reco.priority}
            kind={reco.kind}
            unread={reco.unread}
            priorityLabel={reco.priority === 'HIGH' ? 'Haute' : 'Moyenne'}
            unreadLabel="Non lue"
            dateLabel={reco.date}
            onPress={() => {}}
          />
        ))}
      </Card>

      <SectionHeader title="Couleurs" subtitle="Paires fond / texte et contraste WCAG mesuré" />
      <View style={styles.grille}>
        {paires.map(([nom, fond, texte]) => (
          <View key={nom} style={[styles.pastille, { backgroundColor: fond, borderRadius: theme.rayon.md }]}>
            <Text variant="label" style={{ color: texte }}>
              {nom}
            </Text>
            <Text variant="caption" style={{ color: texte }} tabular>
              {fond} · {contraste(fond, texte).toFixed(2)}:1
            </Text>
          </View>
        ))}
      </View>

      <SectionHeader title="Typographie" subtitle="Inter · display, h1, h2, h3, body, caption, label" />
      <Card style={styles.pile}>
        <Text variant="display">Display 32</Text>
        <Text variant="h1">Titre H1 26</Text>
        <Text variant="h2">Titre H2 22</Text>
        <Text variant="h3">Titre H3 18</Text>
        <Text variant="body">Corps 16 — Suivi des parcelles et des cultures.</Text>
        <Text variant="bodySmall" color="texteSecondaire">Corps 14 — Texte secondaire lisible.</Text>
        <Text variant="label">Libellé 14</Text>
        <Text variant="caption" color="texteSecondaire">Légende 12</Text>
        <Text variant="kpi">1 250 kg</Text>
      </Card>

      <SectionHeader title="Boutons" />
      <Card style={styles.pile}>
        <PrimaryButton label="Enregistrer la récolte" icon={Wheat} fullWidth onPress={() => {}} />
        <PrimaryButton label="Action secondaire" variant="secondary" fullWidth onPress={() => {}} />
        <PrimaryButton label="Appel à l’action" variant="cta" fullWidth onPress={() => {}} />
        <View style={styles.ligne}>
          <PrimaryButton label="Contour" variant="outline" size="md" onPress={() => {}} />
          <PrimaryButton label="Lien" variant="ghost" size="md" onPress={() => {}} />
        </View>
        <PrimaryButton label="Supprimer" variant="danger" fullWidth onPress={() => {}} />
        <PrimaryButton label="Enregistrement…" loading fullWidth onPress={() => {}} />
        <PrimaryButton label="Désactivé" disabled fullWidth onPress={() => {}} />
      </Card>

      <SectionHeader title="Statuts de culture" subtitle="Icône + texte, jamais la couleur seule" />
      <View style={styles.badges}>
        {STATUTS.map((statut) => (
          <CropStatusBadge key={statut} status={statut} />
        ))}
      </View>

      <SectionHeader title="Alertes" />
      <View style={styles.pile}>
        <AlertCard tone="success" title="Récolte enregistrée" message="La culture est désormais marquée comme récoltée." />
        <AlertCard tone="warning" title="3 actions à vérifier" message="Le serveur a refusé certaines saisies." actionLabel="Réessayer" onAction={() => {}} />
        <AlertCard tone="error" title="Enregistrement impossible" message="Une seule récolte par culture." />
        <AlertCard tone="offline" title="Vous êtes hors ligne" message="Vos saisies restent sur le téléphone." />
      </View>

      <SectionHeader title="Formulaire" subtitle="Champs V2 (le gabarit FormScreen gère le clavier)" />
      <Card style={styles.pile}>
        <DateField
          label="Date de récolte"
          value={date}
          onChange={setDate}
          required
          helper="Plantée le 12/06/2026"
          placeholder="Choisir une date"
          doneLabel="Terminé"
          changeHint="Touchez pour choisir une autre date"
        />
        <FormInput
          label="Quantité récoltée"
          required
          value={quantite}
          onChangeText={setQuantite}
          suffix={UNITES.find((u) => u.value === unite)?.label}
          placeholder="1200"
          keyboardType="decimal-pad"
          error={quantite === '0' ? 'Saisissez une quantité supérieure à 0' : undefined}
          helper="Saisissez « 0 » pour voir l’état d’erreur"
        />
        <ChoiceChips label="Unité" required options={UNITES} value={unite} onChange={setUnite} />
        <FormInput label="Description" multiline placeholder="Conditions de récolte, qualité…" helper="0 / 1000 caractères" />
      </Card>

      <SectionHeader title="États" subtitle="Chargement et état vide illustré" />
      <Card style={styles.pile}>
        <Skeleton width="60%" height={18} />
        <Skeleton height={12} />
        <Skeleton width="80%" height={12} />
      </Card>
      <Card>
        <EmptyState
          title="Aucune parcelle pour l’instant"
          message="Créez votre première parcelle pour commencer."
          actionLabel="Créer une parcelle"
          onAction={() => {}}
        />
      </Card>

      <View style={styles.ligne}>
        <CircleCheck size={16} color={theme.couleurs.succes} />
        <Text variant="caption" color="texteSecondaire" style={styles.flex}>
          Contrastes vérifiés par les tests (WCAG AA) en clair et en sombre.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  colonne: { gap: 12 },
  finLigne: { alignItems: 'flex-end' },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  flex: { flex: 1 },
  apercu: { gap: 14 },
  grille: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  pastille: { flexBasis: '47%', flexGrow: 1, padding: 12, gap: 2 },
  pile: { gap: 12 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
