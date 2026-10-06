/**
 * Sous-composant `CultureCard` extrait de `CultureListScreen`.
 *
 * Regroupe la présentation d'un élément de liste et ses interactions
 * locales, ce qui allège nettement le composant principal.
 */



import { Pressable } from 'react-native';

import { CultureToutesParcelles, formaterDate } from '@/screens/CultureScreen/CultureListScreen.helpers';


import { CultureCard1 } from '@/components/CultureComponent/CultureCard1';
/**
 * Progression associée à chaque statut de culture.
 *
 * Le statut est calculé par le serveur : l'écran ne fait que le traduire en
 * progression lisible. Table de correspondance au niveau du module pour ne pas
 * la recréer à chaque rendu.
 */
const CYCLE: Record<
  string,
  { progression: number; label: string; active: boolean }
> = {
  PLANIFIEE: { progression: 33, label: 'Culture planifiée', active: true },
  EN_COURS: { progression: 66, label: 'Culture en cours', active: true },
  RECOLTEE: { progression: 100, label: 'Cycle terminé', active: true },
  ABANDONNEE: { progression: 0, label: 'Cycle arrêté', active: false },
  SUPPRIMEE: { progression: 0, label: 'Culture supprimée', active: false },
};

export function CultureCard({
  culture,
  onPress,
}: {
  culture: CultureToutesParcelles;
  onPress: () => void;
}) {
  const points =
    culture.pointsGPS ?? [];

  const estDelimitee =
    points.length >= 3;

  const datePlantation =
    formaterDate(
      culture.datePlantation,
    );

  const dateRecoltePrevue =
    formaterDate(
      culture.datePrevueRecolte,
    );

  const dateModification =
    formaterDate(
      culture.modifieA,
    );

  // ===================================================
  // PROGRESSION DU CYCLE
  // ===================================================

  const cycle = CYCLE[culture.statut] ?? {
    progression: 0,
    label: 'Cycle',
    active: false,
  };
  const progression = cycle.progression;
  const progressionLabel = cycle.label;
  const progressionActive = cycle.active;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        pressed && {
          opacity: 0.96,
          transform: [
            {
              scale: 0.992,
            },
          ],
        },
      ]}
    >

      <CultureCard1
        culture={culture}
        dateModification={dateModification}
        datePlantation={datePlantation}
        dateRecoltePrevue={dateRecoltePrevue}
        estDelimitee={estDelimitee}
        onPress={onPress}
        points={points}
        progression={progression}
        progressionActive={progressionActive}
        progressionLabel={progressionLabel}
      />

    </Pressable>
  );
}
