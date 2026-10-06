#!/usr/bin/env node
/**
 * Supprime les imports devenus inutiles après un déplacement de code.
 *
 * Le découpage déplace des blocs vers d'autres modules : l'écran d'origine
 * conserve alors des imports qui ne servent plus qu'aux sections extraites.
 * Le script s'appuie sur les avertissements d'ESLint
 * (`@typescript-eslint/no-unused-vars`) et reconstruit les déclarations
 * d'imports concernées, sans toucher au reste du fichier.
 *
 * Usage : node scripts/nettoyer-imports.js
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ts = require('/home/user/mobile/node_modules/typescript');

const RACINE = path.resolve(__dirname, '..');

const sortie = execSync('npx eslint . --format json || true', {
  cwd: RACINE,
  maxBuffer: 64 * 1024 * 1024,
  encoding: 'utf8',
});
const rapports = JSON.parse(sortie);

let fichiers = 0;
let retires = 0;

for (const rapport of rapports) {
  const inutilises = new Set(
    rapport.messages
      .filter(
        (m) =>
          m.ruleId === '@typescript-eslint/no-unused-vars' &&
          /'(.*)' is defined but never used|'(.*)' is imported but never used/.test(m.message),
      )
      .map((m) => m.message.match(/'([^']+)'/)[1]),
  );
  if (inutilises.size === 0) continue;

  const contenu = fs.readFileSync(rapport.filePath, 'utf8');
  const sf = ts.createSourceFile(rapport.filePath, contenu, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const remplacements = [];

  sf.forEachChild((noeud) => {
    if (!ts.isImportDeclaration(noeud)) return;
    const clause = noeud.importClause;
    if (!clause) return; // import d'effet de bord : à conserver

    const garderDefaut = clause.name && !inutilises.has(clause.name.text);
    const liaisons = clause.namedBindings;
    const avant = noeud.getStart(sf);
    const apres = noeud.getEnd();

    if (liaisons && ts.isNamespaceImport(liaisons)) {
      if (!inutilises.has(liaisons.name.text)) return;
      remplacements.push({ avant, apres, texte: '' });
      retires += 1;
      return;
    }

    if (!liaisons && clause.name && !garderDefaut) {
      remplacements.push({ avant, apres, texte: '' });
      retires += 1;
      return;
    }

    if (liaisons && ts.isNamedImports(liaisons)) {
      const gardes = liaisons.elements.filter((e) => !inutilises.has(e.name.text));
      if (gardes.length === liaisons.elements.length) return;
      const perdus = liaisons.elements.length - gardes.length + (clause.name && !garderDefaut ? 1 : 0);
      if (gardes.length === 0 && !garderDefaut) {
        remplacements.push({ avant, apres, texte: '' });
        retires += perdus;
        return;
      }
      const morceaux = [];
      if (garderDefaut) morceaux.push(clause.name.text);
      if (gardes.length > 0) {
        morceaux.push(`{ ${gardes.map((e) => e.getText(sf)).join(', ')} }`);
      }
      remplacements.push({
        avant,
        apres,
        texte:
          `import ${clause.isTypeOnly ? 'type ' : ''}${morceaux.join(', ')} from ` +
          `${noeud.moduleSpecifier.getText(sf)};`,
      });
      retires += perdus;
    }
  });

  if (remplacements.length === 0) continue;
  let resultat = contenu;
  remplacements
    .sort((a, b) => b.avant - a.avant)
    .forEach((r) => {
      resultat = resultat.slice(0, r.avant) + r.texte + resultat.slice(r.apres);
    });
  fs.writeFileSync(rapport.filePath, resultat);
  fichiers += 1;
}

console.log(`${retires} import(s) inutile(s) retiré(s) dans ${fichiers} fichier(s).`);
