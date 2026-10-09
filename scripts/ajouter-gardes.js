#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const RACINE = path.resolve(__dirname, '..');

const GARDES = [
  { fichier: 'src/components/ObservationComponent/VueModificationObservation.tsx', props: ['observation'] },
  { fichier: 'src/components/ProfileComponent/VueProfil.tsx', props: ['profile'] },
];

let ajouts = 0;
GARDES.forEach(({ fichier, props }) => {
  const chemin = path.join(RACINE, fichier);
  let contenu = fs.readFileSync(chemin, 'utf8');
  const manquantes = props.filter(
    (prop) => !contenu.includes(`if (!${prop}) return null;`),
  );
  if (manquantes.length === 0) return;

  const motif = /^(export function \w+\(\{[\s\S]*?\n\}: Props\) \{)$/m;
  if (!motif.test(contenu)) {
    console.warn(`⚠ ${fichier} : signature introuvable, garde non ajoutée`);
    return;
  }
  const gardes = manquantes.map((prop) => `  if (!${prop}) return null;`).join('\n');
  contenu = contenu.replace(motif, `$1\n${gardes}`);
  fs.writeFileSync(chemin, contenu);
  ajouts += manquantes.length;
  console.log(`✓ ${fichier} : garde ${manquantes.join(', ')}`);
});

if (ajouts === 0) console.log('Gardes déjà présentes.');
