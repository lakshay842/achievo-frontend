import { requestData, requestMessage } from '@/services/api/http';
import type { AuthSession, AuthTokens, User } from '@/types/api';

export function registerAccount(input: {
  name: string;
  email: string;
  password: string;
  timezone?: string;
}) {
  return requestData<AuthSession>({
    method: 'POST',
    url: '/auth/register',
    data: input,
  });
}

export function loginAccount(input: { email: string; password: string }) {
  return requestData<AuthSession>({
    method: 'POST',
    url: '/auth/login',
    data: input,
  });
}

export function logoutAccount(refreshToken: string) {
  return requestMessage({
    method: 'POST',
    url: '/auth/logout',
    data: { refreshToken },
  });
}

export function refreshSession(refreshToken: string) {
  return requestData<AuthTokens>({
    method: 'POST',
    url: '/auth/refresh',
    data: { refreshToken },
  });
}

export function fetchMe() {
  return requestData<User>({
    method: 'GET',
    url: '/auth/me',
  });
}

export function forgotPassword(email: string) {
  return requestData<{ delivered: boolean; resetToken?: string }>({
    method: 'POST',
    url: '/auth/forgot-password',
    data: { email },
  });
}

export function resetPassword(input: { token: string; password: string }) {
  return requestMessage({
    method: 'POST',
    url: '/auth/reset-password',
    data: input,
  });
}
