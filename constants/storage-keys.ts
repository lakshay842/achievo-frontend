export const STORAGE_KEYS = {
  accessToken: 'achievo.accessToken',
  refreshToken: 'achievo.refreshToken',
  onboardingComplete: 'achievo.onboardingComplete',
  themePreference: 'achievo.themePreference',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
