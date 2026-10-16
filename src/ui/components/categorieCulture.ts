/** Famille d'une culture, déduite de son nom ou de son type (fr ou mg). */
export type CategorieCulture =
  | 'cereale'
  | 'legumineuse'
  | 'tubercule'
  | 'agrume'
  | 'aromate'
  | 'palmier'
  | 'fruit'
  | 'autre';

/** Mots-clés (sans accents, minuscules) → famille de culture. */
const CORRESPONDANCES: [RegExp, CategorieCulture][] = [
  [/\b(riz|vary|ble|orge|mais|katsaka|sorgho|mil|cereale)/, 'cereale'],
  [/\b(haricot|tsaramaso|pois|soja|lentille|arachide|voanjo|legumineuse)/, 'legumineuse'],
  [/\b(manioc|mangahazo|patate|vomanga|carotte|pomme de terre|ovy|taro|igname|tubercule)/, 'tubercule'],
  [/\b(agrume|orange|citron|mandarine|voasary)/, 'agrume'],
  [/\b(vanille|lavanila|girofle|jirofo|poivre|aromate)/, 'aromate'],
  [/\b(coco|palmier|banane|akondro)/, 'palmier'],
  [/\b(tomate|pomme|mangue|manga|litchi|letisia|fruit|fraise)/, 'fruit'],
];

function normaliser(texte: string): string {
  return texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function categorieCulture(...indices: (string | null | undefined)[]): CategorieCulture {
  const texte = normaliser(indices.filter(Boolean).join(' '));
  for (const [motif, categorie] of CORRESPONDANCES) {
    if (motif.test(texte)) return categorie;
  }
  return 'autre';
}
