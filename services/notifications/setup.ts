import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { NOTIFICATION_CHANNELS } from '@/services/notifications/channels';

let responseSubscription: Notifications.Subscription | null = null;

export function configureNotificationHandler() {
  if (Platform.OS === 'web') {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export function attachNotificationResponseListener() {
  if (Platform.OS === 'web') {
    return;
  }

  responseSubscription?.remove();
  responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data as {
      screen?: string;
      type?: string;
    };

    if (data?.screen === 'coach' || data?.type === 'motivation') {
      router.push('/(tabs)/coach');
      return;
    }

    if (data?.screen === 'home' || data?.type === 'daily_reminder') {
      router.push('/(tabs)');
      return;
    }

    router.push('/notifications');
  });
}

export function detachNotificationResponseListener() {
  responseSubscription?.remove();
  responseSubscription = null;
}

export async function ensureNotificationChannels() {
  if (Platform.OS !== 'android') {
    return;
  }

  const channels = [
    [NOTIFICATION_CHANNELS.daily, 'Daily reminders', Notifications.AndroidImportance.DEFAULT],
    [NOTIFICATION_CHANNELS.tasks, 'Task reminders', Notifications.AndroidImportance.DEFAULT],
    [NOTIFICATION_CHANNELS.milestones, 'Milestones', Notifications.AndroidImportance.DEFAULT],
    [NOTIFICATION_CHANNELS.motivation, 'Motivation', Notifications.AndroidImportance.HIGH],
    [NOTIFICATION_CHANNELS.deadlines, 'Deadlines', Notifications.AndroidImportance.HIGH],
  ] as const;

  try {
    await Promise.all(
      channels.map(([id, name, importance]) =>
        Notifications.setNotificationChannelAsync(id, {
          name,
          importance,
          vibrationPattern: id === NOTIFICATION_CHANNELS.motivation ? [0, 250, 120, 250] : undefined,
        }),
      ),
    );
  } catch {
    // Channel setup can be retried. It must not block startup.
  }
}
