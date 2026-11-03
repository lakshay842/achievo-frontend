import { Redirect, Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/store/auth.store';
import { createStackOptions } from '@/theme';

export default function OnboardingLayout() {
  const { colors, fontsReady } = useTheme();
  const status = useAuthStore((state) => state.status);
  const bootstrapped = useAuthStore((state) => state.bootstrapped);
  const onboardingComplete = useAuthStore((state) => state.onboardingComplete);

  if (!bootstrapped || status === 'booting') {
    return null;
  }

  if (status === 'authenticated') {
    return <Redirect href="/(tabs)" />;
  }

  if (onboardingComplete) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ ...createStackOptions(colors, fontsReady), headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="interests" />
      <Stack.Screen name="preferences" />
      <Stack.Screen name="notification-permission" />
    </Stack>
  );
}
