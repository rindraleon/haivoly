#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const ts = require('/home/user/mobile/node_modules/typescript');

const RACINE = path.resolve(__dirname, '..');
const BASELINE = process.env.BASELINE || path.join(process.env.HOME, '.refactor-baseline-ecrans');
const DOSSIER_COMPOSANTS = path.join(RACINE, 'src', 'components');

const GLOBAUX = new Set([
  'undefined', 'NaN', 'Infinity', 'console', 'Math', 'JSON', 'Object', 'Array', 'Number', 'String',
  'Boolean', 'Date', 'Promise', 'Error', 'Set', 'Map', 'RegExp', 'Intl', 'isNaN', 'parseInt',
  'parseFloat', 'encodeURIComponent', 'decodeURIComponent', 'setTimeout', 'clearTimeout',
  'setInterval', 'clearInterval', 'fetch', 'AbortController', 'require', 'globalThis', 'Symbol',
  'WeakMap', 'WeakSet', 'BigInt', 'structuredClone', 'queueMicrotask', 'arguments', 'this',
]);

/* ------------------------------------------------------------------ */
/* Outils                                                              */
/* ------------------------------------------------------------------ */

/** Domaine d'écran (`CultureScreen`) → dossier de composants (`CultureComponent`). */
function dossierComposantsDuDomaine(domaine) {
  if (!domaine.endsWith('Screen')) return domaine;
  return `${domaine.slice(0, -'Screen'.length)}Component`;
}

const enTete = (titre, description) => `/**\n * ${titre}\n *\n${description}\n */\n`;

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

function identifiantsUtilises(texte) {
  const sf = ts.createSourceFile('f.tsx', texte, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const noms = new Set();
  const visiter = (noeud) => {
    if (ts.isIdentifier(noeud)) {
      const parent = noeud.parent;
      let compter = true;
      if (parent) {
        if ((ts.isPropertyAccessExpression(parent) || ts.isQualifiedName(parent)) && parent.name === noeud) compter = false;
        if ((ts.isPropertyAssignment(parent) || ts.isPropertySignature(parent)) && parent.name === noeud) compter = false;
        if (ts.isJsxAttribute(parent) || ts.isJsxNamespacedName(parent)) compter = false;
        if (ts.isMethodDeclaration(parent) && parent.name === noeud) compter = false;
        if (ts.isVariableDeclaration(parent) && parent.name === noeud) compter = false;
        if (ts.isParameter(parent) && parent.name === noeud) compter = false;
        if (ts.isFunctionDeclaration(parent) && parent.name === noeud) compter = false;
        if (ts.isFunctionExpression(parent) && parent.name === noeud) compter = false;
        if (ts.isEnumMember(parent) && parent.name === noeud) compter = false;
        if (ts.isLabeledStatement(parent) && parent.label === noeud) compter = false;
      }
      if (compter) noms.add(noeud.text);
    }
    ts.forEachChild(noeud, visiter);
  };
  visiter(sf);
  return noms;
}

function nomsDeclares(noeud) {
  const noms = new Set();
  const visiter = (n) => {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name)) noms.add(n.name.text);
    if (ts.isParameter(n) && ts.isIdentifier(n.name)) noms.add(n.name.text);
    if (ts.isFunctionDeclaration(n) && n.name) noms.add(n.name.text);
    if (ts.isFunctionExpression(n) && n.name) noms.add(n.name.text);
    if (ts.isCatchClause(n) && n.variableDeclaration && ts.isIdentifier(n.variableDeclaration.name))
      noms.add(n.variableDeclaration.name.text);
    ts.forEachChild(n, visiter);
  };
  visiter(noeud);
  return noms;
}

function contientJsx(texte) {
  const sf = ts.createSourceFile('f.tsx', texte, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let trouve = false;
  const visiter = (n) => {
    if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n) || ts.isJsxFragment(n)) trouve = true;
    if (!trouve) ts.forEachChild(n, visiter);
  };
  visiter(sf);
  return trouve;
}

function construireImports(texte, table, exclure, forces) {
  const lignes = [];
  [...identifiantsUtilises(texte)].sort().forEach((nom) => {
    if (GLOBAUX.has(nom) || exclure.has(nom)) return;
    const ligne = table.get(nom);
    if (ligne && !lignes.includes(ligne)) lignes.push(ligne);
  });
  forces.forEach((ligne) => {
    if (ligne && !lignes.includes(ligne)) lignes.push(ligne);
  });
  return lignes.join('\n');
}

/** Noms exportés par un module (déclarations `export` + `export { … }`). */
function exportsDuFichier(chemin) {
  if (!fs.existsSync(chemin)) return new Map();
  const contenu = fs.readFileSync(chemin, 'utf8');
  const sf = ts.createSourceFile(chemin, contenu, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const noms = new Map();
  sf.forEachChild((noeud) => {
    const exporte = noeud.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    if (exporte && noeud.name && ts.isIdentifier(noeud.name)) noms.set(noeud.name.text, chemin);
    if (ts.isVariableStatement(noeud) && exporte) {
      noeud.declarationList.declarations.forEach((d) => {
        if (ts.isIdentifier(d.name)) noms.set(d.name.text, chemin);
      });
    }
    if (ts.isExportDeclaration(noeud) && noeud.exportClause && ts.isNamedExports(noeud.exportClause)) {
      noeud.exportClause.elements.forEach((e) => noms.set(e.name.text, chemin));
    }
  });
  return noms;
}

const importsDuDossier = (dossier) => {
  const table = new Map();
  if (!fs.existsSync(dossier)) return table;
  fs.readdirSync(dossier).forEach((nom) => {
    if (!/\.tsx?$/.test(nom) || nom.endsWith('.styles.ts')) return;
    exportsDuFichier(path.join(dossier, nom)).forEach((valeur, cle) => table.set(cle, valeur));
  });
  return table;
};

/* ------------------------------------------------------------------ */
/* Extraction                                                          */
/* ------------------------------------------------------------------ */

function traiter(cheminRelatif, minLignes) {
  const chemin = path.resolve(RACINE, cheminRelatif);
  const contenu = fs.readFileSync(chemin, 'utf8');
  const source = ts.createSourceFile(chemin, contenu, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const domaine = path.basename(path.dirname(chemin));
  const nomEcran = path.basename(chemin, '.tsx');

  // Table d'imports : le fichier courant, complété par l'écran de référence
  // (une passe précédente a pu retirer un import encore nécessaire).
  const tableImports = lireImports(source, contenu);
  const relatif = path.relative(path.join(RACINE, 'src'), chemin);
  const reference = path.join(BASELINE, relatif);
  if (fs.existsSync(reference)) {
    const texteReference = fs.readFileSync(reference, 'utf8');
    lireImports(
      ts.createSourceFile(reference, texteReference, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX),
      texteReference,
    ).forEach((valeur, cle) => {
      if (!tableImports.has(cle)) tableImports.set(cle, valeur);
    });
  }

  const declarations = [];
  source.forEachChild((n) => {
    if (ts.isFunctionDeclaration(n) && n.name) {
      declarations.push({ nom: n.name.text, noeud: n, defaut: !!n.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword) });
    } else if (ts.isVariableStatement(n)) {
      n.declarationList.declarations.forEach((d) => {
        if (ts.isIdentifier(d.name)) {
          declarations.push({ nom: d.name.text, noeud: d, statement: n });
        }
      });
    } else if (n.name && ts.isIdentifier(n.name)) {
      declarations.push({ nom: n.name.text, noeud: n });
    }
  });
  const principale =
    declarations.find((d) => d.defaut) ??
    declarations.filter((d) => ts.isFunctionDeclaration(d.noeud) && /^[A-Z]/.test(d.nom)).pop();
  if (!principale || !principale.noeud.body) {
    console.log(`${cheminRelatif} : composant principal introuvable.`);
    return;
  }

  const moduleNoms = new Set(declarations.map((d) => d.nom));
  tableImports.forEach((_, nom) => moduleNoms.add(nom));

  const typesDuFichier = new Set();
  source.forEachChild((n) => {
    if (
      (ts.isTypeAliasDeclaration(n) ||
        ts.isInterfaceDeclaration(n) ||
        ts.isEnumDeclaration(n) ||
        ts.isModuleDeclaration(n)) &&
      n.name &&
      ts.isIdentifier(n.name)
    ) {
      typesDuFichier.add(n.name.text);
      moduleNoms.add(n.name.text);
    }
  });
  const valeursDuFichier = new Set(
    declarations.filter((d) => !typesDuFichier.has(d.nom)).map((d) => d.nom),
  );

  const dossierHelpers = path.join(RACINE, 'src', 'screens', domaine, `${nomEcran}.helpers.ts`);
  const dossierComposants = path.join(DOSSIER_COMPOSANTS, dossierComposantsDuDomaine(domaine));
  const exportables = new Map();
  exportsDuFichier(dossierHelpers).forEach((valeur, cle) => exportables.set(cle, 'helpers'));
  importsDuDossier(dossierComposants).forEach((valeur, cle) => exportables.set(cle, path.basename(valeur, '.tsx')));
  exportables.forEach((_, nom) => moduleNoms.add(nom));

  // ── Candidates : fonctions et fonctions fléchées déclarées dans le composant ──
  const candidates = [];
  const visiter = (n) => {
    if (ts.isFunctionDeclaration(n) && n.name && n !== principale.noeud) {
      candidates.push({ nom: n.name.text, noeud: n, debut: n.getStart(source), fin: n.getEnd() });
    } else if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer &&
      (ts.isArrowFunction(n.initializer) || ts.isFunctionExpression(n.initializer))) {
      const statement = n.parent.parent; // VariableDeclarationList → VariableStatement
      const seule = statement.declarationList.declarations.length === 1;
      candidates.push({
        nom: n.name.text,
        noeud: n.initializer,
        debut: (seule ? statement : n).getStart(source),
        fin: (seule ? statement : n).getEnd(),
        statement: seule ? statement : null,
      });
    }
    ts.forEachChild(n, visiter);
  };
  ts.forEachChild(principale.noeud.body, visiter);

  const infos = candidates.map((c) => {
    const texte = contenu.slice(c.debut, c.fin);
    const internes = nomsDeclares(c.noeud);
    const libres = [...identifiantsUtilises(texte)].filter((nom) => !internes.has(nom));
    return { ...c, texte, libres, jsx: contientJsx(texte) };
  });

  // ── Point fixe : une fonction est déplaçable si ses identifiants libres sont
  //    tous de portée module (ou déjà déplacés) — et qu'elle n'appelle pas de hook.
  const deplacables = new Set();
  let progression = true;
  while (progression) {
    progression = false;
    infos.forEach((info) => {
      if (deplacables.has(info)) return;
      const admissibles = info.libres.every(
        (nom) =>
          GLOBAUX.has(nom) ||
          moduleNoms.has(nom) ||
          [...deplacables].some((d) => d.nom === nom),
      ) && !info.libres.some((nom) => valeursDuFichier.has(nom));
      const hooks = info.libres.some((nom) => /^use[A-Z]/.test(nom));
      if (admissibles && !hooks) {
        deplacables.add(info);
        progression = true;
      }
    });
  }

  const retenues = [...deplacables].filter(
    (info) => info.texte.split('\n').length >= minLignes,
  );
  // Le seuil ne doit jamais casser une dépendance : toute fonction déjà
  // déplacable appelée par une fonction retenue est sortie avec elle.
  let ajout = true;
  while (ajout) {
    ajout = false;
    [...retenues].forEach((info) => {
      deplacables.forEach((candidat) => {
        if (retenues.includes(candidat)) return;
        if (info.libres.includes(candidat.nom)) {
          retenues.push(candidat);
          ajout = true;
        }
      });
    });
  }
  retenues.sort((a, b) => a.debut - b.debut);

  if (retenues.length === 0) {
    console.log(`${nomEcran} : aucune fonction pure imbriquée à sortir.`);
    return;
  }

  const nomsRetenus = new Set(retenues.map((r) => r.nom));
  const nouveaux = new Map(); // nom → origine ('helpers' ou fichier composant)
  retenues.forEach((info) => {
    const origine = info.jsx ? 'composant' : 'helpers';
    nouveaux.set(info.nom, origine);
    exportables.set(info.nom, origine);
  });

  const ecrire = (cheminCible, corps, titre, description, estHelpers) => {
    const exclure = new Set([...nouveaux.keys(), ...exportables.keys()]);
    const forces = [];
    const utilises = [...identifiantsUtilises(corps)];
    // Dans le module d'utilitaires lui-même, les noms qu'il exporte sont déjà
    // en portée : aucune auto-importation.
    const versHelpers = estHelpers
      ? []
      : utilises.filter((n) => exportables.get(n) === 'helpers' && !nouveaux.has(n));
    if (versHelpers.length > 0) {
      forces.push(`import { ${versHelpers.sort().join(', ')} } from '@/screens/${domaine}/${nomEcran}.helpers';`);
    }
    utilises
      .filter((n) => exportables.get(n) && exportables.get(n) !== 'helpers' && exportables.get(n) !== 'composant' && !nouveaux.has(n))
      .sort()
      .forEach((n) => forces.push(`import { ${n} } from '@/components/${dossierComposantsDuDomaine(domaine)}/${exportables.get(n)}';`));
    const typesRequis = [...identifiantsUtilises(corps)]
      .filter((nom) => typesDuFichier.has(nom) && !tableImports.has(nom) && !exportables.has(nom))
      .sort();
    if (typesRequis.length > 0) {
      forces.push(
        `import type { ${typesRequis.join(', ')} } from '@/screens/${domaine}/${nomEcran}';`,
      );
    }
    const imports = construireImports(corps, tableImports, exclure, forces);
    fs.mkdirSync(path.dirname(cheminCible), { recursive: true });
    // Idempotence : une fonction déjà présente dans le module cible n'est pas
    // réécrite (le script peut être relancé sur ses propres productions).
    if (fs.existsSync(cheminCible)) {
      const existant = fs.readFileSync(cheminCible, 'utf8');
      const nouveauxTexte = corps;
      if (nouveauxTexte.split('\n\n').every((bloc) => !bloc.trim() || existant.includes(bloc.trim()))) {
        return;
      }
    }
    const prefixe = fs.existsSync(cheminCible) ? '\n\n' : enTete(titre, description);
    fs.appendFileSync(cheminCible, `${prefixe}${imports ? `${imports}\n\n` : ''}${corps}\n`);
    console.log(`✓ ${path.relative(RACINE, cheminCible)} ← ${titre}`);
  };

  const corpsHelpers = [];
  const corpsComposants = new Map();
  retenues.forEach((info) => {
    let texte = info.texte.trimEnd();
    if (ts.isFunctionDeclaration(info.noeud)) {
      if (!/^\s*(?:export\s+)?(?:async\s+)?function\b/.test(texte)) return;
      texte = texte.replace(/^(\s*)(?:export\s+)?/, '$1export ');
    } else {
      texte = texte.replace(/^(export\s+)?/, 'export ');
    }
    if (info.jsx) {
      const cible = path.join(dossierComposants, `${info.nom}.tsx`);
      corpsComposants.set(cible, [...(corpsComposants.get(cible) ?? []), texte]);
    } else {
      corpsHelpers.push(texte);
    }
  });

  if (corpsHelpers.length > 0) {
    ecrire(
      dossierHelpers,
      corpsHelpers.join('\n\n'),
      `Fonctions pures de \`${nomEcran}\` (${corpsHelpers.length}).`,
      " * Déclarées à l'origine dans le composant, elles n'en dépendent pas :\n" +
        ' * les sortir garde le composant lisible et les rend testables.',
      true,
    );
  }
  corpsComposants.forEach((textes, cible) => {
    ecrire(
      cible,
      textes.join('\n\n'),
      `Bloc de rendu \`${path.basename(cible, '.tsx')}\` extrait de \`${nomEcran}\`.`,
      " * Ce bloc produit du JSX : il devient un vrai composant, appelé à\n" +
        ' * l\'identique depuis son écran.',
    );
  });

  // ── Réécriture de l'écran : retrait des corps + imports des nouveaux modules ──
  let resultat = contenu;
  [...retenues]
    .sort((a, b) => b.debut - a.debut)
    .forEach((info) => {
      resultat = resultat.slice(0, info.debut) + resultat.slice(info.fin);
    });
  resultat = resultat.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n');

  const finImports = Math.max(...[...resultat.matchAll(/^import[\s\S]*?;\s*$/gm)].map((m) => m.index + m[0].length));
  const corpsFinal = resultat.slice(finImports);
  const utilisesFinal = identifiantsUtilises(corpsFinal);
  const ajouts = [];
  const versHelpers = [...utilisesFinal].filter((n) => exportables.get(n) === 'helpers' && nomsRetenus.has(n)).sort();
  if (versHelpers.length > 0) {
    ajouts.push(`import { ${versHelpers.join(', ')} } from '@/screens/${domaine}/${nomEcran}.helpers';`);
  }
  [...utilisesFinal]
    .filter((n) => nomsRetenus.has(n) && exportables.get(n) && exportables.get(n) !== 'helpers')
    .sort()
    .forEach((n) => ajouts.push(`import { ${n} } from '@/components/${dossierComposantsDuDomaine(domaine)}/${exportables.get(n)}';`));
  if (ajouts.length > 0) {
    resultat = resultat.slice(0, finImports) + '\n' + ajouts.join('\n') + resultat.slice(finImports);
  }
  // Les types de l'écran réutilisés par les modules extraits sont exportés.
  const typesUtilises = new Set();
  [dossierHelpers, ...[...corpsComposants.keys()]].forEach((fichier) => {
    if (!fs.existsSync(fichier)) return;
    identifiantsUtilises(fs.readFileSync(fichier, 'utf8')).forEach((nom) => {
      if (typesDuFichier.has(nom)) typesUtilises.add(nom);
    });
  });
  typesUtilises.forEach((nom) => {
    const motif = new RegExp(`^((?:interface|type|enum|declare namespace)\\s+)${nom}\\b`, 'm');
    if (motif.test(resultat) && !new RegExp(`export\\s+(?:interface|type|enum)\\s+${nom}\\b`).test(resultat)) {
      resultat = resultat.replace(motif, 'export $1' + nom);
    }
  });

  fs.writeFileSync(chemin, resultat.replace(/\n{3,}/g, '\n\n'));
  console.log(
    `✓ ${cheminRelatif} : ${contenu.split('\n').length} → ${resultat.split('\n').length} lignes (${retenues.length} fonction(s) sortie(s))`,
  );
}

const args = process.argv.slice(2);
let minLignes = 25;
const cibles = [];
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === '--min') minLignes = Number(args[(i += 1)]);
  else cibles.push(args[i]);
}
if (cibles.length === 0) {
  console.error('Usage : node scripts/extraire-imbriquees.js <écran.tsx> [--min 25]');
  process.exit(1);
}
cibles.forEach((cible) => traiter(cible, minLignes));
