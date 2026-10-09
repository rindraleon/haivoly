
/** Valeurs temporelles acceptées par les fonctions d'affichage. */
type ValeurTemportelle = Date | string | null | undefined;

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

const deuxChiffres = (valeur: number): string => `${valeur}`.padStart(2, '0');

/** Vrai si la valeur est une date calendaire `YYYY-MM-DD`. */
export function isDateOnly(value: string | null | undefined): boolean {
  return typeof value === 'string' && DATE_ONLY.test(value);
}

/** Date du jour au format `YYYY-MM-DD` (fuseau local de l'utilisateur). */
export function todayDateOnly(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function dateOnlyToUtcDate(value: string): Date {
  return isDateOnly(value)
    ? new Date(`${value}T00:00:00.000Z`)
    : new Date(value);
}

export function toDateOnly(value: ValeurTemportelle): string | null {
  if (!value) return null;
  if (typeof value === 'string') {
    return isDateOnly(value) ? value : toDateOnly(new Date(value));
  }
  if (Number.isNaN(value.getTime())) return null;

  return `${value.getFullYear()}-${deuxChiffres(value.getMonth() + 1)}-${deuxChiffres(value.getDate())}`;
}

export function dateOnlyVersDateLocale(
  value: string | null | undefined,
): Date | null {
  if (!value || !isDateOnly(value)) return null;
  const [annee, mois, jour] = value.split('-').map(Number);
  return new Date(annee, mois - 1, jour, 0, 0, 0, 0);
}

export function dateOnlyVersIso(value: string | null | undefined): string | null {
  if (!value || !isDateOnly(value)) return null;
  return `${value}T00:00:00.000Z`;
}

/** Parties `jour / mois / année` d'une valeur affichable, ou `null`. */
function partiesDeDate(
  value: ValeurTemportelle,
): { jour: number; mois: number; annee: number } | null {
  if (value === null || value === undefined || value === '') return null;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return { jour: value.getDate(), mois: value.getMonth() + 1, annee: value.getFullYear() };
  }

  // Une date calendaire est lue en UTC (pas de décalage de fuseau).
  const date = isDateOnly(value) ? new Date(`${value}T00:00:00.000Z`) : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return isDateOnly(value)
    ? { jour: date.getUTCDate(), mois: date.getUTCMonth() + 1, annee: date.getUTCFullYear() }
    : { jour: date.getDate(), mois: date.getMonth() + 1, annee: date.getFullYear() };
}

export function formatDate(value: ValeurTemportelle): string {
  const parties = partiesDeDate(value);
  if (!parties) return '—';
  return `${deuxChiffres(parties.jour)}/${deuxChiffres(parties.mois)}/${parties.annee}`;
}

export function formatDateTime(value: ValeurTemportelle): string {
  const parties = partiesDeDate(value);
  if (!parties) return '—';

  let heures: number;
  let minutes: number;

  if (value instanceof Date) {
    heures = value.getHours();
    minutes = value.getMinutes();
  } else if (typeof value === 'string' && isDateOnly(value)) {
    heures = 0;
    minutes = 0;
  } else {
    const date = new Date(value as string);
    heures = date.getHours();
    minutes = date.getMinutes();
  }

  return `${deuxChiffres(parties.jour)}/${deuxChiffres(parties.mois)}/${parties.annee} ${deuxChiffres(heures)}:${deuxChiffres(minutes)}`;
}

/** Affichage court : **`JJ/MM`** (ex. `18/05`). */
export function formatDateShort(value: ValeurTemportelle): string {
  const parties = partiesDeDate(value);
  if (!parties) return '—';
  return `${deuxChiffres(parties.jour)}/${deuxChiffres(parties.mois)}`;
}

/** Heure seule : **`HH:mm`**. */
export function formatTime(value: ValeurTemportelle): string {
  const complet = formatDateTime(value);
  return complet === '—' ? '—' : complet.slice(11);
}

/** Nombre de jours entre deux dates calendaires (b − a). */
export function daysBetween(a: string, b: string): number {
  const start = dateOnlyToUtcDate(a).getTime();
  const end = dateOnlyToUtcDate(b).getTime();
  return Math.round((end - start) / 86_400_000);
}

/** Progression (0 → 1) entre la plantation et la récolte prévue. */
export function progressionEntre(
  debut: string | null,
  fin: string | null,
  reference: Date = new Date(),
): number | null {
  if (!debut || !fin) return null;

  const start = dateOnlyToUtcDate(debut).getTime();
  const end = dateOnlyToUtcDate(fin).getTime();
  if (end <= start) return null;

  const now = reference.getTime();
  return Math.max(0, Math.min(1, (now - start) / (end - start)));
}
