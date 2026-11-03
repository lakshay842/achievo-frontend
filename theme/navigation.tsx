import { DarkTheme, DefaultTheme, type NativeStackNavigationOptions, type Theme } from 'expo-router';

import { HeaderBackButton, HeaderHomeButton } from '@/components/navigation/header-nav';
import type { Palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

export function createNavigationTheme(scheme: 'light' | 'dark', colors: Palette): Theme {
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };
}

type StackOptionExtras = {
  /** Show Back + Home in the stack header. Defaults to true. */
  showNavActions?: boolean;
};

export function createStackOptions(
  colors: Palette,
  fontsReady: boolean,
  extras: StackOptionExtras = {},
): NativeStackNavigationOptions {
  const showNavActions = extras.showNavActions !== false;

  return {
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.text,
    headerTitleStyle: {
      ...(fontsReady ? { fontFamily: fontFamily.semibold } : {}),
      fontSize: 17,
      color: colors.text,
    },
    headerShadowVisible: false,
    headerBackButtonDisplayMode: 'minimal',
    headerBackVisible: false,
    headerLeft: showNavActions ? () => <HeaderBackButton /> : undefined,
    headerRight: showNavActions ? () => <HeaderHomeButton /> : undefined,
    contentStyle: { backgroundColor: colors.background },
    animation: 'slide_from_right',
  };
}
