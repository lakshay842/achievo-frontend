import { Redirect, Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/store/auth.store';
import { createStackOptions } from '@/theme';

export default function AuthLayout() {
  const { colors, fontsReady } = useTheme();
  const status = useAuthStore((state) => state.status);
  const bootstrapped = useAuthStore((state) => state.bootstrapped);

  if (!bootstrapped || status === 'booting') {
    return null;
  }

  if (status === 'authenticated') {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ ...createStackOptions(colors, fontsReady, { showNavActions: false }), headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
