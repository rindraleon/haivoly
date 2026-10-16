import { z } from 'zod';

import type { RecoltePayload } from '@/types';
import { isDateOnly } from '@/utils/date';

/** Unités proposées en V1, conservées à l'identique (valeurs envoyées au serveur). */
export const UNITES_RECOLTE = ['kg', 'tonne', 'sac', 'litre', 'unite'] as const;
export type UniteRecolte = (typeof UNITES_RECOLTE)[number];

/** Champs du formulaire, dans l'ordre d'affichage (focus de la première erreur). */
export const CHAMPS_RECOLTE = ['dateRecolte', 'quantite', 'unite', 'prixVente', 'coutRecolte', 'description'] as const;
export type ChampRecolte = (typeof CHAMPS_RECOLTE)[number];

/** Limites du `CreateRecolteDto` serveur. */
export const QUANTITE_MIN = 0.01;
export const DESCRIPTION_MAX = 1000;

export interface MessagesRecolte {
  dateInvalide: string;
  dateAvantPlantation: string;
  quantite: string;
  montant: string;
  descriptionTropLongue: string;
}

/**
 * Lit un nombre saisi au clavier : virgule ou point décimal, espaces de
 * milliers tolérés (« 1 200,5 »). `null` si vide, `NaN` si invalide.
 */
export function lireNombre(saisie: string): number | null {
  const nettoyee = saisie.replace(/[\s\u00a0\u202f]/g, '').replace(',', '.');
  if (nettoyee === '') return null;
  if (!/^\d+(\.\d+)?$/.test(nettoyee)) return Number.NaN;
  return Number(nettoyee);
}

function montantFacultatif(message: string) {
  return z.string().refine((valeur) => {
    if (valeur.trim() === '') return true;
    const nombre = lireNombre(valeur);
    return nombre !== null && Number.isFinite(nombre) && nombre >= 0;
  }, message);
}

/**
 * Mêmes règles que la V1 et que le serveur (`CreateRecolteDto`) :
 * date calendaire valide, quantité ≥ 0,01, montants ≥ 0, description ≤ 1000.
 * La règle « date ≥ plantation » (vérifiée par le serveur) est appliquée dès
 * la saisie quand la date de plantation est connue.
 */
export function schemaRecolte(messages: MessagesRecolte, datePlantation?: string | null) {
  return z.object({
    dateRecolte: z
      .string()
      .refine((valeur) => isDateOnly(valeur), messages.dateInvalide)
      .refine(
        (valeur) => !datePlantation || !isDateOnly(valeur) || valeur >= datePlantation,
        messages.dateAvantPlantation,
      ),
    quantite: z.string().refine((valeur) => {
      const nombre = lireNombre(valeur);
      return nombre !== null && Number.isFinite(nombre) && nombre >= QUANTITE_MIN;
    }, messages.quantite),
    unite: z.enum(UNITES_RECOLTE),
    prixVente: montantFacultatif(messages.montant),
    coutRecolte: montantFacultatif(messages.montant),
    description: z.string().max(DESCRIPTION_MAX, messages.descriptionTropLongue),
  });
}

export type ValeursRecolte = z.infer<ReturnType<typeof schemaRecolte>>;

export function valeursInitialesRecolte(aujourdhui: string): ValeursRecolte {
  return { dateRecolte: aujourdhui, quantite: '', unite: 'kg', prixVente: '', coutRecolte: '', description: '' };
}

/**
 * Charge utile identique à la V1 : date envoyée telle quelle, champs vides →
 * `null`, aucun `statut` (c'est le serveur qui passe la culture en RECOLTEE).
 */
export function versPayloadRecolte(valeurs: ValeursRecolte): RecoltePayload {
  const montant = (saisie: string): number | null => (saisie.trim() === '' ? null : (lireNombre(saisie) as number));
  return {
    dateRecolte: valeurs.dateRecolte,
    quantite: lireNombre(valeurs.quantite) as number,
    unite: valeurs.unite,
    prixVente: montant(valeurs.prixVente),
    coutRecolte: montant(valeurs.coutRecolte),
    description: valeurs.description.trim() === '' ? null : valeurs.description.trim(),
  };
}

export function estChampRecolte(nom: string): nom is ChampRecolte {
  return (CHAMPS_RECOLTE as readonly string[]).includes(nom);
}
