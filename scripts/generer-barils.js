#!/usr/bin/env node
/**
 * Génère les barils (`index.ts`) de l'arborescence.
 *
 *   src/screens/<Domaine>Screen/index.ts   réexporte les écrans du domaine
 *   src/screens/index.ts                   API publique des écrans
 *   src/components/<Domaine>Component/…    idem pour les composants
 *   src/hooks/<domaine>/index.ts           idem pour les hooks
 *
 * Les écrans sont exportés par leur nom (`export { default as XScreen }`) ;
 * les composants et les hooks gardent leurs exports nommés.
 *
 * Usage : node scripts/generer-barils.js
 */
const fs = require('fs');
const path = require('path');

const RACINE = path.resolve(__dirname, '..');
const SRC = path.join(RACINE, 'src');

const ecrire = (chemin, contenu) => {
  const actuel = fs.existsSync(chemin) ? fs.readFileSync(chemin, 'utf8') : null;
  if (actuel === contenu) {
    console.log(`= ${path.relative(RACINE, chemin)}`);
    return;
  }
  fs.writeFileSync(chemin, contenu);
  console.log(`✓ ${path.relative(RACINE, chemin)}`);
};

/** Écrans : `export { default as Nom } from './Nom';` */
function barilEcran(dossier) {
  const fichiers = fs
    .readdirSync(dossier)
    .filter((nom) => nom.endsWith('Screen.tsx'))
    .sort();
  if (fichiers.length === 0) return;
  const lignes = fichiers.map((nom) => {
    const base = nom.replace(/\.tsx$/, '');
    return `export { default as ${base} } from './${base}';`;
  });
  ecrire(
    path.join(dossier, 'index.ts'),
    `/**\n * Écran(s) du domaine \`${path.basename(dossier)}\`.\n */\n${lignes.join('\n')}\n`,
  );
}

/** Composants : `export * from './Nom';` */
function barilComposant(dossier) {
  const fichiers = fs
    .readdirSync(dossier)
    .filter((nom) => /\.tsx?$/.test(nom) && nom !== 'index.ts')
    .sort();
  if (fichiers.length === 0) return;
  const lignes = fichiers.map((nom) => `export * from './${nom.replace(/\.tsx?$/, '')}';`);
  ecrire(
    path.join(dossier, 'index.ts'),
    `/**\n * Composants \`${path.basename(dossier)}\`.\n */\n${lignes.join('\n')}\n`,
  );
}

/** Hooks : `export * from './useX';` */
function barilHook(dossier) {
  const fichiers = fs
    .readdirSync(dossier)
    .filter((nom) => /^use.*\.tsx?$/.test(nom) && !nom.includes('.web.'))
    .sort();
  if (fichiers.length === 0) return;
  const lignes = fichiers.map((nom) => `export * from './${nom.replace(/\.tsx?$/, '')}';`);
  ecrire(
    path.join(dossier, 'index.ts'),
    `/**\n * Hooks \`${path.basename(dossier)}\`.\n */\n${lignes.join('\n')}\n`,
  );
}

const sousDossiers = (racine, prefixe) =>
  fs
    .readdirSync(racine, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name.startsWith(prefixe))
    .map((e) => path.join(racine, e.name))
    .sort();

// ── écrans ──
const dossiersEcran = sousDossiers(path.join(SRC, 'screens'), '');
dossiersEcran.forEach(barilEcran);
ecrire(
  path.join(SRC, 'screens', 'index.ts'),
  `/**\n * API publique des écrans.\n *\n * Les fichiers de route (\`src/app/**\`) n'importent rien d'autre.\n */\n${dossiersEcran
    .filter((d) => fs.existsSync(path.join(d, 'index.ts')))
    .map((d) => `export * from './${path.basename(d)}';`)
    .join('\n')}\n`,
);

// ── composants ──
const dossiersComposant = sousDossiers(path.join(SRC, 'components'), '');
dossiersComposant.forEach(barilComposant);
ecrire(
  path.join(SRC, 'components', 'index.ts'),
  `/**\n * API publique des composants.\n *\n * Chaque domaine expose ses composants via son propre baril ; ce fichier\n * regroupe le tout pour un import unique (\`@/components\`).\n */\n${dossiersComposant
    .filter((d) => fs.existsSync(path.join(d, 'index.ts')))
    .map((d) => `export * from './${path.basename(d)}';`)
    .join('\n')}\n`,
);

// ── hooks ──
const racineHooks = path.join(SRC, 'hooks');
const dossiersHook = sousDossiers(racineHooks, '');
// `legacy` n'a pas de baril : ses modules se chevauchent (photos et
// observations partagent des noms de hooks). Les imports y sont donc explicites.
dossiersHook.filter((d) => path.basename(d) !== 'legacy').forEach(barilHook);
// `legacy` est volontairement exclu : ces hooks portent les mêmes noms que
// leurs équivalents TanStack Query et seraient ambigus dans un baril commun.
ecrire(
  path.join(racineHooks, 'index.ts'),
  `/**\n * API publique des hooks (TanStack Query + hooks transverses).\n *\n * Les anciens hooks (\`./legacy\`) ne sont pas réexportés ici : ils portent les\n * mêmes noms que leurs équivalents TanStack Query. Importer explicitement\n * \`@/hooks/legacy/useX\` quand c'est bien lui qu'on veut.\n */\n${dossiersHook
    .filter((d) => fs.existsSync(path.join(d, 'index.ts')) && path.basename(d) !== 'legacy')
    .map((d) => `export * from './${path.basename(d)}';`)
    .join('\n')}\n`,
);
