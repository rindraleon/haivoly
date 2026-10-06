/**
 * Enveloppe commune des écrans de parcelle.
 *
 * Tous les écrans du parcours parcelle (création, modification, délimitation,
 * détail) partagent **exactement** le même fond, les mêmes marges et le même
 * en-tête : c'est ce qui garantit qu'aucun écran — notamment la modification —
 * ne repasse sur un fond blanc. Le contenu défile, l'action principale reste
 * fixée en bas.
 *
 * L'enveloppe elle-même est `ScreenContainer` (design system) : ce fichier ne
 * fait que fixer le contrat des écrans de parcelle.
 */
import React from 'react';

import { ScreenContainer } from '@/components/CommonComponent/ScreenContainer';

export interface ParcelleFormShellProps {
  title: string;
  subtitle?: string | null;
  onBack: () => void;
  /** Action alignée à droite de l'en-tête (ex. « Modifier »). */
  headerRight?: React.ReactNode;
  /** Zone d'actions fixée en bas de l'écran. */
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function ParcelleFormShell({
  title,
  subtitle,
  onBack,
  headerRight,
  footer,
  children,
}: ParcelleFormShellProps) {
  return (
    <ScreenContainer
      title={title}
      subtitle={subtitle}
      onBack={onBack}
      headerRight={headerRight}
      footer={footer}
    >
      {children}
    </ScreenContainer>
  );
}
