import { CircleOff, Play, RotateCcw, type LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useUpdateCulture } from '@/hooks';
import type { Culture } from '@/types';
import { ConfirmSheet, useToast } from '@/ui';
import { messageErreur } from '@/utils/erreur';

import type { StatutCibleCulture } from './regles';

export const ICONES_STATUT_CULTURE: Record<StatutCibleCulture, LucideIcon> = {
  EN_COURS: Play,
  ABANDONNEE: CircleOff,
  PLANIFIEE: RotateCcw,
};

export interface ChangementStatutCultureSheetProps {
  culture: Pick<Culture, 'id' | 'nom' | 'parcelleId'> | null;
  /** Statut demandé ; `null` = feuille fermée. */
  cible: StatutCibleCulture | null;
  onFermer: () => void;
}

/**
 * Confirmation d'un changement de statut de culture (démarrer, abandonner,
 * reprendre). Même mutation que la modification V1 (`PATCH
 * /parcelles/:pid/cultures/:id`, file hors ligne) ; le serveur reste juge des
 * transitions et réconcilie le statut (une culture reprise dont la plantation
 * est passée redevient « En cours »). En cas d'échec, la feuille reste
 * ouverte avec le message, pour réessayer ou annuler.
 */
export function ChangementStatutCultureSheet({ culture, cible, onFermer }: ChangementStatutCultureSheetProps) {
  const { t } = useTranslation();
  const afficherToast = useToast();
  const miseAJour = useUpdateCulture();
  const [erreur, setErreur] = useState<string | null>(null);

  if (!culture || !cible) return null;

  const fermer = () => {
    setErreur(null);
    miseAJour.reset();
    onFermer();
  };

  const confirmer = () => {
    setErreur(null);
    miseAJour.mutate(
      { parcelleId: culture.parcelleId, cultureId: culture.id, body: { statut: cible } },
      {
        onSuccess: (resultat) => {
          const horsLigne = Boolean(resultat?._localOnly);
          afficherToast({
            tone: horsLigne ? 'info' : 'success',
            message: horsLigne ? t('ecranCultures.statut.horsLigne') : t(`ecranCultures.statut.succes.${cible}`),
          });
          fermer();
        },
        onError: (cause) => setErreur(messageErreur(cause, t('ecranCultures.statut.erreur'))),
      },
    );
  };

  return (
    <ConfirmSheet
      visible
      title={t(`ecranCultures.statut.confirmation.${cible}.titre`, { nom: culture.nom })}
      message={t(`ecranCultures.statut.confirmation.${cible}.message`)}
      confirmLabel={t(`ecranCultures.statut.actions.${cible}`)}
      cancelLabel={t('commun.actions.annuler')}
      closeLabel={t('commun.actions.fermer')}
      icon={ICONES_STATUT_CULTURE[cible]}
      tone={cible === 'ABANDONNEE' ? 'danger' : 'primary'}
      loading={miseAJour.isPending}
      error={erreur}
      onConfirm={confirmer}
      onCancel={fermer}
      testID="culture-statut-confirmation"
    />
  );
}
