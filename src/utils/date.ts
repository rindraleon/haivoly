/**
 * Dates côté mobile — **source de vérité unique**.
 *
 * Règles :
 *   • une date calendaire (`YYYY-MM-DD`) n'est **jamais** convertie en `Date`
 *     pour être renvoyée à l'API : on garde la chaîne telle quelle ;
 *   • un horodatage ISO représente un instant : il est affiché dans le fuseau
 *     local de l'utilisateur ;
 *   • **tout affichage est au format français `JJ/MM/AAAA`** (et
 *     `JJ/MM/AAAA HH:mm` pour un horodatage). Le formatage est fait à la main,
 *     sans `Intl` : le rendu ne dépend donc ni de la locale du téléphone ni du
 *     support ICU du moteur JS (Hermes).
 */

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

/**
 * Convertit une date calendaire en `Date` **UTC minuit**.
 * N'utilisez que pour l'affichage ou les comparaisons, jamais pour l'envoi.
 */
export function dateOnlyToUtcDate(value: string): Date {
  return isDateOnly(value)
    ? new Date(`${value}T00:00:00.000Z`)
    : new Date(value);
}

/**
 * Convertit un objet `Date` (ou une chaîne) en `YYYY-MM-DD`.
 *
 * ⚠️ Pour un objet `Date`, on lit les composantes **locales** : une date
 * choisie au sélecteur à minuit local ne doit jamais reculer d'un jour dans un
 * fuseau positif (Madagascar, UTC+3) — c'était la source du décalage
 * historique `toISOString().slice(0, 10)`.
 */
export function toDateOnly(value: ValeurTemportelle): string | null {
  if (!value) return null;
  if (typeof value === 'string') {
    return isDateOnly(value) ? value : toDateOnly(new Date(value));
  }
  if (Number.isNaN(value.getTime())) return null;

  return `${value.getFullYear()}-${deuxChiffres(value.getMonth() + 1)}-${deuxChiffres(value.getDate())}`;
}

/**
 * Date calendaire → objet `Date` **à minuit local**, pour amorcer un
 * sélecteur de date (`DateTimePicker`). C'est l'inverse exact de `toDateOnly`.
 */
export function dateOnlyVersDateLocale(
  value: string | null | undefined,
): Date | null {
  if (!value || !isDateOnly(value)) return null;
  const [annee, mois, jour] = value.split('-').map(Number);
  return new Date(annee, mois - 1, jour, 0, 0, 0, 0);
}

/**
 * Instant ISO-8601 (`AAAA-MM-JJT00:00:00.000Z`) pour une colonne `timestamp`
 * alimentée par une saisie de date sans heure (intervention, observation…) :
 * le serveur compare cette valeur à `now` pour calculer le statut.
 */
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

/**
 * Affichage d'une date : **`JJ/MM/AAAA`** (ex. `18/05/2026`).
 *
 * Accepte une date calendaire (`YYYY-MM-DD`), un horodatage ISO ou un objet
 * `Date`. Renvoie `—` pour une valeur absente ou invalide.
 */
export function formatDate(value: ValeurTemportelle): string {
  const parties = partiesDeDate(value);
  if (!parties) return '—';
  return `${deuxChiffres(parties.jour)}/${deuxChiffres(parties.mois)}/${parties.annee}`;
}

/**
 * Affichage d'un horodatage : **`JJ/MM/AAAA HH:mm`** (ex. `18/05/2026 14:30`).
 *
 * L'heure est celle du fuseau local ; une date calendaire est rendue à `00:00`.
 */
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
