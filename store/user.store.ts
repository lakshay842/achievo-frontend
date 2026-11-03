import { create } from 'zustand';

import { STORAGE_KEYS } from '@/constants/storage-keys';
import type { NotificationPreferences } from '@/types/api';
import type { ThemePreference } from '@/theme/colors';
import { readStoredValue, writeStoredValue } from '@/utils/secure-storage';

type UserState = {
  themePreference: ThemePreference;
  preferences: NotificationPreferences | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setThemePreference: (preference: ThemePreference) => Promise<void>;
  setPreferences: (preferences: NotificationPreferences | null) => void;
};

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

let hydrateTask: Promise<void> | null = null;

export const useUserStore = create<UserState>((set, get) => ({
  themePreference: 'dark',
  preferences: null,
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) {
      return Promise.resolve();
    }

    if (!hydrateTask) {
      hydrateTask = (async () => {
        try {
          const stored = await readStoredValue(STORAGE_KEYS.themePreference);
          if (get().hydrated) {
            return;
          }

          set({
            themePreference: isThemePreference(stored) ? stored : 'dark',
            hydrated: true,
          });
        } catch {
          if (!get().hydrated) {
            set({ themePreference: 'dark', hydrated: true });
          }
        }
      })();
    }

    return hydrateTask;
  },
  setThemePreference: async (preference) => {
    set({ themePreference: preference, hydrated: true });
    try {
      await writeStoredValue(STORAGE_KEYS.themePreference, preference);
    } catch {
      // Session still uses the selected theme.
    }
  },
  setPreferences: (preferences) => set({ preferences }),
}));
