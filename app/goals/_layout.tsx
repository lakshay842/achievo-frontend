import { Stack } from 'expo-router';

import { RequireSession } from '@/components/navigation/require-session';
import { useTheme } from '@/hooks/use-theme';
import { createStackOptions } from '@/theme';

export default function GoalsLayout() {
  const { colors, fontsReady } = useTheme();

  return (
    <RequireSession>
      <Stack screenOptions={{ ...createStackOptions(colors, fontsReady, { showNavActions: false }), headerShown: false }}>
        <Stack.Screen name="create" />
        <Stack.Screen name="clarification" />
        <Stack.Screen name="roadmap-preview" />
        <Stack.Screen name="[goalId]" />
      </Stack>
    </RequireSession>
  );
}
