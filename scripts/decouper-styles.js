#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const ts = require('/home/user/mobile/node_modules/typescript');

const RACINE = path.resolve(__dirname, '..');

const pascal = (texte) =>
  texte
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((mot) => mot.charAt(0).toUpperCase() + mot.slice(1).toLowerCase())
    .join('') || 'Partie';

function decouper(cheminRelatif, seuil) {
  const chemin = path.resolve(RACINE, cheminRelatif);
  const contenu = fs.readFileSync(chemin, 'utf8');
  const sf = ts.createSourceFile(chemin, contenu, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  // Déclaration `export const styles = StyleSheet.create({ … })`
  let objetStyles = null;
  sf.forEachChild((noeud) => {
    if (!ts.isVariableStatement(noeud)) return;
    noeud.declarationList.declarations.forEach((declaration) => {
      if (
        declaration.initializer &&
        ts.isCallExpression(declaration.initializer) &&
        declaration.initializer.expression.getText(sf).endsWith('.create') &&
        ts.isObjectLiteralExpression(declaration.initializer.arguments[0])
      ) {
        objetStyles = declaration.initializer.arguments[0];
      }
    });
  });
  if (!objetStyles) throw new Error(`Aucune feuille de styles dans ${cheminRelatif}`);

  const importStyles = contenu
    .split('\n')
    .filter((ligne) => ligne.startsWith('import '))
    .join('\n');
  const entete = contenu.slice(0, Math.max(0, contenu.indexOf('import ')));
  const dossier = path.dirname(chemin);
  const base = path.basename(chemin, '.styles.ts');

  // Regroupement : un groupe par commentaire de section, ou par seuil de lignes.
  const groupes = [];
  const proprietes = objetStyles.properties;
  let courant = { nom: null, elements: [], lignes: 0 };
  proprietes.forEach((propriete, index) => {
    const debut = propriete.getFullStart();
    const texteAvant = contenu.slice(debut, propriete.getStart(sf));
    const banniere = texteAvant
      .split('\n')
      .map((l) => l.trim().replace(/^\/\*+|\*+\/$|\/\/+/g, '').trim())
      .map((l) => l.replace(/^[=\-*_#\s]+|[=\-*_#\s]+$/g, '').trim())
      .filter((l) => l.length > 1 && !l.startsWith('*'))
      .pop();
    if (banniere && courant.elements.length > 0) {
      groupes.push(courant);
      courant = { nom: banniere, elements: [], lignes: 0 };
    } else if (banniere && !courant.nom) {
      courant.nom = banniere;
    }
    if (courant.lignes > seuil) {
      groupes.push(courant);
      courant = { nom: null, elements: [], lignes: 0 };
    }
    // On coupe jusqu'au début de la propriété suivante : la virgule séparatrice
    // et la mise en forme d'origine sont ainsi conservées à l'identique.
    const fin =
      index + 1 < proprietes.length ? proprietes[index + 1].getFullStart() : propriete.getEnd();
    courant.elements.push(contenu.slice(propriete.getStart(sf), fin));
    courant.lignes +=
      sf.getLineAndCharacterOfPosition(propriete.getEnd()).line -
      sf.getLineAndCharacterOfPosition(propriete.getStart(sf)).line +
      1;
  });
  if (courant.elements.length > 0) groupes.push(courant);

  if (groupes.length < 2) {
    console.log(`${cheminRelatif} : rien à découper (${groupes.length} groupe).`);
    return;
  }

  const agregations = [];
  const dejaVus = new Set();
  groupes.forEach((groupe, index) => {
    let radical = `${base}${pascal(groupe.nom ?? `Partie ${index + 1}`)}`;
    let suffixe = 2;
    while (dejaVus.has(radical)) {
      radical = `${base}${pascal(groupe.nom ?? `Partie ${index + 1}`)}${suffixe}`;
      suffixe += 1;
    }
    dejaVus.add(radical);
    const nomGroupe = radical;
    const export_ = `styles${nomGroupe.slice(base.length)}`;
    const fichier = path.join(dossier, `${nomGroupe}.ts`);
    fs.writeFileSync(
      fichier,
      `${entete}${importStyles}\n\n/**\n * Styles \`${groupe.nom ?? `Partie ${index + 1}`}\` — extraits de \`${base}\`.\n */\nexport const ${export_} = StyleSheet.create({\n${groupe.elements.join('\n\n')}\n});\n`,
    );
    agregations.push({ fichier: `./${nomGroupe}`, export_ });
    console.log(`✓ src/${path.relative(path.join(RACINE, 'src'), fichier).replace(/\\/g, '/')}`);
  });

  fs.writeFileSync(
    chemin,
    `${entete}${agregations
      .map((a) => `import { ${a.export_} } from '${a.fichier}';`)
      .join('\n')}\n\n/**\n * Feuille de styles de \`${base}\` — agrégat des groupes.\n *\n * Les clés restent identiques à celles d'origine (\`styles.xxx\`) : seul le\n * rangement a changé, ce qui évite d'avoir un fichier de plusieurs milliers de\n * lignes.\n */\nexport const styles = {\n${agregations
      .map((a) => `  ...${a.export_},`)
      .join('\n')}\n};\n`,
  );
  console.log(
    `✓ ${cheminRelatif} : ${contenu.split('\n').length} → ${groupes.length} groupes + agrégateur`,
  );
}

const args = process.argv.slice(2);
let seuil = 250;
const cibles = [];
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === '--seuil') seuil = Number(args[(i += 1)]);
  else cibles.push(args[i]);
}
if (cibles.length === 0) {
  console.error('Usage : node scripts/decouper-styles.js <fichier.styles.ts> [--seuil 250]');
  process.exit(1);
}
cibles.forEach((cible) => decouper(cible, seuil));
