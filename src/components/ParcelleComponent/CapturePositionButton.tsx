import { useCallback } from 'react';
import { Alert } from 'react-native';
import { LocateFixed } from 'lucide-react-native';

import { i18n } from '@/i18n/instance';
import { Button } from '@/components/CommonComponent/Button';
import { colors } from '@/theme';
import { useCapturePosition } from '@/hooks';
import { ErreurGPS, type GPSPosition } from '@/services';

export interface CapturePositionButtonProps {
  /** Reçoit le point relevé par le GPS du téléphone. */
  onCapture: (position: GPSPosition) => void;
  disabled?: boolean;
}

/**
 * Bouton « Capturer ma position » : relève la position courante du téléphone et
 * la transmet à l'appelant. La gestion des permissions et l'affichage des erreurs
 * GPS sont centralisés ici pour être identiques sur tous les écrans de délimitation.
 */
export function CapturePositionButton({
  onCapture,
  disabled = false,
}: Readonly<CapturePositionButtonProps>) {
  const { capturer, enCours } = useCapturePosition();

  const handlePress = useCallback(async () => {
    try {
      const position = await capturer();
      onCapture(position);
    } catch (error) {
      Alert.alert(
        i18n.t('parcelles.captureEchouee'),
        error instanceof ErreurGPS ? error.message : i18n.t('domaine.erreurSurvenue'),
      );
    }
  }, [capturer, onCapture]);

  return (
    <Button
      onPress={handlePress}
      loading={enCours}
      disabled={disabled || enCours}
      leftIcon={<LocateFixed size={16} color={colors.neutral[0]} />}
    >
      {enCours
        ? i18n.t('parcelles.captureEnCours')
        : i18n.t('parcelles.capturerPosition')}
    </Button>
  );
}

export default CapturePositionButton;
