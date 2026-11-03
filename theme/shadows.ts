import type { ViewStyle } from 'react-native';

import type { ColorScheme } from '@/theme/colors';

export function cardShadow(scheme: ColorScheme): ViewStyle {
  if (scheme === 'dark') {
    return {};
  }

  return {
    shadowColor: '#141422',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 2,
  };
}
