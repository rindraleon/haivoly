#!/usr/bin/env node
/**
 * Extrait les blocs JSX volumineux d'un écran vers des composants dédiés.
 *
 *   • l'analyse s'appuie sur l'AST **et sur le vérificateur de types** ;
 *   • un bloc n'est extrait que si toutes ses références libres proviennent de
 *     la portée du module (imports) ou de la portée du composant (état,
 *     callbacks, refs) : les variables d'itération d'un `map` interdisent donc
 *     l'extraction, par sécurité ;
 *   • les références au module deviennent des imports, les références au
 *     composant deviennent des props typées automatiquement ;
 *   • le site d'appel est remplacé par `<Nom ... />`, à l'identique ;
 *   • le script est récursif : on peut le relancer sur un composant produit
 *     pour l'affiner (il prend alors le plus gros composant de premier niveau).
 *
 * Usage :
 *   node scripts/extraire-sections.js <écran.tsx> [--min 100] [--max 8]
 *                                    [--liste] [--nom <ligne>=<NomComposant> …]
 */
const fs = require('fs');
const path = require('path');
const ts = require('/home/user/mobile/node_modules/typescript');

const RACINE = path.resolve(__dirname, '..');
const GLOBAUX = new Set([
  'React', 'console', 'Math', 'JSON', 'Object', 'Array', 'String', 'Number',
  'Boolean', 'Date', 'Promise', 'Map', 'Set', 'Error', 'RegExp', 'parseInt',
  'parseFloat', 'isNaN', 'isFinite', 'setTimeout', 'clearTimeout', 'setInterval',
  'clearInterval', 'decodeURIComponent', 'encodeURIComponent', 'alert', 'fetch',
  'process', 'globalThis', 'Symbol', 'WeakMap', 'BigInt', 'arguments',
  'undefined', 'NaN', 'Infinity',
]);

const imprimanteGlobale = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
const MANIFESTE = path.resolve(__dirname, '..', 'src', 'components', 'sections-generees.json');

/** Fichiers produits par le générateur : seul ce manifeste autorise leur suppression. */
/** Domaine d'écran (`CultureScreen`) → dossier de composants (`CultureComponent`). */
function dossierComposantsDuDomaine(domaine) {
  if (!domaine.endsWith('Screen')) return domaine;
  return `${domaine.slice(0, -'Screen'.length)}Component`;
}

function lireManifeste() {
  try {
    const contenu = JSON.parse(fs.readFileSync(MANIFESTE, 'utf8'));
    return Array.isArray(contenu) ? contenu : [];
  } catch {
    return [];
  }
}

function enregistrerDansManifeste(cheminAbsolu) {
  const relatif = path.relative(path.resolve(__dirname, '..'), cheminAbsolu).replace(/\\/g, '/');
  const liste = new Set(lireManifeste());
  liste.add(relatif);
  fs.writeFileSync(MANIFESTE, `${JSON.stringify([...liste].sort(), null, 2)}\n`);
}

/* ------------------------------------------------------------------ */
/* Outils syntaxiques                                                  */
/* ------------------------------------------------------------------ */

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

/** Noms déclarés à l'intérieur d'un noeud (params, variables, fonctions…). */
function nomsDeclares(noeud) {
  const noms = new Set();
  const ajouterMotif = (motif) => {
    if (ts.isIdentifier(motif)) noms.add(motif.text);
    else ts.forEachChild(motif, (c) => ajouterMotif(c));
  };
  const visiter = (n) => {
    if (ts.isVariableDeclaration(n) || ts.isParameter(n) || ts.isBindingElement(n)) {
      ajouterMotif(n.name);
    }
    if ((ts.isFunctionDeclaration(n) || ts.isClassDeclaration(n)) && n.name) {
      noms.add(n.name.text);
    }
    if (ts.isCatchClause(n) && n.variableDeclaration) ajouterMotif(n.variableDeclaration.name);
    if (ts.isImportDeclaration(n) && n.importClause) {
      if (n.importClause.name) noms.add(n.importClause.name.text);
      const liaisons = n.importClause.namedBindings;
      if (liaisons && ts.isNamedImports(liaisons)) {
        liaisons.elements.forEach((e) => noms.add(e.name.text));
      } else if (liaisons) {
        noms.add(liaisons.name.text);
      }
    }
    ts.forEachChild(n, visiter);
  };
  visiter(noeud);
  return noms;
}

function tableImports(source, contenu) {
  const table = new Map();
  source.forEachChild((noeud) => {
    if (!ts.isImportDeclaration(noeud)) return;
    const ligne =
      contenu
        .slice(noeud.getStart(source), noeud.getEnd())
        .replace(/;+\s*$/, '')
        .trim() + ';';
    const clause = noeud.importClause;
    if (!clause) return;
    if (clause.name) table.set(clause.name.text, ligne);
    const liaisons = clause.namedBindings;
    if (liaisons && ts.isNamedImports(liaisons)) {
      liaisons.elements.forEach((e) => table.set(e.name.text, ligne));
    } else if (liaisons) {
      table.set(liaisons.name.text, ligne);
    }
  });
  return table;
}

/** Fusionne les imports nommés d'un même module (une ligne par module). */
function fusionnerImports(lignes) {
  const parModule = new Map();
  const verbatim = [];
  const motif = /^import\s+(type\s+)?(?:([A-Za-z_$][\w$]*)\s*,\s*)?\{\s*([^}]*)\s*\}\s*from\s*'([^']+)';?$/s;
  lignes.forEach((ligne) => {
    const m = ligne.match(motif);
    if (!m || m[2]) {
      verbatim.push(ligne);
      return;
    }
    const module = m[4];
    if (!parModule.has(module)) parModule.set(module, { valeurs: new Set(), types: new Set() });
    const entree = parModule.get(module);
    const destination = m[1] ? entree.types : entree.valeurs;
    m[3]
      .split(',')
      .map((n) => n.trim())
      .filter(Boolean)
      .forEach((nom) => destination.add(nom));
  });
  const fusionnes = [...parModule.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .flatMap(([module, { valeurs, types }]) => {
      const vraisTypes = [...types].filter((nom) => !valeurs.has(nom)).sort();
      return [
        valeurs.size > 0
          ? `import { ${[...valeurs].sort().join(', ')} } from '${module}';`
          : null,
        vraisTypes.length > 0
          ? `import type { ${vraisTypes.join(', ')} } from '${module}';`
          : null,
      ].filter(Boolean);
    });
  return [...fusionnes, ...verbatim];
}

/** `@types/react` → `react`, `@types/babel__core` → `@babel/core`. */
function normaliserPaquet(paquet) {
  if (!paquet.startsWith('@types/')) return paquet;
  const reste = paquet.slice('@types/'.length);
  const [portee, nom] = reste.split('__');
  return nom ? `@${portee}/${nom}` : reste;
}

/** Module d'import d'un symbole, ou null s'il est ambiant (global). */
function moduleDunSymbole(symbole) {
  const declaration = symbole && symbole.declarations && symbole.declarations[0];
  if (!declaration) return null;
  // Déclarations ambiantes (`declare global { … }`) : rien à importer.
  for (let noeud = declaration; noeud; noeud = noeud.parent) {
    if (
      ts.isModuleDeclaration(noeud) &&
      noeud.name &&
      ts.isIdentifier(noeud.name) &&
      noeud.name.text === 'global'
    ) {
      return null;
    }
  }
  const fichier = declaration.getSourceFile().fileName;
  if (/\/typescript\/lib\/lib\.[^/]*\.d\.ts$/.test(fichier)) return null;
  const paquet = fichier.match(/node_modules\/((?:@[^/]+\/)?[^/]+)\//);
  if (paquet) return normaliserPaquet(paquet[1]);
  const relatif = path.relative(RACINE, fichier).replace(/\\/g, '/');
  if (relatif.startsWith('src/')) {
    return `@/${relatif.slice(4).replace(/\.(tsx?|d\.ts)$/, '')}`;
  }
  return null;
}

const estDeclarationDeType = (symbole) => {
  const declaration = symbole && symbole.declarations && symbole.declarations[0];
  return (
    !!declaration &&
    (ts.isTypeAliasDeclaration(declaration) ||
      ts.isInterfaceDeclaration(declaration) ||
      ts.isClassDeclaration(declaration) ||
      ts.isEnumDeclaration(declaration))
  );
};

const pascal = (texte) =>
  texte
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((mot) => mot.charAt(0).toUpperCase() + mot.slice(1).toLowerCase())
    .join('');

/* ------------------------------------------------------------------ */
/* Typage automatique des props                                        */
/* ------------------------------------------------------------------ */

/**
 * Type d'une référence, exprimé lisiblement (props typées automatiquement).
 *
 * Le type est imprimé puis ses symboles sont résolus pour retrouver leur
 * module d'origine. En cas d'homonymie avec un import déjà présent dans le
 * nouveau module (deux types `Intervention` provenant de deux modules), le
 * type importé est renommé (`InterventionApi`) pour lever l'ambiguïté.
 */
/** Spécifieur d'import valable depuis 'import { X } from <spec>' quel que soit le dossier. */
function specifieurAbsolu(ligne, fichierSource) {
  const trouve = ligne && ligne.match(/from\s*'([^']+)'/);
  if (!trouve) return null;
  const specifieur = trouve[1];
  if (specifieur.startsWith('@/') || !specifieur.startsWith('.')) return specifieur;
  const absolu = path.resolve(path.dirname(fichierSource), specifieur);
  const relatif = path.relative(RACINE, absolu).replace(/\\/g, '/');
  return relatif.startsWith('src/') ? `@/${relatif.slice(4)}` : specifieur;
}

function typeDeReference(identifiant, verificateur, sf, ajouterImport, options = {}) {
  const { surTypeEcran = () => {}, imports = new Map(), aliasPourType } = options;
  const symboleReference = verificateur.getSymbolAtLocation(identifiant);
  const declaration = symboleReference && symboleReference.declarations
    ? symboleReference.declarations[0]
    : null;
  let type = null;
  if (declaration && ts.isVariableDeclaration(declaration) && declaration.type) {
    type = verificateur.getTypeFromTypeNode(declaration.type);
  } else if (
    declaration &&
    (ts.isVariableDeclaration(declaration) || ts.isBindingElement(declaration)) &&
    declaration.name
  ) {
    // Type déclaré (et non le type rétréci par un `if` englobant).
    type = verificateur.getTypeAtLocation(declaration.name);
  } else if (symboleReference) {
    type = verificateur.getTypeOfSymbolAtLocation(symboleReference, identifiant);
  } else {
    type = verificateur.getTypeAtLocation(identifiant);
  }
  if (!type) return 'unknown';
  const noeud = verificateur.typeToTypeNode(type, undefined, ts.NodeBuilderFlags.NoTruncation);
  if (!noeud) return 'unknown';

  let texte = imprimanteGlobale.printNode(ts.EmitHint.Unspecified, noeud, sf);
  // `Element` (JSX global) doit être écrit `React.JSX.Element` pour ne pas
  // désigner le `Element` du DOM.
  if (texte.trim() === 'Element') texte = 'React.JSX.Element';

  // 1. Symboles présents dans le type imprimé (les noeuds synthétiques
  //    portent `.symbol`, à défaut on interroge le vérificateur).
  const symboles = new Map();
  const dejaVus = new Set();
  const parcourirType = (x) => {
    if (ts.isIdentifier(x) && !dejaVus.has(x)) {
      dejaVus.add(x);
      const symbole = x.symbol || verificateur.getSymbolAtLocation(x);
      if (symbole) symboles.set(x.text, symbole);
    }
    ts.forEachChild(x, parcourirType);
  };
  parcourirType(noeud);

  // 2. Seules les vraies références du texte imprimé déclenchent un import :
  //    `React.JSX.Element` ne doit pas importer `Element` depuis « react ».
  const renommages = new Map();
  const traites = new Set();
  const arbre = ts.createSourceFile(
    'type-imprime.tsx',
    `type T = ${texte};`,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const parcourirTexte = (x) => {
    if (ts.isIdentifier(x)) {
      const parent = x.parent;
      const estNomDePropriete =
        !!parent &&
        ((ts.isPropertyAccessExpression(parent) && parent.name === x) ||
          (ts.isQualifiedName(parent) && parent.right === x) ||
          (ts.isPropertySignature(parent) && parent.name === x));
      if (!estNomDePropriete && !traites.has(x.text)) {
        traites.add(x.text);
        const symbole = symboles.get(x.text);
        const declaration = symbole && symbole.declarations && symbole.declarations[0];
        if (declaration && declaration.getSourceFile() === sf) {
          if (
            ts.isTypeAliasDeclaration(declaration) ||
            ts.isInterfaceDeclaration(declaration) ||
            ts.isEnumDeclaration(declaration)
          ) {
            surTypeEcran(x.text);
          }
        } else if (x.text === 'Element' && !imports.has('Element')) {
          // `Element` est le type d'un élément JSX : l'écrire explicitement
          // (`React.JSX.Element`) plutôt que d'importer un `Element` inexistant.
          renommages.set(x.text, 'React.JSX.Element');
        } else if (symbole && estDeclarationDeType(symbole)) {
          const module = moduleDunSymbole(symbole);
          if (module) {
            const alias = aliasPourType ? aliasPourType(x.text, module, imports) : null;
            if (alias) renommages.set(x.text, alias);
            ajouterImport(
              `import type { ${alias ? `${x.text} as ${alias}` : x.text} } from '${module}';`,
            );
          }
        }
      }
    }
    ts.forEachChild(x, parcourirTexte);
  };
  parcourirTexte(arbre);

  renommages.forEach((alias, original) => {
    texte = texte.replace(new RegExp(`(?<![\\w$.])${original}\\b`, 'g'), alias);
  });
  return texte;
}

/* ------------------------------------------------------------------ */
/* Découpage d'un écran                                                */
/* ------------------------------------------------------------------ */

function traiter(cheminRelatif, options) {
  const chemin = path.resolve(RACINE, cheminRelatif);
  const contenu = fs.readFileSync(chemin, 'utf8');
  const config = ts.readConfigFile(path.join(RACINE, 'tsconfig.json'), ts.sys.readFile);
  const analyse = ts.parseJsonConfigFileContent(config.config, ts.sys, RACINE);
  const programme = ts.createProgram([chemin], analyse.options);
  const verificateur = programme.getTypeChecker();
  const sf = programme.getSourceFile(chemin);

  const domaine = path.basename(path.dirname(chemin));
  const nomEcran = path.basename(chemin, '.tsx');
  const imports = tableImports(sf, contenu);
  const lignes = contenu.split('\n');
  const ligneDe = (n) => sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
  const finLigne = (n) => sf.getLineAndCharacterOfPosition(n.getEnd()).line + 1;

  let principale = null;
  sf.forEachChild((n) => {
    if (
      ts.isFunctionDeclaration(n) &&
      (n.modifiers ?? []).some((m) => m.kind === ts.SyntaxKind.DefaultKeyword)
    ) {
      principale = n;
    }
  });
  if (!principale) {
    // Un composant extrait n'a pas d'export par défaut : on prend le plus gros
    // composant de premier niveau, ce qui autorise un découpage récursif.
    let meilleur = null;
    sf.forEachChild((n) => {
      if (ts.isFunctionDeclaration(n) && n.name && n.body && /^[A-Z]/.test(n.name.text)) {
        const taille = n.getEnd() - n.getStart(sf);
        if (!meilleur || taille > meilleur.taille) meilleur = { n, taille };
      }
    });
    if (meilleur) principale = meilleur.n;
  }
  if (!principale) throw new Error(`Aucun composant principal dans ${cheminRelatif}`);

  const nomsComposant = nomsDeclares(principale);

  // Déclarations de portée module (hors imports) : valeurs ou types.
  const declarationsModule = new Map();
  sf.forEachChild((n) => {
    if (ts.isImportDeclaration(n) || ts.isExportDeclaration(n)) return;
    if (ts.isVariableStatement(n)) {
      n.declarationList.declarations.forEach((d) => {
        if (ts.isIdentifier(d.name)) declarationsModule.set(d.name.text, 'valeur');
      });
      return;
    }
    if (
      (ts.isTypeAliasDeclaration(n) ||
        ts.isInterfaceDeclaration(n) ||
        ts.isEnumDeclaration(n) ||
        ts.isClassDeclaration(n) ||
        ts.isFunctionDeclaration(n)) &&
      n.name
    ) {
      const estType = ts.isTypeAliasDeclaration(n) || ts.isInterfaceDeclaration(n);
      declarationsModule.set(n.name.text, estType ? 'type' : 'valeur');
    }
  });

  const premierIdentifiant = (noeud, texte) => {
    let trouve = null;
    const visiter = (n) => {
      if (trouve) return;
      if (ts.isIdentifier(n) && n.text === texte && !estNomDeclare(n)) trouve = n;
      else ts.forEachChild(n, visiter);
    };
    visiter(noeud);
    return trouve;
  };

  // ── Recherche des blocs candidats ──
  const candidats = [];
  const visiter = (n) => {
    if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n)) {
      const taille = finLigne(n) - ligneDe(n) + 1;
      if (taille >= options.min) {
        const locaux = nomsDeclares(n);
        const libres = new Set();
        const parcourir = (x) => {
          if (ts.isIdentifier(x) && !estNomDeclare(x) && !locaux.has(x.text)) libres.add(x.text);
          ts.forEachChild(x, parcourir);
        };
        parcourir(n);
        const references = [...libres].filter((nom) => !GLOBAUX.has(nom));
        const importees = references.filter((nom) => !nomsComposant.has(nom) && imports.has(nom));
        const locales = references.filter((nom) => nomsComposant.has(nom));
        const duModule = references.filter(
          (nom) => !nomsComposant.has(nom) && !imports.has(nom) && declarationsModule.has(nom),
        );
        const inconnues = references.filter(
          (nom) => !nomsComposant.has(nom) && !imports.has(nom) && !declarationsModule.has(nom),
        );
        const parent = n.parent;
        const racine =
          !!parent &&
          (ts.isReturnStatement(parent) ||
            ts.isArrowFunction(parent) ||
            (ts.isParenthesizedExpression(parent) &&
              (ts.isReturnStatement(parent.parent) ||
                ts.isArrowFunction(parent.parent))) ||
            (ts.isVariableDeclaration(parent) && !!parent.initializer));
        candidats.push({
          n,
          racine,
          taille,
          ligne: ligneDe(n),
          importees,
          inconnues,
          props: [
            ...new Set([
              ...locales,
              ...duModule.filter((nom) => declarationsModule.get(nom) === 'valeur'),
            ]),
          ].sort(),
          typesLocaux: duModule.filter((nom) => declarationsModule.get(nom) === 'type'),
        });
      }
    }
    ts.forEachChild(n, visiter);
  };
  visiter(principale);

  const eligibles = candidats
    .filter((c) => c.inconnues.length === 0)
    .filter((c) => !(options.sansRacine && c.racine));
  eligibles.sort((a, b) => b.taille - a.taille);

  if (options.liste) {
    eligibles.forEach((c) => {
      const tag = c.n.openingElement
        ? c.n.openingElement.tagName.getText(sf)
        : c.n.tagName.getText(sf);
      console.log(
        `ligne ${String(c.ligne).padStart(5)}  ${String(c.taille).padStart(5)} lignes  <${tag}>  ` +
          `imports=${c.importees.length} props=${c.props.length}`,
      );
    });
    candidats
      .filter((c) => c.inconnues.length > 0)
      .slice(0, 6)
      .forEach((c) =>
        console.log(
          `IGNORÉ ligne ${c.ligne} (${c.taille}) : références de portée locale → ${[...new Set(c.inconnues)].slice(0, 6).join(', ')}`,
        ),
      );
    return;
  }

  // ── Sélection : plus grand d'abord, sans chevauchement ──
  const retenus = [];
  for (const c of eligibles) {
    const fin = c.ligne + c.taille - 1;
    if (retenus.some((r) => c.ligne <= r.ligne + r.taille - 1 && fin >= r.ligne)) continue;
    retenus.push(c);
    if (retenus.length >= options.max) break;
  }
  retenus.sort((a, b) => a.ligne - b.ligne);

  if (retenus.length === 0) {
    console.log(`${nomEcran} : aucun bloc JSX ≥ ${options.min} lignes à extraire.`);
    return;
  }

  const dossier = path.join(RACINE, 'src', 'components', dossierComposantsDuDomaine(domaine));
  fs.mkdirSync(dossier, { recursive: true });

  // ── Noms : fournis en option, sinon déduits du commentaire de section ──
  const noms = new Map();
  retenus.forEach((c, index) => {
    // Nom fourni : soit un ordinal (`--nom 1=…`, stable), soit une ligne.
    let nom = options.noms.get(String(index + 1)) ?? options.noms.get(String(c.ligne));
    if (!nom) {
      let contexte = null;
      for (let i = c.ligne - 2; i >= 0 && i > c.ligne - 12; i -= 1) {
        const texte = (lignes[i] ?? '')
          .trim()
          .replace(/^\/\*+|^\*+\/?|\*\/$|\/\/+/g, '')
          .trim();
        if (texte.length >= 4 && /^[A-Za-zÀ-ÿ' ]{4,40}$/.test(texte)) {
          contexte = texte;
          break;
        }
      }
      nom = contexte ? pascal(contexte) : `${nomEcran.replace(/Screen$/, '')}${index + 1}`;
    }
    noms.set(String(c.ligne), nom);
  });

  const nomsUtilises = new Set();
  const traites = [];
  const typesAExporter = new Set();
  let resultat = contenu;

  for (const candidat of retenus) {
    let nom = noms.get(String(candidat.ligne));
    // Jamais d'écrasement : un composant existant est suffixé (…2, …3, …).
    let compteur = 2;
    const base = nom.replace(/\d+$/, '');
    while (nomsUtilises.has(nom) || fs.existsSync(path.join(dossier, `${nom}.tsx`))) {
      nom = `${base}${compteur}`;
      compteur += 1;
    }
    nomsUtilises.add(nom);

    // ── Imports du nouveau module ──
    const lignesImports = [];
    const ajouterImport = (ligne) => {
      if (ligne && !lignesImports.includes(ligne)) lignesImports.push(ligne);
    };
    const normaliser = (ligne) => {
      const specifieur = specifieurAbsolu(ligne, chemin);
      return specifieur ? ligne.replace(/from\s*'[^']+'/, `from '${specifieur}'`) : ligne;
    };
    candidat.importees
      .filter((identifiant) => identifiant !== 'styles')
      .forEach((identifiant) => ajouterImport(normaliser(imports.get(identifiant))));

    // ── Props typées (valeurs et actions du composant parent) ──
    const props = candidat.props;
    const declarationsProps = [];
    const typesEcran = new Set();
    const nomsUtilisesDansLeModule = new Set();
    const aliasMemo = new Map();
    const aliasPourType = (nomType, module) => {
      const cleAlias = `${nomType}|${module}`;
      if (aliasMemo.has(cleAlias)) return aliasMemo.get(cleAlias);
      if (nomsUtilisesDansLeModule.has(nomType) || !imports.has(nomType)) return null;
      const moduleEcran = (imports.get(nomType).match(/from\s*'([^']+)'/) || [])[1];
      if (!moduleEcran || moduleEcran === module) return null;
      const base = module.split('/').filter(Boolean).pop().replace(/\.(tsx?|d\.ts)$/, '');
      const suffixe = /\/api\/|^@\/api/.test(module) ? 'Api' : pascal(base);
      let alias = `${nomType}${suffixe}`;
      while (nomsUtilisesDansLeModule.has(alias)) alias = `${alias}2`;
      nomsUtilisesDansLeModule.add(alias);
      aliasMemo.set(cleAlias, alias);
      return alias;
    };
    props.forEach((prop) => {
      const cible = premierIdentifiant(candidat.n, prop);
      const texteType = cible
        ? typeDeReference(cible, verificateur, sf, ajouterImport, {
            surTypeEcran: (nomType) => typesEcran.add(nomType),
            imports,
            aliasPourType,
          })
        : 'unknown';
      declarationsProps.push(`  ${prop}: ${texteType};`);
    });

    if (typesEcran.size > 0) {
      [...typesEcran].forEach((type) => typesAExporter.add(type));
      ajouterImport(
        `import type { ${[...typesEcran].sort().join(', ')} } from '@/screens/${domaine}/${nomEcran}';`,
      );
    }
    if (candidat.typesLocaux.length > 0) {
      candidat.typesLocaux.forEach((type) => typesAExporter.add(type));
      ajouterImport(
        `import type { ${candidat.typesLocaux.slice().sort().join(', ')} } from '@/screens/${domaine}/${nomEcran}';`,
      );
    }
    const ligneStyles = imports.get('styles');
    ajouterImport(
      ligneStyles && /\.styles'/.test(ligneStyles)
        ? normaliser(ligneStyles)
        : `import { styles } from '@/screens/${domaine}/${nomEcran}.styles';`,
    );

    const corps = contenu
      .slice(candidat.n.getStart(sf), candidat.n.getEnd())
      .split('\n')
      .map((ligne, index) => (index === 0 || ligne.trim() === '' ? ligne : `  ${ligne}`))
      .join('\n');
    const signature =
      props.length === 0
        ? `export function ${nom}() {`
        : `export function ${nom}({\n${props.map((prop) => `  ${prop},`).join('\n')}\n}: Props) {`;
    const cheminComposant = path.join(dossier, `${nom}.tsx`);
    enregistrerDansManifeste(cheminComposant);
    fs.writeFileSync(
      cheminComposant,
      `/**\n * Section \`${nom}\` extraite de \`${nomEcran}\`.\n *\n` +
        ' * Le rendu est repris à l’identique : seules les valeurs et les actions\n' +
        ' * du composant parent sont reçues en props, ce qui évite de faire\n' +
        ' * transiter toute la logique de l’écran dans un seul fichier.\n */\n' +
        fusionnerImports([...new Set(lignesImports)]).join('\n') +
        '\n\n' +
        (props.length > 0 ? `type Props = {\n${declarationsProps.join('\n')}\n};\n\n` : '') +
        `${signature}\n  return (\n${corps}\n  );\n}\n`,
    );

    // ── Site d'appel ──
    const indentation = ' '.repeat(
      lignes[candidat.ligne - 1].length - lignes[candidat.ligne - 1].trimStart().length,
    );
    const appel =
      props.length === 0
        ? `<${nom} />`
        : `<${nom}\n${props
            .map((prop) => `${indentation}  ${prop}={${prop}}`)
            .join('\n')}\n${indentation}/>`;
    traites.push({ debut: candidat.n.getStart(sf), fin: candidat.n.getEnd(), appel, nom });
    console.log(
      `✓ src/components/${dossierComposantsDuDomaine(domaine)}/${nom}.tsx  (${candidat.taille} lignes, ${props.length} props)`,
    );
  }

  traites.sort((a, b) => b.debut - a.debut);
  for (const t of traites) {
    resultat = resultat.slice(0, t.debut) + t.appel + resultat.slice(t.fin);
  }

  // Les sections extraites doivent être importées dans l'écran.
  const apresImports = Math.max(
    ...[...resultat.matchAll(/^import[\s\S]*?;\s*$/gm)].map((m) => m.index + m[0].length),
  );
  resultat =
    resultat.slice(0, apresImports) +
    '\n' +
    traites
      .slice()
      .sort((a, b) => a.nom.localeCompare(b.nom))
      .map((t) => `import { ${t.nom} } from '@/components/${dossierComposantsDuDomaine(domaine)}/${t.nom}';`)
      .join('\n') +
    resultat.slice(apresImports);

  // Les types utilisés par les sections extraites sont exportés par l'écran.
  if (typesAExporter.size > 0) {
    const motif = new RegExp(`^(type|interface) (${[...typesAExporter].join('|')})\\b`, 'gm');
    resultat = resultat.replace(motif, 'export $1 $2');
  }

  resultat = resultat.replace(/\n{3,}/g, '\n\n');
  fs.writeFileSync(chemin, resultat);
  console.log(
    `✓ ${cheminRelatif} : ${contenu.split('\n').length} → ${resultat.split('\n').length} lignes`,
  );
}

/* ------------------------------------------------------------------ */

const args = process.argv.slice(2);
const cibles = [];
const options = { min: 100, max: 8, liste: false, sansRacine: false, noms: new Map() };
for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === '--liste') options.liste = true;
  else if (arg === '--sans-racine') options.sansRacine = true;
  else if (arg === '--min') options.min = Number(args[(i += 1)]);
  else if (arg === '--max') options.max = Number(args[(i += 1)]);
  else if (arg === '--nom') {
    const [ligne, nom] = args[(i += 1)].split('=');
    options.noms.set(ligne, nom);
  } else cibles.push(arg);
}

if (cibles.length === 0) {
  console.error('Usage : node scripts/extraire-sections.js <écran.tsx> [--liste] [--min 100]');
  process.exit(1);
}
cibles.forEach((cible) => traiter(cible, options));
