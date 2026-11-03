import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { BellRing, Home, LogOut, MonitorSmartphone, Moon, Sparkles, Sun } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, ScrollView, Switch, View } from 'react-native';

import { AppText } from '@/components/common/app-text';
import { Button } from '@/components/common/button';
import { Card } from '@/components/common/card';
import { IconButton } from '@/components/common/icon-button';
import { Screen } from '@/components/common/screen';
import { ScreenHeading } from '@/components/common/screen-heading';
import { SegmentedControl } from '@/components/common/segmented-control';
import { useToast } from '@/components/common/toast';
import { queryKeys } from '@/constants/query-keys';
import {
  sendMotivationNotification,
  updateNotificationPreferences,
} from '@/services/api/notifications.api';
import { fetchCurrentUser } from '@/services/api/users.api';
import { requestNotificationAccess } from '@/services/notifications/permissions';
import { useAuthStore } from '@/store/auth.store';
import { useUserStore } from '@/store/user.store';
import { spacing } from '@/theme/spacing';
import { getErrorMessage } from '@/utils/errors';

const themeOptions = [
  { value: 'system', label: 'System', icon: MonitorSmartphone },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
] as const;

export default function ProfileScreen() {
  const preference = useUserStore((state) => state.themePreference);
  const setThemePreference = useUserStore((state) => state.setThemePreference);
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const onboardingComplete = useAuthStore((state) => state.onboardingComplete);
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const account = useQuery({
    queryKey: ['profile'],
    queryFn: fetchCurrentUser,
    enabled: Boolean(accessToken),
  });
  const [leaving, setLeaving] = useState(false);
  const [enablingPush, setEnablingPush] = useState(false);
  const name = account.data?.name ?? user?.name;
  const email = account.data?.email ?? user?.email;
  const prefs = account.data?.preferences;

  const prefsMutation = useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      showToast('Reminder settings saved', 'success');
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  const motivationPushMutation = useMutation({
    mutationFn: sendMotivationNotification,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      showToast(
        Platform.OS === 'web'
          ? 'Motivation reminder logged (use a phone for real push)'
          : 'Motivation reminder sent',
        'success',
      );
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  async function leave() {
    setLeaving(true);
    try {
      await logout();
      router.replace(onboardingComplete ? '/(auth)/login' : '/(onboarding)/welcome');
    } finally {
      setLeaving(false);
    }
  }

  async function enablePush() {
    setEnablingPush(true);
    try {
      if (Platform.OS === 'web') {
        showToast('Push reminders need the iOS or Android app', 'info');
        return;
      }
      const result = await requestNotificationAccess();
      if (!result.granted) {
        showToast('Notification permission was not granted', 'error');
        return;
      }
      await prefsMutation.mutateAsync({ notificationsEnabled: true, motivation: true });
      showToast('Motivation reminders enabled', 'success');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setEnablingPush(false);
    }
  }

  return (
    <Screen edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.lg,
          paddingBottom: spacing.xxl,
          gap: spacing.lg,
        }}
      >
        <ScreenHeading
          title="Profile"
          subtitle={email ?? 'Appearance and account'}
          trailing={<IconButton icon={Home} label="Home" onPress={() => router.replace('/(tabs)')} />}
        />
        <Card>
          <AppText variant="label">Appearance</AppText>
          <AppText variant="caption" tone="muted">
            Light, dark, or match this device. Your choice stays on the device.
          </AppText>
          <SegmentedControl
            label="Appearance"
            value={preference}
            options={themeOptions}
            onChange={(value) => void setThemePreference(value)}
          />
        </Card>

        <Card>
          <AppText variant="label">Motivation reminders</AppText>
          <AppText variant="caption" tone="muted">
            Get a daily push with a short nudge at your reminder time. Tap it to open AI Coach.
          </AppText>

          <View className="flex-row items-center justify-between" style={{ gap: 12 }}>
            <View className="flex-1" style={{ gap: 2 }}>
              <AppText variant="body">Notifications on</AppText>
              <AppText variant="caption" tone="muted">
                Master switch for all Achievo pushes
              </AppText>
            </View>
            <Switch
              value={Boolean(prefs?.notificationsEnabled)}
              disabled={!prefs || prefsMutation.isPending}
              onValueChange={(value) => prefsMutation.mutate({ notificationsEnabled: value })}
            />
          </View>

          <View className="flex-row items-center justify-between" style={{ gap: 12 }}>
            <View className="flex-1" style={{ gap: 2 }}>
              <AppText variant="body">Daily motivation push</AppText>
              <AppText variant="caption" tone="muted">
                Around {prefs?.dailyReminderTime ?? '08:00'} in your timezone
              </AppText>
            </View>
            <Switch
              value={Boolean(prefs?.motivation)}
              disabled={!prefs || prefsMutation.isPending || prefs?.notificationsEnabled === false}
              onValueChange={(value) => prefsMutation.mutate({ motivation: value })}
            />
          </View>

          <Button
            label="Enable push on this device"
            icon={BellRing}
            variant="secondary"
            loading={enablingPush}
            onPress={() => void enablePush()}
          />
          <Button
            label="Send motivation now"
            icon={Sparkles}
            loading={motivationPushMutation.isPending}
            disabled={prefs?.notificationsEnabled === false}
            onPress={() => motivationPushMutation.mutate()}
          />
        </Card>

        <Card>
          <AppText variant="label">Account</AppText>
          <AppText variant="body" tone="muted">
            {name && email
              ? `${name} · ${email}`
              : accessToken
                ? 'You are signed in on this device.'
                : 'Sign in to manage your account.'}
          </AppText>
          {prefs ? (
            <AppText variant="caption" tone="muted">
              Daily reminder at {prefs.dailyReminderTime}
              {prefs.motivation ? ' · motivation on' : ' · motivation off'}
            </AppText>
          ) : null}
          <Button label="Log out" variant="secondary" icon={LogOut} loading={leaving} onPress={() => void leave()} />
        </Card>
      </ScrollView>
    </Screen>
  );
}
