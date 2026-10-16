/**
 * Nombre décimal au format de la langue : virgule en français et en malgache,
 * point en anglais. Évite `Intl` (couverture variable selon les moteurs JS).
 */
export function formaterDecimal(valeur: number, decimales: number, langue: string): string {
  const texte = (Number.isFinite(valeur) ? valeur : 0).toFixed(decimales);
  return langue.startsWith('en') ? texte : texte.replace('.', ',');
}
