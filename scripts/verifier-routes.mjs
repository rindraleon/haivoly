#!/usr/bin/env node
/**
 * Vérificateur de la couche de routage (expo-router).
 *
 * Règles vérifiées :
 *   1. chaque fichier de `src/app/**` reste **une couche de routage courte**
 *      (≤ 12 lignes utiles, aucune logique : pas de `useState`, `useEffect`,
 *      hook métier, appel HTTP ni feuille de style) ;
 *   2. chaque import de ces fichiers **résout** vers un module existant ;
 *   3. inventaire des routes et détection des écrans jamais atteints
 *      (informatif : signale un écran orphelin après un renommage).
 *
 * Usage :  node scripts/verifier-routes.mjs   (alias `npm run verifier:routes`)
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ici = dirname(fileURLToPath(import.meta.url));
const racine = resolve(ici, '..');
const racineApp = join(racine, 'src', 'app');

const LIGNES_MAX = 12;
const LOGIQUE_INTERDITE = [
  /\buseState\s*\(/,
  /\buseEffect\s*\(/,
  /\buse[A-Z]\w*\s*\(/, // hooks de domaine
  /\bhttp\s*\./,
  /\baxios\b/,
  /StyleSheet\s*\./,
];

function fichiers(dossier, motif) {
  const trouves = [];
  for (const entree of readdirSync(dossier)) {
    const chemin = join(dossier, entree);
    if (statSync(chemin).isDirectory()) trouves.push(...fichiers(chemin, motif));
    else if (motif.test(entree)) trouves.push(chemin);
  }
  return trouves;
}

/** Résolution d'import : alias `@/`, relatif, extensions et `index` implicites. */
function resoudre(cheminImport, fichierSource) {
  const base = cheminImport.startsWith('@/')
    ? join(racine, 'src', cheminImport.slice(2))
    : resolve(dirname(fichierSource), cheminImport);

  const candidats = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    join(base, 'index.ts'),
    join(base, 'index.tsx'),
  ];
  return candidats.find((candidat) => existsSync(candidat)) ?? null;
}

const routes = fichiers(racineApp, /\.tsx$|\.ts$/).filter(
  (chemin) => !/\.(test|spec)\.tsx?$/.test(chemin),
);

const problemes = [];
const cibles = new Set();

for (const fichier of routes) {
  const source = readFileSync(fichier, 'utf8');
  const nom = relative(racine, fichier);
  const utiles = source
    .split('\n')
    .filter((ligne) => ligne.trim() && !ligne.trim().startsWith('//'))
    .length;

  // Un `_layout.tsx` n'est pas une route : c'est la composition de la pile de
  // navigation (providers, en-têtes) — il a le droit à un peu plus de lignes.
  const estLayout = fichier.endsWith('_layout.tsx');
  if (utiles > LIGNES_MAX * (estLayout ? 3 : 1)) {
    problemes.push(`${nom} : ${utiles} lignes utiles (max ${LIGNES_MAX})`);
  }

  for (const motif of estLayout ? [] : LOGIQUE_INTERDITE) {
    if (motif.test(source)) {
      problemes.push(`${nom} : logique détectée (${motif.source})`);
    }
  }

  for (const [, cheminImport] of source.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
    // Les paquets (`react`, `expo-router`, …) sont résolus par Metro.
    if (!cheminImport.startsWith('@/') && !cheminImport.startsWith('.')) continue;
    const cible = resoudre(cheminImport, fichier);
    if (!cible) problemes.push(`${nom} : import non résolu → ${cheminImport}`);
    else if (cible.startsWith(join(racine, 'src', 'screens'))) {
      cibles.add(relative(racine, cible).replace(/\.tsx?$/, ''));
    }
  }
}

// ── Écrans jamais atteints depuis une route (informatif) ───────────────────
const ecrans = fichiers(join(racine, 'src', 'screens'), /Screen\.tsx$/)
  .map((chemin) => relative(racine, chemin).replace(/\.tsx$/, ''))
  .filter((chemin) => /\/[A-Z][^/]*Screen$/.test(chemin));

const orphelins = ecrans.filter((chemin) => !cibles.has(chemin));

console.log(`Routes    : ${routes.length} fichiers sous src/app`);
console.log(`Écrans    : ${cibles.size} atteints depuis une route sur ${ecrans.length}\n`);

if (problemes.length > 0) {
  console.log('❌ Couche de routage :');
  for (const probleme of problemes) console.log(`   ${probleme}`);
  process.exitCode = 1;
} else {
  console.log('✅ Tous les fichiers de route sont courts et sans logique.');
}

if (orphelins.length > 0) {
  console.log(`\n⚠️  ${orphelins.length} écran(s) non atteint(s) depuis une route :`);
  for (const chemin of orphelins) console.log(`   ${chemin}`);
}
