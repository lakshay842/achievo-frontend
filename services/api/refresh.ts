import axios from 'axios';

import { clearTokens, getRefreshToken, saveTokens } from '@/services/auth/token-storage';

const baseURL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

let refreshTask: Promise<string | null> | null = null;

export function refreshAccessToken(): Promise<string | null> {
  if (!refreshTask) {
    refreshTask = rotate().finally(() => {
      refreshTask = null;
    });
  }

  return refreshTask;
}

async function rotate(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken || !baseURL) {
    return null;
  }

  try {
    const response = await axios.post<{ data: { accessToken: string; refreshToken: string } }>(
      `${baseURL}/auth/refresh`,
      { refreshToken },
      { timeout: 20_000, headers: { Accept: 'application/json', 'Content-Type': 'application/json' } },
    );
    const next = response.data.data;
    await saveTokens({ accessToken: next.accessToken, refreshToken: next.refreshToken });
    return next.accessToken;
  } catch {
    await clearTokens();
    return null;
  }
}
