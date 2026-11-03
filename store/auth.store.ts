import { create } from 'zustand';

import { STORAGE_KEYS } from '@/constants/storage-keys';
import { queryClient } from '@/services/api/query-client';
import { fetchMe, loginAccount, logoutAccount, registerAccount } from '@/services/api/auth.api';
import { setSessionExpiredHandler } from '@/services/api/client';
import { refreshAccessToken } from '@/services/api/refresh';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from '@/services/auth/token-storage';
import type { User } from '@/types/api';
import { readStoredValue, writeStoredValue } from '@/utils/secure-storage';

export type AuthStatus = 'booting' | 'authenticated' | 'unauthenticated';

type AuthState = {
  status: AuthStatus;
  bootstrapped: boolean;
  accessToken: string | null;
  user: User | null;
  onboardingComplete: boolean;
  bootstrap: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  login: (input: { email: string; password: string }) => Promise<User>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    timezone?: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  markUnauthenticated: () => void;
};

let bootstrapTask: Promise<void> | null = null;

async function restoreSession(): Promise<{ accessToken: string; user: User } | null> {
  let accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();

  if (!accessToken && refreshToken) {
    accessToken = await refreshAccessToken();
  }

  if (!accessToken) {
    return null;
  }

  try {
    const user = await fetchMe();
    return { accessToken, user };
  } catch {
    if (!refreshToken) {
      return null;
    }

    const nextToken = await refreshAccessToken();
    if (!nextToken) {
      return null;
    }

    try {
      const user = await fetchMe();
      return { accessToken: nextToken, user };
    } catch {
      return null;
    }
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'booting',
  bootstrapped: false,
  accessToken: null,
  user: null,
  onboardingComplete: false,
  bootstrap: () => {
    if (!bootstrapTask) {
      bootstrapTask = (async () => {
        try {
          const onboarding = await readStoredValue(STORAGE_KEYS.onboardingComplete);
          const onboardingComplete = onboarding === 'true';
          const session = await restoreSession();

          if (!session) {
            set({
              accessToken: null,
              user: null,
              onboardingComplete,
              status: 'unauthenticated',
            });
            return;
          }

          set({
            accessToken: session.accessToken,
            user: session.user,
            onboardingComplete,
            status: 'authenticated',
          });
        } catch {
          set({
            accessToken: null,
            user: null,
            onboardingComplete: false,
            status: 'unauthenticated',
          });
        } finally {
          set({ bootstrapped: true });
        }
      })();
    }

    return bootstrapTask;
  },
  completeOnboarding: async () => {
    await writeStoredValue(STORAGE_KEYS.onboardingComplete, 'true');
    set({ onboardingComplete: true });
  },
  login: async (input) => {
    const session = await loginAccount(input);
    await saveTokens({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    });
    set({
      accessToken: session.accessToken,
      user: session.user,
      status: 'authenticated',
    });
    return session.user;
  },
  register: async (input) => {
    const session = await registerAccount(input);
    await saveTokens({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    });
    set({
      accessToken: session.accessToken,
      user: session.user,
      status: 'authenticated',
    });
    return session.user;
  },
  logout: async () => {
    const refreshToken = await getRefreshToken();
    try {
      if (refreshToken) {
        await logoutAccount(refreshToken);
      }
    } catch {
      // Local logout still proceeds.
    }

    await clearTokens();
    queryClient.clear();
    bootstrapTask = null;
    set({
      accessToken: null,
      user: null,
      status: 'unauthenticated',
      bootstrapped: true,
    });
  },
  setUser: (user) => set({ user }),
  markUnauthenticated: () => {
    queryClient.clear();
    bootstrapTask = null;
    set({
      accessToken: null,
      user: null,
      status: 'unauthenticated',
      bootstrapped: true,
    });
  },
}));

setSessionExpiredHandler(() => {
  void clearTokens();
  useAuthStore.getState().markUnauthenticated();
});
