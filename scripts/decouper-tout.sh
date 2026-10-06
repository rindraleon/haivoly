#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Découpage reproductible des écrans volumineux.
#
#   1. restaure l'état de référence (`$BASELINE`, écrans d'origine avec leurs
#      styles déjà extraits) ;
#   2. `decouper-ecran.js`        utilitaires, types, sous-composants ;
#   3. `extraire-sections.js`     grands blocs JSX (affinage récursif) ;
#   4. `extraire-imbriquees.js`   fonctions pures déclarées dans le composant ;
#   5. `decouper-styles.js`       feuilles de styles par section ;
#   6. `nettoyer-composants.js`   sections générées devenues orphelines ;
#   7. `echapper-entites.js`      apostrophes JSX (react/no-unescaped-entities) ;
#   8. `ajouter-gardes.js`        gardes de rendu (propriétés optionnelles) ;
#   9. `nettoyer-imports.js`      imports inutilisés après déplacement.
#
# Les écrans ne sont pas réécrits : leur code est déplacé tel quel, ce que
# `npx tsc --noEmit` puis `npm run lint` vérifient ensuite. Le pipeline est
# idempotent : le relancer produit des fichiers identiques.
#
# Usage : bash scripts/decouper-tout.sh
# ---------------------------------------------------------------------------
set -euo pipefail
cd "$(dirname "$0")/.."

# Écran de référence : copie des écrans d'origine (styles déjà extraits),
# conservée hors du dépôt pour ne pas polluer le lint et le typage.
BASELINE="${BASELINE:-$HOME/.refactor-baseline-ecrans}"

# Les sections déjà générées sont supprimées avant régénération : le résultat
# du découpage ne dépend donc que des écrans de référence.
# Nettoyage des productions précédentes (sections et groupes de styles).
node -e "
const fs=require('fs');const path=require('path');
const racine='src';
const supprimer=(d)=>fs.readdirSync(d,{withFileTypes:true}).forEach(e=>{
  const c=path.join(d,e.name);
  if(e.isDirectory())return supprimer(c);
  if(e.name.endsWith('.helpers.ts')){fs.unlinkSync(c);console.log('− '+c);return;}
  if(!e.name.endsWith('.ts'))return;
  const texte=fs.readFileSync(c,'utf8');
  if(/extraits de/.test(texte)&&texte.includes('StyleSheet.create')){fs.unlinkSync(c);console.log('− '+c);}
});
supprimer(racine);
"
if [ -f src/components/sections-generees.json ]; then
  node -e "const fs=require('fs');const p='src/components/sections-generees.json';JSON.parse(fs.readFileSync(p,'utf8')).forEach(f=>{if(fs.existsSync(f))fs.unlinkSync(f)});fs.unlinkSync(p);"
fi

# Domaine de référence (dossier du BASELINE) → dossier d'écrans du dépôt.
declare -A DOSSIER=(
  [common]=CommonScreen
  [culture]=CultureScreen
  [home]=HomeScreen
  [intervention]=InterventionScreen
  [observation]=ObservationScreen
  [parcelle]=ParcelleScreen
  [profil]=ProfileScreen
  [recolte]=RecolteScreen
  [auth]=AuthScreen
)

for ecran in \
  observation/ObservationListScreen \
  observation/ObservationCreateScreen \
  observation/ObservationEditScreen \
  culture/CultureListScreen \
  culture/CultureCreateScreen \
  culture/CultureEditScreen \
  culture/CultureHistoryScreen \
  culture/CultureDelimiterScreen \
  intervention/InterventionListScreen \
  intervention/InterventionEditScreen \
  parcelle/ParcelleListScreen \
  parcelle/ParcelleHistoryScreen \
  profil/ProfilScreen \
  auth/LoginScreen \
  auth/RegisterScreen \
  auth/ForgotPasswordScreen \
  auth/ResetPasswordScreen
do
  domaine="${ecran%%/*}"
  nom="${ecran##*/}"
  dossier="${DOSSIER[$domaine]:-$domaine}"
  cible="src/screens/${dossier}/${nom}"
  cp "${BASELINE}/${ecran}.tsx" "${cible}.tsx"
  # La feuille de styles de référence est restaurée elle aussi : le découpage
  # des styles est une étape dérivée, donc rejouable à l'identique.
  if [ -f "${BASELINE}/${ecran}.styles.ts" ]; then
    cp "${BASELINE}/${ecran}.styles.ts" "${cible}.styles.ts"
  fi
  node scripts/decouper-ecran.js "${cible}.tsx"
done

# ── Sections : les noms reprennent le vocabulaire métier des écrans ─────────
node scripts/extraire-sections.js src/screens/ObservationScreen/ObservationListScreen.tsx \
  --nom 1=VueObservations

node scripts/extraire-sections.js src/screens/ObservationScreen/ObservationCreateScreen.tsx \
  --nom 1=VueCreationObservation

node scripts/extraire-sections.js src/screens/ObservationScreen/ObservationEditScreen.tsx \
  --nom 1=VueModificationObservation

node scripts/extraire-sections.js src/screens/CultureScreen/CultureListScreen.tsx \
  --nom 1=VueCultureParcelle --nom 2=VueToutesParcelles --nom 3=ModalChoixParcelle

node scripts/extraire-sections.js src/screens/CultureScreen/CultureCreateScreen.tsx \
  --nom 1=VueCreationCulture

node scripts/extraire-sections.js src/screens/CultureScreen/CultureEditScreen.tsx \
  --nom 1=VueModificationCulture

node scripts/extraire-sections.js src/screens/CultureScreen/CultureHistoryScreen.tsx \
  --nom 1=VueHistoriqueCultures --nom 2=PanneauFiltreHistorique --nom 3=CarteCultureHistorique

node scripts/extraire-sections.js src/screens/CultureScreen/CultureDelimiterScreen.tsx \
  --nom 1=VueDelimitation

node scripts/extraire-sections.js src/screens/InterventionScreen/InterventionListScreen.tsx \
  --nom 1=VueInterventions --nom 2=VueInterventionsCulture --nom 3=ResumeInterventions

node scripts/extraire-sections.js src/screens/InterventionScreen/InterventionEditScreen.tsx \
  --nom 1=VueModificationIntervention

node scripts/extraire-sections.js src/screens/ParcelleScreen/ParcelleListScreen.tsx \
  --nom 1=VueParcelles

node scripts/extraire-sections.js src/screens/ParcelleScreen/ParcelleHistoryScreen.tsx \
  --nom 1=VueHistoriqueParcelles

node scripts/extraire-sections.js src/screens/ProfileScreen/ProfilScreen.tsx \
  --nom 1=VueProfil

# ── Affinage récursif ──────────────────────────────────────────────────────
# Les sections extraites sont découpées à leur tour tant qu'elles dépassent
# 700 lignes : le script est relancable sur ses propres productions.
for passe in 1 2 3 4; do
  cibles=$(find src/components src/screens -name '*.tsx' ! -name '*.styles.ts' -exec wc -l {} + \
    | awk '$1 > 700 && $2 != "total" {print $2}')
  [ -z "$cibles" ] && break
  echo "— affinage, passe ${passe}"
  # shellcheck disable=SC2086
  node scripts/extraire-sections.js ${cibles} --min 150 --max 2 --sans-racine
done
# ── Fonctions pures imbriquées ─────────────────────────────────────────────
# Géométrie, formatage, calculs… déclarés dans le composant sans dépendre de
# son état : ils rejoignent le module d'utilitaires de l'écran.
for passe in 1 2; do
  cibles=$(find src/screens src/components -name '*.tsx' ! -name '*.styles.ts' -exec wc -l {} + \
    | awk '$1 > 600 && $2 != "total" {print $2}')
  [ -z "$cibles" ] && break
  echo "— fonctions pures, passe ${passe}"
  # shellcheck disable=SC2086
  node scripts/extraire-imbriquees.js ${cibles} --min 25
done

node scripts/nettoyer-composants.js

# ── Feuilles de styles volumineuses ────────────────────────────────────────
for f in $(find src/screens -name '*.styles.ts' -exec wc -l {} + \
  | awk '$1 > 700 && $2 != "total" {print $2}'); do
  node scripts/decouper-styles.js "$f" --seuil 300
done

node scripts/echapper-entites.js
node scripts/ajouter-gardes.js
node scripts/nettoyer-imports.js

echo
echo "Découpage terminé. Vérifier avec : npx tsc --noEmit && npm run lint"
