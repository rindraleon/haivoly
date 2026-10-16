import { Archive, ArchiveRestore, CircleOff, type LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useUpdateParcelle } from '@/hooks';
import type { Parcelle } from '@/types';
import { ConfirmSheet, useToast } from '@/ui';
import { messageErreur } from '@/utils/erreur';

import type { StatutCibleParcelle } from './regles';

export const ICONES_STATUT: Record<StatutCibleParcelle, LucideIcon> = {
  ACTIVE: ArchiveRestore,
  ABANDONNEE: CircleOff,
  ARCHIVEE: Archive,
};

export interface ChangementStatutSheetProps {
  parcelle: Pick<Parcelle, 'id' | 'nom'> | null;
  /** Statut demandé ; `null` = feuille fermée. */
  cible: StatutCibleParcelle | null;
  onFermer: () => void;
}

/**
 * Confirmation d'un changement de statut (abandonner, archiver, réactiver).
 * Même mutation que la modification V1 (`PATCH /parcelles/:id`, file hors
 * ligne) : le serveur reste juge des transitions autorisées. En cas d'échec,
 * la feuille reste ouverte avec le message, pour réessayer ou annuler.
 */
export function ChangementStatutSheet({ parcelle, cible, onFermer }: ChangementStatutSheetProps) {
  const { t } = useTranslation();
  const afficherToast = useToast();
  const miseAJour = useUpdateParcelle();
  const [erreur, setErreur] = useState<string | null>(null);

  if (!parcelle || !cible) return null;

  const fermer = () => {
    setErreur(null);
    miseAJour.reset();
    onFermer();
  };

  const confirmer = () => {
    setErreur(null);
    miseAJour.mutate(
      { id: parcelle.id, body: { statut: cible } },
      {
        onSuccess: (resultat) => {
          const horsLigne = Boolean(resultat?._localOnly);
          afficherToast({
            tone: horsLigne ? 'info' : 'success',
            message: horsLigne ? t('ecranParcelles.statut.horsLigne') : t(`ecranParcelles.statut.succes.${cible}`),
          });
          fermer();
        },
        onError: (cause) => setErreur(messageErreur(cause, t('ecranParcelles.statut.erreur'))),
      },
    );
  };

  return (
    <ConfirmSheet
      visible
      title={t(`ecranParcelles.statut.confirmation.${cible}.titre`, { nom: parcelle.nom })}
      message={t(`ecranParcelles.statut.confirmation.${cible}.message`)}
      confirmLabel={t(`ecranParcelles.statut.actions.${cible}`)}
      cancelLabel={t('commun.actions.annuler')}
      closeLabel={t('commun.actions.fermer')}
      icon={ICONES_STATUT[cible]}
      loading={miseAJour.isPending}
      error={erreur}
      onConfirm={confirmer}
      onCancel={fermer}
      testID="parcelle-statut-confirmation"
    />
  );
}
