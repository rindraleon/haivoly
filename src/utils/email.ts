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
