import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

import { refreshAccessToken } from '@/services/api/refresh';
import { getAccessToken } from '@/services/auth/token-storage';
import { isAppError, toAppError } from '@/utils/errors';

const baseURL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

function createClient(timeout: number): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use(async (config) => {
    if (!config.baseURL) {
      throw toAppError(
        new Error('Set EXPO_PUBLIC_API_URL to your backend, for example http://192.168.3.205:5000/api/v1.'),
      );
    }

    try {
      const token = await getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // A missing token store should not turn into a credential leak or a crash.
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (isAppError(error)) {
        return Promise.reject(error);
      }

      if (!axios.isAxiosError(error) || !error.config) {
        return Promise.reject(toAppError(error));
      }

      const config = error.config as RetryConfig;
      const url = config.url ?? '';
      const isAuthAttempt =
        url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh');

      if (error.response?.status === 401 && !config._retry && !isAuthAttempt) {
        config._retry = true;
        const nextToken = await refreshAccessToken();
        if (nextToken) {
          config.headers.Authorization = `Bearer ${nextToken}`;
          return client.request(config);
        }
        onSessionExpired?.();
      }

      return Promise.reject(toAppError(error));
    },
  );

  return client;
}

export const api = createClient(20_000);
export const aiApi = createClient(60_000);
