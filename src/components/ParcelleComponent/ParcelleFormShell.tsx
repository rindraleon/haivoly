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
