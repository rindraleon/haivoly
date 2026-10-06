#!/usr/bin/env node
/**
 * Découpe un écran volumineux en modules courts.
 *
 * L'analyse s'appuie sur l'**AST TypeScript** (et non sur des expressions
 * régulières) : les bornes des fonctions de premier niveau sont donc exactes,
 * y compris dans du JSX complexe.
 *
 *   • fonctions utilitaires déclarées avant le composant principal
 *   • déclarations annexes (types, constantes, fonctions fléchées) utilisées
 *     par le code extrait
 *       → `src/screens/<domaine>/<Nom>Screen.helpers.ts`
 *   • sous-composants (autres fonctions de premier niveau)
 *       → `src/components/<domaine>/<Nom>.tsx`
 *   • chaque module reçoit **uniquement les imports dont il a besoin**.
 *
 * Usage : node scripts/decouper-ecran.js src/screens/<domaine>/<Nom>Screen.tsx
 */
const fs = require('fs');
const path = require('path');

const ts = require('/home/user/mobile/node_modules/typescript');

const MOTS_CLES = new Set([
  'if', 'else', 'for', 'while', 'return', 'const', 'let', 'var', 'function',
  'type', 'interface', 'enum', 'class', 'new', 'typeof', 'instanceof', 'in',
  'of', 'case', 'switch', 'break', 'continue', 'default', 'export', 'import',
  'from', 'as', 'try', 'catch', 'finally', 'throw', 'await', 'async', 'yield',
  'void', 'null', 'undefined', 'true', 'false', 'this', 'super', 'extends',
  'implements', 'keyof', 'readonly', 'public', 'private', 'protected', 'static',
  'get', 'set', 'delete', 'do', 'with', 'debugger', 'satisfies', 'number',
  'string', 'boolean', 'any', 'unknown', 'never', 'object', 'symbol', 'bigint',
]);

const GLOBAUX = new Set([
  'React', 'console', 'Math', 'JSON', 'Object', 'Array', 'String', 'Number',
  'Boolean', 'Date', 'Promise', 'Map', 'Set', 'Error', 'RegExp', 'parseInt',
  'parseFloat', 'isNaN', 'isFinite', 'setTimeout', 'clearTimeout', 'setInterval',
  'clearInterval', 'decodeURIComponent', 'encodeURIComponent', 'alert', 'fetch',
  'process', 'globalThis', 'Symbol', 'WeakMap', 'BigInt', 'arguments',
]);

const racine = path.resolve(__dirname, '..');

/* ------------------------------------------------------------------ */
/* Analyse                                                             */
/* ------------------------------------------------------------------ */

/** Domaine d'écran (`CultureScreen`) → dossier de composants (`CultureComponent`). */
function dossierComposantsDuDomaine(domaine) {
  if (!domaine.endsWith('Screen')) return domaine;
  return `${domaine.slice(0, -'Screen'.length)}Component`;
}

function lireImports(source, contenu) {
  const table = new Map();
  source.forEachChild((noeud) => {
    if (!ts.isImportDeclaration(noeud)) return;
    const ligne = contenu
      .slice(noeud.getStart(source), noeud.getEnd())
      .replace(/;+\s*$/, '')
      .trim() + ';';
    const clause = noeud.importClause;
    if (!clause) return;
    if (clause.name) table.set(clause.name.text, ligne);
    if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
      clause.namedBindings.elements.forEach((element) => {
        table.set(element.name.text, ligne);
      });
    }
    if (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings)) {
      table.set(clause.namedBindings.name.text, ligne);
    }
  });
  return table;
}

/** Commentaire JSDoc accolé à une déclaration (pour le déplacer avec elle). */
function debutAvecCommentaire(source, contenu, noeud) {
  const commentaires = ts.getLeadingCommentRanges(contenu, noeud.pos) ?? [];
  const dernier = commentaires[commentaires.length - 1];
  const texte = dernier && contenu.slice(dernier.pos, dernier.end);
  if (!texte || !texte.startsWith('/**')) return noeud.getStart(source);
  const entre = contenu.slice(dernier.end, noeud.getStart(source));
  if (entre.trim() !== '') return noeud.getStart(source);
  return dernier.pos;
}

function declarations(source, contenu) {
  const fonctions = [];
  const annexes = [];

  source.forEachChild((noeud) => {
    if (ts.isImportDeclaration(noeud) || ts.isExportDeclaration(noeud)) return;

    if (ts.isFunctionDeclaration(noeud) && noeud.name && noeud.body) {
      fonctions.push({
        nom: noeud.name.text,
        debut: debutAvecCommentaire(source, contenu, noeud),
        fin: noeud.getEnd(),
        defaut: (noeud.modifiers ?? []).some(
          (m) => m.kind === ts.SyntaxKind.DefaultKeyword,
        ),
      });
      return;
    }

    const nom = noeud.name && ts.isIdentifier(noeud.name) ? noeud.name.text : null;
    if (!nom) return;

    let jsx = false;
    if (ts.isVariableStatement(noeud)) {
      const declaration = noeud.declarationList.declarations[0];
      const initialiseur = declaration && declaration.initializer;
      jsx =
        /^[A-Z]/.test(nom) &&
        !!initialiseur &&
        (ts.isArrowFunction(initialiseur) ||
          ts.isFunctionExpression(initialiseur)) &&
        contientJsx(contenu.slice(initialiseur.getStart(source), initialiseur.getEnd()));
    }

    annexes.push({
      nom,
      debut: debutAvecCommentaire(source, contenu, noeud),
      fin: noeud.getEnd(),
      jsx,
    });
  });

  return { fonctions, annexes };
}

/**
 * Identifiants réellement référencés dans un fragment de code.
 *
 * Le fragment est analysé par l'AST TypeScript : les commentaires, les chaînes
 * de caractères et les textes JSX (qui contiennent souvent des apostrophes en
 * français) ne peuvent donc pas produire de faux positifs.
 */
function identifiantsUtilises(texte) {
  const numero = { n: 0 };
  const sf = ts.createSourceFile(
    `fragment-${numero.n++}.tsx`,
    texte,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const noms = new Set();

  const estNomDeclare = (noeud) => {
    const parent = noeud.parent;
    if (!parent) return false;
    if (ts.isJsxAttribute(parent)) return true;
    if (ts.isPropertyAccessExpression(parent) && parent.name === noeud) return true;
    if (ts.isQualifiedName(parent) && parent.right === noeud) return true;
    if (ts.isPropertyAssignment(parent) && parent.name === noeud) return true;
    if (ts.isPropertySignature(parent) && parent.name === noeud) return true;
    if (ts.isMethodDeclaration(parent) && parent.name === noeud) return true;
    if (ts.isMethodSignature(parent) && parent.name === noeud) return true;
    if (ts.isPropertyDeclaration(parent) && parent.name === noeud) return true;
    if (ts.isEnumMember(parent) && parent.name === noeud) return true;
    if (ts.isVariableDeclaration(parent) && parent.name === noeud) return true;
    if (ts.isFunctionDeclaration(parent) && parent.name === noeud) return true;
    if (ts.isParameter(parent) && parent.name === noeud) return true;
    if (ts.isLabeledStatement(parent) && parent.label === noeud) return true;
    if (ts.isBreakOrContinueStatement(parent) && parent.label === noeud) return true;
    return false;
  };

  const visiter = (noeud) => {
    if (ts.isIdentifier(noeud) && !estNomDeclare(noeud)) noms.add(noeud.text);
    ts.forEachChild(noeud, visiter);
  };
  visiter(sf);
  return noms;
}

function utilisateurs(texte, noms) {
  const utilises = identifiantsUtilises(texte);
  return noms.filter((nom) => utilises.has(nom));
}

function construireImports(texte, tableImports, aExclure, lignesForcees = []) {
  const lignes = [];
  for (const nom of [...identifiantsUtilises(texte)].sort()) {
    if (MOTS_CLES.has(nom) || GLOBAUX.has(nom) || aExclure.has(nom)) continue;
    const ligne = tableImports.get(nom);
    if (ligne && !lignes.includes(ligne)) lignes.push(ligne);
  }
  for (const ligne of lignesForcees) {
    if (ligne && !lignes.includes(ligne)) lignes.push(ligne);
  }
  return lignes.join('\n');
}

/** Le fragment contient-il du JSX ? (analyse AST, pas de motif fragile) */
function contientJsx(texte) {
  const sf = ts.createSourceFile('fragment.tsx', texte, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let trouve = false;
  const visiter = (n) => {
    if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n) || ts.isJsxFragment(n)) trouve = true;
    if (!trouve) ts.forEachChild(n, visiter);
  };
  visiter(sf);
  return trouve;
}

const enTete = (titre, description) =>
  `/**\n * ${titre}\n *\n${description}\n */\n`;

/* ------------------------------------------------------------------ */
/* Découpage d'un écran                                                */
/* ------------------------------------------------------------------ */

function decouper(cheminRelatif) {
  const chemin = path.resolve(racine, cheminRelatif);
  const contenu = fs.readFileSync(chemin, 'utf8');
  const source = ts.createSourceFile(
    chemin,
    contenu,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );

  const domaine = path.basename(path.dirname(chemin));
  const nomEcran = path.basename(chemin, '.tsx');
  const tableImports = lireImports(source, contenu);
  const { fonctions, annexes } = declarations(source, contenu);

  const principale = fonctions.find((f) => f.defaut);
  if (!principale) throw new Error(`Aucun composant par défaut dans ${cheminRelatif}`);

  // Un sous-composant est une fonction nommée en PascalCase qui rend du JSX ;
  // tout le reste est une fonction utilitaire, où qu'elle soit déclarée.
  const autres = fonctions.filter((f) => !f.defaut);
  const composants = autres.filter(
    (f) => /^[A-Z]/.test(f.nom) && contientJsx(contenu.slice(f.debut, f.fin)),
  );
  const utilitaires = autres.filter(
    (f) => !composants.includes(f) && !contientJsx(contenu.slice(f.debut, f.fin)),
  );

  if (utilitaires.length === 0 && composants.length === 0) {
    console.log(`${nomEcran} : rien à extraire.`);
    return;
  }

  const textes = new Map(
    [...fonctions, ...annexes].map((f) => [f.nom, contenu.slice(f.debut, f.fin)]),
  );

  const nomsUtilitaires = utilitaires.map((f) => f.nom);
  const nomsComposants = composants.map((f) => f.nom);
  const codeExtrait = [...utilitaires, ...composants]
    .map((f) => textes.get(f.nom))
    .join('\n\n');

  // ── Déclarations annexes ──
  // Toutes les déclarations de portée module (constantes, types, tableaux de
  // filtres…) sont déplacées : elles ne dépendent d'aucun état d'interface et
  // leur place est dans le module d'utilitaires, pas dans l'écran.
  // Celles qui portent du JSX deviennent de vrais sous-composants.
  const annexesNecessaires = annexes;
  const annexesSimples = annexesNecessaires.filter((a) => !a.jsx);
  const annexesJsx = annexesNecessaires.filter((a) => a.jsx);

  const nomsAnnexesSimples = annexesSimples.map((a) => a.nom);
  const nomsAnnexesJsx = annexesJsx.map((a) => a.nom);

  // ── Module d'utilitaires ──
  const cheminHelpers = chemin.replace(/\.tsx$/, '.helpers.ts');
  const exportables = [...nomsAnnexesSimples, ...nomsUtilitaires];

  if (exportables.length > 0) {
    const corps = [...annexesSimples, ...utilitaires]
      .map((f) => textes.get(f.nom).replace(/^(\s*)(?:export\s+)?function\s/, '$1export function '))
      .map((texte, index) => {
        const cible = [...annexesSimples, ...utilitaires][index];
        if (nomsAnnexesSimples.includes(cible.nom) && !/^export\b/.test(texte.trimStart())) {
          return texte.replace(/^(\s*)(const|let|type|interface|enum|class)\b/, '$1export $2');
        }
        return texte;
      })
      .join('\n\n');

    const exclure = new Set([...exportables, ...nomsComposants, ...nomsAnnexesJsx]);
    const imports = construireImports(corps, tableImports, exclure);
    fs.writeFileSync(
      cheminHelpers,
      enTete(
        `Utilitaires et types de \`${nomEcran}\`.`,
        " * Extraits de l'écran : ces fonctions ne dépendent pas de l'état de\n" +
          " * l'interface et peuvent donc être testées ou réutilisées isolément.",
      ) + imports + '\n\n' + corps + '\n',
    );
    console.log(`✓ src/screens/${domaine}/${nomEcran}.helpers.ts`);
  }

  // ── Sous-composants ──
  const dossierComposants = path.join(racine, 'src', 'components', dossierComposantsDuDomaine(domaine));
  fs.mkdirSync(dossierComposants, { recursive: true });

  const tousLesComposants = [...nomsComposants, ...nomsAnnexesJsx];

  const ecrireComposant = (nom, corps, doitEtreFonction) => {
    const exclus = new Set([
      nom,
      ...nomsUtilitaires,
      ...annexesSimples.map((a) => a.nom),
      ...nomsAnnexesJsx,
      ...nomsComposants,
      'styles',
    ]);
    const forces = [];
    if (exportables.length > 0) {
      const besoin = utilisateurs(corps, exportables);
      if (besoin.length > 0) {
        forces.push(
          `import { ${besoin.sort().join(', ')} } from '@/screens/${domaine}/${nomEcran}.helpers';`,
        );
      }
    }
    const autres = utilisateurs(corps, tousLesComposants.filter((n) => n !== nom));
    if (autres.length > 0) {
      forces.push(
        ...autres
          .sort()
          .map((n) => `import { ${n} } from '@/components/${dossierComposantsDuDomaine(domaine)}/${n}';`),
      );
    }
    forces.push(`import { styles } from '@/screens/${domaine}/${nomEcran}.styles';`);

    // Les sous-composants extraits sont typés : on force le type des props si présent
    const imports = construireImports(corps, tableImports, exclus, forces);
    const texte = doitEtreFonction
      ? corps.replace(/^\s*function\s+/, 'export function ')
      : corps.replace(/^(\s*)(?:export\s+)?const\s+/, '$1export const ');
    fs.writeFileSync(
      path.join(dossierComposants, `${nom}.tsx`),
      enTete(
        `Sous-composant \`${nom}\` extrait de \`${nomEcran}\`.`,
        " * Regroupe la présentation d'un élément de liste et ses interactions\n" +
          ' * locales, ce qui allège nettement le composant principal.',
      ) + imports + '\n\n' + texte + '\n',
    );
    console.log(`✓ src/components/${domaine}/${nom}.tsx`);
  };

  composants.forEach((f) => ecrireComposant(f.nom, textes.get(f.nom), true));
  annexesJsx.forEach((a) => ecrireComposant(a.nom, textes.get(a.nom), false));

  // ── Réécriture de l'écran ──
  const aRetirer = [...utilitaires, ...composants, ...annexesNecessaires].sort(
    (a, b) => b.debut - a.debut,
  );
  let resultat = contenu;
  for (const element of aRetirer) {
    resultat = resultat.slice(0, element.debut) + resultat.slice(element.fin);
  }
  resultat = resultat.replace(/\n{3,}/g, '\n\n');

  const finImports = Math.max(
    ...[...resultat.matchAll(/^import[\s\S]*?;\s*$/gm)].map((m) => m.index + m[0].length),
  );

  const corpsRestant = resultat.slice(finImports);
  const ajouts = [];
  if (exportables.length > 0) {
    const besoin = utilisateurs(corpsRestant, exportables);
    if (besoin.length > 0) {
      ajouts.push(
        `import { ${besoin.sort().join(', ')} } from '@/screens/${domaine}/${nomEcran}.helpers';`,
      );
    }
  }
  const composantsUtilises = utilisateurs(corpsRestant, tousLesComposants);
  ajouts.push(
    ...composantsUtilises
      .sort()
      .map((nom) => `import { ${nom} } from '@/components/${dossierComposantsDuDomaine(domaine)}/${nom}';`),
  );

  if (ajouts.length > 0) {
    resultat =
      resultat.slice(0, finImports) + '\n' + ajouts.join('\n') + resultat.slice(finImports);
  }
  resultat = resultat.replace(/\n{3,}/g, '\n\n');

  fs.writeFileSync(chemin, resultat);
  console.log(
    `✓ ${cheminRelatif} : ${contenu.split('\n').length} → ${resultat.split('\n').length} lignes`,
  );
}

const cibles = process.argv.slice(2);
if (cibles.length === 0) {
  console.error('Usage : node scripts/decouper-ecran.js <écran.tsx> [autre.tsx …]');
  process.exit(1);
}
cibles.forEach(decouper);
