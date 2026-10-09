#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const ts = require('/home/user/mobile/node_modules/typescript');

const RACINE = path.resolve(__dirname, '..');

const GLOBAUX_MOTS = new Set([
  'StyleSheet', 'Platform', 'Dimensions', 'PixelRatio', 'I18nManager', 'View',
]);

function lireImports(source, contenu) {
  const table = new Map();
  source.forEachChild((noeud) => {
    if (!ts.isImportDeclaration(noeud) || !noeud.importClause) return;
    const ligne = contenu.slice(noeud.getStart(source), noeud.getEnd());
    const clause = noeud.importClause;
    if (clause.name) table.set(clause.name.text, ligne);
    const liaisons = clause.namedBindings;
    if (liaisons && ts.isNamedImports(liaisons)) {
      liaisons.elements.forEach((element) => table.set(element.name.text, ligne));
    }
    if (liaisons && ts.isNamespaceImport(liaisons)) table.set(liaisons.name.text, ligne);
  });
  return table;
}

function identifiants(texte) {
  const sf = ts.createSourceFile('f.tsx', texte, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const noms = new Set();
  const visiter = (noeud) => {
    if (ts.isIdentifier(noeud)) {
      const parent = noeud.parent;
      let compter = true;
      if (parent) {
        if (ts.isPropertyAccessExpression(parent) && parent.name === noeud) compter = false;
        if (ts.isPropertyAssignment(parent) && parent.name === noeud) compter = false;
        if (ts.isPropertySignature(parent) && parent.name === noeud) compter = false;
        if (ts.isVariableDeclaration(parent) && parent.name === noeud) compter = false;
      }
      if (compter) noms.add(noeud.text);
    }
    ts.forEachChild(noeud, visiter);
  };
  visiter(sf);
  return noms;
}

function extraire(cheminRelatif) {
  const chemin = path.resolve(RACINE, cheminRelatif);
  const contenu = fs.readFileSync(chemin, 'utf8');
  const source = ts.createSourceFile(chemin, contenu, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  let declaration = null;
  source.forEachChild((noeud) => {
    if (!ts.isVariableStatement(noeud)) return;
    noeud.declarationList.declarations.forEach((d) => {
      if (
        ts.isIdentifier(d.name) &&
        d.name.text === 'styles' &&
        d.initializer &&
        ts.isCallExpression(d.initializer)
      ) {
        declaration = { noeud, d };
      }
    });
  });

  if (!declaration) {
    console.log(`${cheminRelatif} : aucune feuille de styles.`);
    return;
  }

  const corps = `const ${contenu.slice(declaration.d.getStart(source), declaration.d.getEnd())};`;
  const table = lireImports(source, contenu);
  const lignesImport = [];
  [...identifiants(corps)].sort().forEach((nom) => {
    const ligne = table.get(nom);
    if (ligne && !lignesImport.includes(ligne)) lignesImport.push(ligne);
  });
  if (!lignesImport.some((l) => l.includes("from 'react-native'"))) {
    lignesImport.unshift("import { StyleSheet } from 'react-native';");
  }

  const nomEcran = path.basename(chemin, '.tsx');
  const fichierStyles = path.join(path.dirname(chemin), `${nomEcran}.styles.ts`);
  fs.writeFileSync(
    fichierStyles,
    `/**\n * Feuille de styles de \`${nomEcran}\`.\n *\n * Extraite du composant pour garder des fichiers courts et lisibles : le\n * composant décrit l'interface, ce module décrit son apparence.\n */\n${lignesImport.join('\n')}\n\nexport ${corps}\n`,
  );

  // Retrait de la déclaration, ajout de l'import à la suite des imports existants.
  let resultat = contenu.slice(0, declaration.noeud.getStart(source)) +
    contenu.slice(declaration.noeud.getEnd());
  const finImports = Math.max(
    ...[...resultat.matchAll(/^import[\s\S]*?;\s*$/gm)].map((m) => m.index + m[0].length),
  );
  resultat =
    resultat.slice(0, finImports) +
    `\nimport { styles } from './${nomEcran}.styles';` +
    resultat.slice(finImports);
  resultat = resultat.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n');

  fs.writeFileSync(chemin, resultat);
  console.log(
    `✓ ${cheminRelatif} : styles extraits (${contenu.split('\n').length} → ${resultat.split('\n').length} lignes)`,
  );
}

const cibles = process.argv.slice(2);
if (cibles.length === 0) {
  console.error('Usage : node scripts/extraire-styles.js <fichier.tsx> [autre.tsx …]');
  process.exit(1);
}
cibles.forEach(extraire);
