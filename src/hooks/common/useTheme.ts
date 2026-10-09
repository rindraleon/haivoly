
import { Colors } from '@/theme/system';
import { useColorScheme } from '@/hooks/common/useColorScheme';

export function useTheme() {
  const scheme = useColorScheme();
  const theme = scheme === 'unspecified' ? 'light' : scheme;

  return Colors[theme];
}
