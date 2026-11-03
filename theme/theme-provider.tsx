import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { StatusBar } from 'expo-status-bar';
import { colorScheme as nativeWindScheme } from 'nativewind';
import { useEffect, useMemo, type ReactNode } from 'react';
import { Appearance, useColorScheme, View } from 'react-native';

import { syncPushRegistration } from '@/services/notifications/permissions';
import { ensureNotificationChannels } from '@/services/notifications/setup';
import { useAuthStore } from '@/store/auth.store';
import { useUserStore } from '@/store/user.store';
import { palette, type ColorScheme, type ThemePreference } from '@/theme/colors';
import { ThemeContext } from '@/theme/theme-context';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function resolveScheme(preference: ThemePreference, systemScheme: string | null | undefined): ColorScheme {
  if (preference === 'light' || preference === 'dark') {
    return preference;
  }

  return systemScheme === 'dark' ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const preference = useUserStore((state) => state.themePreference);
  const themeHydrated = useUserStore((state) => state.hydrated);
  const hydrateTheme = useUserStore((state) => state.hydrate);
  const setPreference = useUserStore((state) => state.setThemePreference);
  const bootstrapAuth = useAuthStore((state) => state.bootstrap);
  const authStatus = useAuthStore((state) => state.status);
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    void hydrateTheme();
    void bootstrapAuth();
  }, [bootstrapAuth, hydrateTheme]);

  useEffect(() => {
    if (authStatus !== 'authenticated') {
      return;
    }
    void syncPushRegistration();
  }, [authStatus]);

  const systemScheme = useColorScheme();
  const scheme = resolveScheme(preference, systemScheme);
  const colors = palette[scheme];
  const fontsReady = fontsLoaded || fontError !== null;
  const ready = fontsReady && themeHydrated;

  useEffect(() => {
    try {
      Appearance.setColorScheme(preference === 'system' ? 'unspecified' : preference);
    } catch {
      // Web does not always implement the native appearance override.
    }

    nativeWindScheme.set(preference === 'system' ? 'system' : preference);
  }, [preference]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    SplashScreen.hideAsync().catch(() => undefined);
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => undefined);
    void ensureNotificationChannels();
  }, [colors.background, ready]);

  const value = useMemo(
    () => ({
      preference,
      scheme,
      colors,
      fontsReady: fontsLoaded,
      setPreference,
    }),
    [colors, fontsLoaded, preference, scheme, setPreference],
  );

  if (!ready) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
}
