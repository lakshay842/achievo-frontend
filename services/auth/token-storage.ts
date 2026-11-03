import { STORAGE_KEYS } from '@/constants/storage-keys';
import { readStoredValue, removeStoredValue, writeStoredValue } from '@/utils/secure-storage';

export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
};

export async function getAccessToken(): Promise<string | null> {
  return readStoredValue(STORAGE_KEYS.accessToken);
}

export async function getRefreshToken(): Promise<string | null> {
  return readStoredValue(STORAGE_KEYS.refreshToken);
}

export async function saveTokens(tokens: AuthTokens): Promise<void> {
  await writeStoredValue(STORAGE_KEYS.accessToken, tokens.accessToken);

  if (tokens.refreshToken) {
    await writeStoredValue(STORAGE_KEYS.refreshToken, tokens.refreshToken);
  }
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    removeStoredValue(STORAGE_KEYS.accessToken),
    removeStoredValue(STORAGE_KEYS.refreshToken),
  ]);
}
