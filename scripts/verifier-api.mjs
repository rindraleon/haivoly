#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ici = dirname(fileURLToPath(import.meta.url));
const racineMobile = resolve(ici, '..');
const racineBackend = resolve(racineMobile, '..', 'backend');

/** Normalise une route : `/a/${id}/b/` → `/a/:param/b`. */
function normaliser(route) {
  return route
    .replace(/\/+$/, '')
    .replace(/\$\{[^}]*\}/g, ':param')
    .replace(/:[A-Za-z_][\w]*/g, ':param')
    .replace(/\/+/g, '/')
    .replace(/^([^/])/, '/$1');
}

function fichiers(racine, motif) {
  const trouves = [];
  const parcourir = (dossier) => {
    for (const entree of readdirSync(dossier)) {
      if (entree === 'node_modules' || entree.startsWith('.')) continue;
      const chemin = join(dossier, entree);
      if (statSync(chemin).isDirectory()) parcourir(chemin);
      else if (motif.test(entree)) trouves.push(chemin);
    }
  };
  parcourir(racine);
  return trouves;
}

function routesBackend() {
  const routes = new Map();
  const controllers = fichiers(join(racineBackend, 'src'), /\.controller\.ts$/);

  for (const fichier of controllers) {
    const source = readFileSync(fichier, 'utf8');
    const base = source.match(/@Controller\(\s*(?:'([^']*)')?/);
    const prefixe = base?.[1] ?? '';
    const decorateurs = source.matchAll(/@(Get|Post|Put|Patch|Delete)\(\s*(?:'([^']*)')?/g);

    for (const [, methode, segment] of decorateurs) {
      const chemin = normaliser(`/${prefixe}/${segment ?? ''}`);
      routes.set(`${methode.toUpperCase()} ${chemin}`, fichier.replace(`${racineBackend}/`, ''));
    }
  }
  return routes;
}

/** Lit le premier argument d'un appel, en respectant les chaînes imbriquées. */
function premierArgument(source, depart) {
  let profondeur = 0;
  let guillemet = null;
  for (let i = depart; i < source.length; i += 1) {
    const caractere = source[i];
    if (guillemet) {
      if (caractere === '\\') i += 1;
      else if (caractere === guillemet) guillemet = null;
      continue;
    }
    if (caractere === "'" || caractere === '"' || caractere === '`') guillemet = caractere;
    else if (caractere === '(' || caractere === '[' || caractere === '{') profondeur += 1;
    else if (caractere === ')' && profondeur === 0) return source.slice(depart, i);
    else if (caractere === ')' || caractere === ']' || caractere === '}') profondeur -= 1;
    else if (caractere === ',' && profondeur === 0) return source.slice(depart, i);
  }
  return source.slice(depart);
}

/** `/cultures/` + id + '/interventions' → `/cultures/:param/interventions`. */
function normaliserExpression(expression) {
  return normaliser(
    expression
      .replace(/'\s*\+\s*[^']*?\s*\+\s*'/g, '/:param/')
      .replace(/\s*\+\s*[A-Za-z_$][\w$.]*(\?\.\w+)*\s*\+?\s*/g, ':param')
      .replace(/['"`]/g, '')
      .trim(),
  );
}

function appelsMobile() {
  const appels = [];
  const services = fichiers(join(racineMobile, 'src'), /\.service\.ts$/);

  for (const fichier of services) {
    const source = readFileSync(fichier, 'utf8');
    const motif = /http\s*\.\s*(get|post|put|patch|delete)\b/g;
    for (const correspondance of source.matchAll(motif)) {
      let curseur = correspondance.index + correspondance[0].length;
      while (curseur < source.length && /\s/.test(source[curseur])) curseur += 1;
      if (source[curseur] === '<') {
        let chevrons = 0;
        while (curseur < source.length) {
          if (source[curseur] === '<') chevrons += 1;
          else if (source[curseur] === '>') {
            chevrons -= 1;
            if (chevrons === 0) {
              curseur += 1;
              break;
            }
          }
          curseur += 1;
        }
        while (curseur < source.length && /\s/.test(source[curseur])) curseur += 1;
      }
      if (source[curseur] !== '(') continue;
      const brut = premierArgument(source, curseur + 1);
      const ligne = source.slice(0, correspondance.index).split('\n').length;
      appels.push({
        methode: correspondance[1].toUpperCase(),
        route: normaliserExpression(brut),
        origine: `${fichier.replace(`${racineMobile}/`, '')}:${ligne}`,
      });
    }
  }
  return appels;
}

const backend = routesBackend();
const mobile = appelsMobile();

const manquantes = mobile.filter((appel) => !backend.has(`${appel.methode} ${appel.route}`));
const appellees = new Set(mobile.map((appel) => `${appel.methode} ${appel.route}`));
const inutilisees = [...backend.keys()].filter((cle) => !appellees.has(cle));

console.log(`Backend   : ${backend.size} routes déclarées`);
console.log(`Mobile    : ${mobile.length} appels sortants\n`);

if (manquantes.length > 0) {
  console.log('❌ Appels mobile sans route serveur :');
  for (const appel of manquantes) {
    console.log(`   ${appel.methode} ${appel.route}   (${appel.origine})`);
  }
  process.exitCode = 1;
} else {
  console.log('✅ Tous les appels du mobile correspondent à une route du backend.');
}

if (inutilisees.length > 0) {
  console.log(`\n⚠️  ${inutilisees.length} route(s) serveur non appelée(s) par le mobile :`);
  for (const cle of inutilisees) console.log(`   ${cle}`);
}
