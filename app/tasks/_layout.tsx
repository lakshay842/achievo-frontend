import { Stack } from 'expo-router';

import { RequireSession } from '@/components/navigation/require-session';
import { useTheme } from '@/hooks/use-theme';
import { createStackOptions } from '@/theme';

export default function TasksLayout() {
  const { colors, fontsReady } = useTheme();

  return (
    <RequireSession>
      <Stack screenOptions={{ ...createStackOptions(colors, fontsReady, { showNavActions: false }), headerShown: false }}>
        <Stack.Screen name="[taskId]" />
      </Stack>
    </RequireSession>
  );
}
