import type { Ton } from '@/ui';
import type { Recommendation } from '@/types';

export interface SectionNotifications {
  /** Clef de jour (AAAA-MM-JJ) : l'écran la traduit en « Aujourd'hui », etc. */
  jour: string;
  data: Recommendation[];
}

export type CleJour = 'aujourdhui' | 'hier' | 'date';

/** Type de recommandation → ton de carte (jamais la couleur seule). */
export function toneParType(type: Recommendation['type']): Ton {
  switch (type) {
    case 'ALERT':
      return 'erreur';
    case 'WARNING':
      return 'alerte';
    case 'SUCCESS':
      return 'succes';
    default:
      return 'info';
  }
}

export function estNonLue(notification: Recommendation): boolean {
  return !notification.readAt;
}

/**
 * Fil groupé par jour civil (plus récent d'abord), comme le Suivi unifié :
 * le centre de notifications garde la même lecture jour par jour.
 */
/** Jour civil d'une notification ; repli sur aujourd'hui si la charge utile
 *  est ancienne ou partielle (cache local écrit avant un champ manquant). */
export function jourDeReco(item: Recommendation): string {
  const brut = typeof item.createdAt === 'string' ? item.createdAt.slice(0, 10) : '';
  return /^\d{4}-\d{2}-\d{2}$/.test(brut) ? brut : aujourdhuiFallback();
}

function aujourdhuiFallback(): string {
  const now = new Date();
  return `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, '0')}-${`${now.getDate()}`.padStart(2, '0')}`;
}

export function sectionsParJour(items: Recommendation[], aujourdhui: string): SectionNotifications[] {
  const triees = [...items].sort(
    (a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''),
  );
  const sections: SectionNotifications[] = [];
  for (const item of triees) {
    const jour = jourDeReco(item);
    const derniere = sections[sections.length - 1];
    if (derniere && derniere.jour === jour) derniere.data.push(item);
    else sections.push({ jour, data: [item] });
  }
  void aujourdhui;
  return sections;
}

/** Clef de libellé d'un jour relatif à aujourd'hui. */
export function cleJour(jour: string, aujourdhui: string): CleJour {
  if (jour === aujourdhui) return 'aujourdhui';
  const hier = new Date(`${aujourdhui}T12:00:00.000Z`);
  hier.setUTCDate(hier.getUTCDate() - 1);
  if (jour === hier.toISOString().slice(0, 10)) return 'hier';
  return 'date';
}

/**
 * Destination d'une notification selon l'entité concernée : le fil Suivi
 * montre l'événement, les onglets montrent la liste correspondante.
 * `null` = recommandation sans écran lié (lecture seule).
 */
export function routeParEntite(metadata?: Record<string, unknown> | null): string | null {
  const entite = String(metadata?.entityType ?? '');
  if (entite === 'OBSERVATION' || entite === 'INTERVENTION' || entite === 'RECOLTE') return '/observations';
  if (entite === 'PARCELLE') return '/parcelles';
  if (entite === 'CULTURE') return '/cultures';
  return null;
}
