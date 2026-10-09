#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ici = dirname(fileURLToPath(import.meta.url));
const racine = resolve(ici, '..');
const dossierComposants = join(racine, 'src', 'components');

/** Primitives du design system qui doivent exister et servir. */
const PRIMITIVES_DESIGN_SYSTEM = [
  'AppBottomBar',
  'AppSelect',
  'AppText',
  'Badge',
  'Button',
  'Card',
  'Chip',
  'ConfirmDialog',
  'ConfirmProvider',
  'DateInput',
  'DateTimeInput',
  'EmptyState',
  'ErrorState',
  'Input',
  'LoadingState',
  'OfflineBanner',
  'PasswordInput',
  'ScreenContainer',
  'ScreenHeader',
  'SearchBar',
];

/** Motifs importés depuis un écran : signature d'une section, pas d'un composant. */
const DEPENDANCE_ECRAN = /from\s+'@\/screens\//;


/** Tous les fichiers .ts/.tsx du projet, hors dépendances et artefacts. */
function fichiersSource(dossier) {
  const trouves = [];
  const parcourir = (chemin) => {
    for (const entree of readdirSync(chemin)) {
      if (entree === 'node_modules' || entree === 'dist' || entree.startsWith('.')) continue;
      const complet = join(chemin, entree);
      if (statSync(complet).isDirectory()) parcourir(complet);
      else if (/\.tsx?$/.test(entree)) trouves.push(complet);
    }
  };
  parcourir(dossier);
  return trouves;
}

/** Noms exportés par un fichier source. */
function nomsExportes(source) {
  const noms = new Set();
  const ajouter = (nom) => {
    if (nom && /^[A-Za-z_]/.test(nom)) noms.add(nom);
  };

  for (const m of source.matchAll(/export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)/g)) ajouter(m[1]);
  for (const m of source.matchAll(/export\s+const\s+([A-Za-z0-9_]+)\s*[:=]/g)) ajouter(m[1]);
  for (const m of source.matchAll(/export\s+class\s+([A-Za-z0-9_]+)/g)) ajouter(m[1]);
  for (const m of source.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const morceau of m[1].split(',')) {
      const nom = morceau.includes(' as ') ? morceau.split(' as ').pop() : morceau;
      ajouter(nom.trim());
    }
  }

  return [...noms];
}

const sources = new Map(fichiersSource(join(racine, 'src')).map((f) => [f, readFileSync(f, 'utf8')]));
const composants = [...sources.keys()].filter(
  (f) => f.startsWith(dossierComposants) && /\.tsx$/.test(f) && !f.endsWith('.styles.ts'),
);

const barils = [...sources.keys()].filter(
  (f) => f.startsWith(dossierComposants) && f.endsWith('index.ts'),
);

const inventaire = composants.map((fichier) => {
  const source = sources.get(fichier);
  const noms = nomsExportes(source);
  const estSection = DEPENDANCE_ECRAN.test(source);
  const cheminImportable = `${fichier.split(/[\\/]components[\\/]/)[1].replace(/\.tsx$/, '')}`;

  const consommateurs = [];
  for (const [autre, texte] of sources) {
    if (autre === fichier) continue;
    if (autre.endsWith('index.ts') && autre.startsWith(dossierComposants)) continue;

    const importeParChemin = texte.includes(`@/components/${cheminImportable}`);
    const importeParNom = noms.some((nom) =>
      new RegExp(`import[^;]*\\b${nom}\\b[^;]*from`, 's').test(texte),
    );

    if (importeParChemin || importeParNom) consommateurs.push(autre);
  }

  return {
    fichier,
    relatif: relative(racine, fichier),
    dossier: relative(join(racine, 'src', 'components'), dirname(fichier)),
    nom: noms[0] ?? '',
    noms,
    lignes: source.split('\n').length,
    estSection,
    consommateurs,
    consommateursEcran: consommateurs.filter((c) => c.includes('/screens/')),
    dansDesignSystem: fichier.includes(`${join('components', 'CommonComponent')}`),
  };
});


const erreurs = [];
const reutilisables = inventaire.filter((c) => !c.estSection);
const sections = inventaire.filter((c) => c.estSection);

// 2.1 — composants réutilisables orphelins
const orphelins = reutilisables.filter((c) => c.consommateurs.length === 0);
for (const o of orphelins) {
  erreurs.push(
    `Composant réutilisable jamais utilisé : ${o.relatif} (${o.lignes} lignes) — ` +
      'soit l’adopter, soit le supprimer.',
  );
}

// 2.2 — collisions de noms exportés
const parNom = new Map();
for (const c of inventaire) {
  for (const nom of c.noms) {
    if (!parNom.has(nom)) parNom.set(nom, []);
    parNom.get(nom).push(c.relatif);
  }
}
const collisions = [];
for (const [nom, fichiers] of parNom) {
  if (fichiers.length > 1) collisions.push(`« ${nom} » exporté par ${fichiers.join(' et ')}`);
}

// 2.3 — barils : fichiers cités mais absents
for (const baril of barils) {
  const texte = sources.get(baril);
  for (const m of texte.matchAll(/from\s+'\.\/([^']+)'/g)) {
    const base = join(dirname(baril), m[1]);
    // Trois formes valides : `./Fichier.tsx`, `./Fichier.ts`, `./Dossier` (index).
    const candidats = [`${base}.tsx`, `${base}.ts`, join(base, 'index.ts'), join(base, 'index.tsx')];
    if (!candidats.some((c) => sources.has(c))) {
      erreurs.push(`Baril cassé : ${relative(racine, baril)} cite « ${m[1]} » qui n’existe pas.`);
    }
  }
}

// 2.4 — le design system ne doit contenir que du réutilisable
for (const c of inventaire.filter((c) => c.dansDesignSystem && c.estSection)) {
  erreurs.push(
    `Le design system expose une section d’écran : ${c.relatif} — la déplacer dans son dossier de domaine.`,
  );
}

// 2.5 — primitives attendues
const nomsExistants = new Set(inventaire.flatMap((c) => c.noms));
const primitivesAbsentes = PRIMITIVES_DESIGN_SYSTEM.filter((nom) => !nomsExistants.has(nom));
if (primitivesAbsentes.length > 0) {
  erreurs.push(`Primitive(s) du design system absente(s) : ${primitivesAbsentes.join(', ')}`);
}

// 2.6 — un composant réutilisable ne dépend d'aucun écran (par construction)
const reutilisableDependant = reutilisables.filter((c) => DEPENDANCE_ECRAN.test(sources.get(c.fichier)));
for (const c of reutilisableDependant) {
  erreurs.push(`Composant marqué réutilisable mais dépendant d’un écran : ${c.relatif}`);
}


const classement = [...reutilisables].sort(
  (a, b) => b.consommateurs.length - a.consommateurs.length,
);

console.log('═══ Composants du projet ═══');
console.log(`Réutilisables (design system) : ${reutilisables.length}`);
console.log(`Sections d’écran extraites    : ${sections.length}`);
console.log(`Total fichiers .tsx           : ${inventaire.length}`);
console.log(`Barils de composants          : ${barils.length}`);

const barilsImportes = barils.filter(
  (b) => [...sources.values()].some((t) => t.includes(`@/components/${relative(join(racine, 'src'), b).replace(/^components\//, '').replace(/\/index\.ts$/, '')}`)),
);
console.log(
  `Barils réellement importés    : ${barilsImportes.length}/${barils.length}` +
    (barilsImportes.length === 0 ? ' (les imports se font par chemin direct)' : ''),
);

console.log('\n═══ Composants réutilisables les plus utilisés ═══');
for (const c of classement.slice(0, 12)) {
  console.log(
    `  ${String(c.consommateurs.length).padStart(3)} usage(s)  ${c.nom.padEnd(18)} ${c.relatif}`,
  );
}

console.log('\n═══ Sections d’écran (non réutilisables par construction) ═══');
const parDossier = new Map();
for (const s of sections) {
  parDossier.set(s.dossier, (parDossier.get(s.dossier) ?? 0) + 1);
}
for (const [dossier, nombre] of [...parDossier].sort()) {
  console.log(`  ${dossier.padEnd(22)} ${String(nombre).padStart(2)} section(s)`);
}

// Réutilisation dans les écrans : motifs faits main alors qu'un composant existe.
const ecrans = [...sources.entries()].filter(([f]) => f.includes('/screens/') && /\.tsx$/.test(f));
const compter = (motif) =>
  ecrans.reduce((total, [, texte]) => total + (texte.match(motif) ?? []).length, 0);

console.log('\n═══ Réutilisation dans les écrans ═══');
console.log(
  `  ActivityIndicator fait main : ${compter(/<ActivityIndicator/g)} occurrence(s) — ` +
    'LoadingState existe',
);
console.log(
  `  TextInput fait main         : ${compter(/<TextInput/g)} occurrence(s) — ` +
    'Input / AppSelect existent',
);
console.log(
  `  EmptyState importé par      : ${ecrans.filter(([, t]) => t.includes('EmptyState')).length} écran(s)`,
);
console.log(
  `  ErrorState importé par      : ${ecrans.filter(([, t]) => t.includes('ErrorState')).length} écran(s)`,
);

if (collisions.length > 0) {
  console.log('\n═══ Noms exportés en double (ambiguïté latente) ═══');
  for (const c of collisions) console.log(`  ⚠ ${c}`);
}

console.log('\n═══ Résultat ═══');
if (erreurs.length === 0) {
  console.log(
    `✅ ${reutilisables.length} composants réutilisables, tous importés au moins une fois ; ` +
      `aucun fichier mort, aucun baril cassé, ${collisions.length} ambiguïté(s) de nom documentée(s).`,
  );
} else {
  console.log(`❌ ${erreurs.length} problème(s) :`);
  for (const e of erreurs) console.log(`   • ${e}`);
  process.exitCode = 1;
}
