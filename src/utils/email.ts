/**
 * Validation d'une adresse email.
 *
 * Implémentation **sans expression régulière** : le motif historiquement utilisé
 * (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) était dupliqué dans trois écrans et signalé
 * comme potentiellement super-linéaire (retour arrière). La règle métier est
 * simple et se vérifie directement :
 *
 *   1. une seule `@`, partie locale et domaine non vides ;
 *   2. aucun espace ;
 *   3. domaine composé d'au moins deux labels non vides (`haivoly.mg`).
 *
 * Utilisée par la connexion, l'inscription et le mot de passe oublié — un seul
 * comportement pour ces trois écrans.
 */
export function estEmailValide(valeur: string | null | undefined): boolean {
  const email = (valeur ?? '').trim();

  if (!email || email.length > 254) return false;
  if (/\s/.test(email)) return false;

  const parties = email.split('@');
  if (parties.length !== 2) return false;

  const [locale, domaine] = parties;
  if (!locale || !domaine) return false;

  const labels = domaine.split('.');
  if (labels.length < 2) return false;

  return labels.every((label) => label.length > 0);
}
