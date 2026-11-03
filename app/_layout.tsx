import '../global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, ThemeProvider as NavigationThemeProvider, type ErrorBoundaryProps } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RouteError } from '@/components/common/route-error';
import { ToastProvider } from '@/components/common/toast';
import { useTheme } from '@/hooks/use-theme';
import '@/services/api/client';
import { queryClient } from '@/services/api/query-client';
import {
  attachNotificationResponseListener,
  configureNotificationHandler,
} from '@/services/notifications/setup';
import { ThemeProvider, createNavigationTheme, createStackOptions } from '@/theme';

configureNotificationHandler();
attachNotificationResponseListener();

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <RouteError {...props} />;
}

function RootNavigator() {
  const { colors, scheme, fontsReady } = useTheme();

  return (
    <NavigationThemeProvider value={createNavigationTheme(scheme, colors)}>
      <Stack screenOptions={createStackOptions(colors, fontsReady)}>
        <Stack.Screen name="index" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="goals" options={{ headerShown: false }} />
        <Stack.Screen name="tasks" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
      </Stack>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <ToastProvider>
              <RootNavigator />
            </ToastProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
