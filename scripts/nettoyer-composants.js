#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const RACINE = path.resolve(__dirname, '..');

const MANIFESTE = path.join(RACINE, 'src', 'components', 'sections-generees.json');

let manifeste = [];
try {
  manifeste = JSON.parse(fs.readFileSync(MANIFESTE, 'utf8'));
} catch {
  console.log('Aucun manifeste : rien à nettoyer.');
  process.exit(0);
}

const sources = [];
const parcourir = (dossier) => {
  fs.readdirSync(dossier, { withFileTypes: true }).forEach((entree) => {
    const chemin = path.join(dossier, entree.name);
    if (entree.isDirectory()) {
      if (['node_modules', '.git'].includes(entree.name)) return;
      parcourir(chemin);
    } else if (/\.(ts|tsx)$/.test(entree.name)) {
      sources.push(chemin);
    }
  });
};
parcourir(path.join(RACINE, 'src'));
const code = sources.map((fichier) => fs.readFileSync(fichier, 'utf8')).join('\n');

let supprimes = 0;
const restants = [];
manifeste.forEach((relatif) => {
  const fichier = path.join(RACINE, relatif);
  const nomComposant = path.basename(relatif).replace(/\.tsx$/, '');
  const utilise = new RegExp(`['"][^'"]*/${nomComposant}['"]`).test(code);
  if (utilise || !fs.existsSync(fichier)) {
    if (fs.existsSync(fichier)) restants.push(relatif);
    return;
  }
  fs.unlinkSync(fichier);
  supprimes += 1;
  console.log(`− ${relatif}`);
});
fs.writeFileSync(MANIFESTE, `${JSON.stringify(restants.sort(), null, 2)}\n`);
console.log(`${supprimes} section(s) orpheline(s) supprimée(s).`);
