import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { registerDeviceToken } from '@/services/api/notifications.api';
import { ensureNotificationChannels } from '@/services/notifications/setup';

export async function requestNotificationAccess(): Promise<{
  granted: boolean;
  token?: string;
}> {
  if (Platform.OS === 'web') {
    return { granted: false };
  }

  if (!Device.isDevice) {
    return { granted: false };
  }

  const current = await Notifications.getPermissionsAsync();
  let status = current.status;

  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }

  if (status !== 'granted') {
    return { granted: false };
  }

  await ensureNotificationChannels();

  const projectId =
    Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId ?? undefined;

  const push = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined,
  );
  const platform = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'unknown';

  try {
    await registerDeviceToken({
      token: push.data,
      platform,
    });
  } catch {
    // Permission can still be granted even if registration fails offline.
  }

  return { granted: true, token: push.data };
}

/** Re-register an existing grant after login/bootstrap (no permission prompt). */
export async function syncPushRegistration(): Promise<void> {
  if (Platform.OS === 'web' || !Device.isDevice) {
    return;
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.status !== 'granted') {
    return;
  }

  await ensureNotificationChannels();

  const projectId =
    Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId ?? undefined;

  try {
    const push = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    const platform = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'unknown';
    await registerDeviceToken({
      token: push.data,
      platform,
    });
  } catch {
    // Push sync is best-effort.
  }
}
