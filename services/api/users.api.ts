import { requestData } from '@/services/api/http';
import type { NotificationPreferences, User } from '@/types/api';

export function fetchCurrentUser() {
  return requestData<User & { preferences: NotificationPreferences | null }>({
    method: 'GET',
    url: '/users/me',
  });
}

export function updateCurrentUser(input: { name?: string; timezone?: string }) {
  return requestData<User>({
    method: 'PATCH',
    url: '/users/me',
    data: input,
  });
}
