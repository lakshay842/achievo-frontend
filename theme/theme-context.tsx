import { createContext } from 'react';

import type { ColorScheme, Palette, ThemePreference } from '@/theme/colors';

export type ThemeContextValue = {
  preference: ThemePreference;
  scheme: ColorScheme;
  colors: Palette;
  fontsReady: boolean;
  setPreference: (preference: ThemePreference) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);
