#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const RACINE = path.resolve(__dirname, '..');

const sortie = execSync('npx eslint . --quiet --format json || true', {
  cwd: RACINE,
  maxBuffer: 64 * 1024 * 1024,
  encoding: 'utf8',
});
const rapports = JSON.parse(sortie);

let corriges = 0;

for (const rapport of rapports) {
  const messages = rapport.messages.filter((m) => m.ruleId === 'react/no-unescaped-entities');
  if (messages.length === 0) continue;

  const lignes = fs.readFileSync(rapport.filePath, 'utf8').split('\n');
  // Une même ligne peut contenir plusieurs apostrophes : on corrige de la
  // droite vers la gauche pour ne pas décaler les colonnes restantes.
  const parLigne = new Map();
  messages.forEach((message) => {
    if (!parLigne.has(message.line)) parLigne.set(message.line, []);
    parLigne.get(message.line).push(message.column);
  });

  [...parLigne.entries()].forEach(([numero, colonnes]) => {
    const index = numero - 1;
    colonnes
      .sort((a, b) => b - a)
      .forEach((colonne) => {
        const position = colonne - 1;
        if (lignes[index][position] === "'") {
          lignes[index] = lignes[index].slice(0, position) + '&apos;' + lignes[index].slice(position + 1);
          corriges += 1;
        }
      });
  });

  fs.writeFileSync(rapport.filePath, lignes.join('\n'));
}

console.log(`${corriges} apostrophe(s) échappée(s).`);
