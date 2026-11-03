import { requestData, requestPaged } from '@/services/api/http';
import type { AppNotification, NotificationPreferences } from '@/types/api';

export function registerDeviceToken(input: {
  token: string;
  platform?: 'ios' | 'android' | 'unknown';
}) {
  return requestData<{ token: string; platform: string; invalid: boolean }>({
    method: 'POST',
    url: '/notifications/device-token',
    data: input,
  });
}

export function listNotifications(params?: { page?: number; limit?: number }) {
  return requestPaged<AppNotification[]>({
    method: 'GET',
    url: '/notifications',
    params,
  });
}

export function updateNotificationPreferences(input: Partial<NotificationPreferences>) {
  return requestData<NotificationPreferences>({
    method: 'PATCH',
    url: '/notifications/preferences',
    data: input,
  });
}

export function sendTestNotification() {
  return requestData<AppNotification | null>({
    method: 'POST',
    url: '/notifications/test',
  });
}

export function sendMotivationNotification() {
  return requestData<AppNotification | null>({
    method: 'POST',
    url: '/notifications/motivation',
  });
}
