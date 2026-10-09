
/** Valeur brute acceptée (nombre, chaîne numérique, absence). */
type NombreBrut = number | string | null | undefined;

const NOMBRE_FR = (() => {
  try {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
  } catch {
    return null;
  }
})();

/** Regroupement manuel : `1 234 567`. */
function regroupementManuel(valeur: number): string {
  const entier = Math.round(valeur);
  const signe = entier < 0 ? '-' : '';
  const chiffres = `${Math.abs(entier)}`;
  const groupes: string[] = [];

  for (let fin = chiffres.length; fin > 0; fin -= 3) {
    groupes.unshift(chiffres.slice(Math.max(0, fin - 3), fin));
  }

  return signe + groupes.join('\u202F');
}

/** Nombre entier lisible : `1 234`. */
export function formatNombre(valeur: NombreBrut): string {
  const nombre = typeof valeur === 'string' ? Number(valeur) : valeur;
  if (nombre === null || nombre === undefined || !Number.isFinite(nombre)) return '0';
  return NOMBRE_FR ? NOMBRE_FR.format(nombre) : regroupementManuel(nombre);
}

/** Nombre avec une décimale au plus : `1 234,5`. */
export function formatNombreDecimal(valeur: NombreBrut, decimales = 1): string {
  const nombre = typeof valeur === 'string' ? Number(valeur) : valeur;
  if (nombre === null || nombre === undefined || !Number.isFinite(nombre)) return '0';

  try {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimales,
    }).format(nombre);
  } catch {
    return regroupementManuel(nombre);
  }
}

/** Montant en ariary : `15 000 Ar`. */
export function formatMontant(valeur: NombreBrut): string {
  return `${formatNombre(valeur)} Ar`;
}
