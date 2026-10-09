import type { SelectOption } from '@/components/CommonComponent/AppSelect';
import { isDateOnly } from '@/utils/date';

export const TYPES_INTERVENTION: SelectOption[] = [
  { value: 'PLANTATION', label: 'Plantation' },
  { value: 'IRRIGATION', label: 'Irrigation' },
  { value: 'FERTILISATION', label: 'Fertilisation' },
  { value: 'DESHERBAGE', label: 'Désherbage' },
  { value: 'TRAITEMENT', label: 'Traitement phytosanitaire' },
  { value: 'ENTRETIEN', label: 'Entretien' },
  { value: 'INSPECTION', label: 'Inspection' },
  { value: 'AUTRE', label: 'Autre' },
];

export const UNITES_INTERVENTION: SelectOption[] = [
  { value: 'kg', label: 'Kilogrammes (kg)' },
  { value: 'g', label: 'Grammes (g)' },
  { value: 'L', label: 'Litres (L)' },
  { value: 'ml', label: 'Millilitres (ml)' },
  { value: 'sac', label: 'Sacs' },
  { value: 'unite', label: 'Unités' },
];

export const PRODUITS_INTERVENTION: SelectOption[] = [
  { value: 'NPK', label: 'Engrais NPK' },
  { value: 'UREE', label: 'Urée' },
  { value: 'COMPOST', label: 'Compost organique' },
  { value: 'FUMIER', label: 'Fumier' },
  { value: 'HERBICIDE', label: 'Herbicide' },
  { value: 'INSECTICIDE', label: 'Insecticide' },
  { value: 'FONGICIDE', label: 'Fongicide' },
  { value: 'EAU', label: 'Eau d’irrigation' },
  { value: 'AUTRE', label: 'Autre produit' },
];

/** Libellé lisible d'un code technique, ou le code si inconnu. */
export function libelleOption(
  options: SelectOption[],
  valeur: string | null | undefined,
): string {
  if (!valeur) return '—';
  return options.find((option) => option.value === valeur)?.label ?? valeur;
}

export function statutInterventionPrevu(
  valeur: string,
): 'PLANIFIEE' | 'EN_COURS' | null {
  if (!isDateOnly(valeur)) return null;
  const cible = new Date(`${valeur}T00:00:00.000Z`);
  if (Number.isNaN(cible.getTime())) return null;
  return cible.getTime() > Date.now() ? 'PLANIFIEE' : 'EN_COURS';
}
