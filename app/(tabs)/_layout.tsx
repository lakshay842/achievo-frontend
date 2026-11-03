import { Tabs } from 'expo-router';

import { AppTabBar } from '@/components/navigation/tab-bar';
import { RequireSession } from '@/components/navigation/require-session';

export default function TabLayout() {
  return (
    <RequireSession>
      <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <AppTabBar {...props} />}>
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="goals" options={{ title: 'My Goals' }} />
        <Tabs.Screen name="coach" options={{ title: 'AI Coach' }} />
        <Tabs.Screen name="progress" options={{ title: 'Progress' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      </Tabs>
    </RequireSession>
  );
}
