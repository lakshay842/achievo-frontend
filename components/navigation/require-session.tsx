import { Redirect, type Href } from 'expo-router';
import type { ReactNode } from 'react';

import { useAuthStore } from '@/store/auth.store';

export function RequireSession({ children }: { children: ReactNode }) {
  const status = useAuthStore((state) => state.status);
  const bootstrapped = useAuthStore((state) => state.bootstrapped);
  const onboardingComplete = useAuthStore((state) => state.onboardingComplete);

  if (!bootstrapped || status === 'booting') {
    return null;
  }

  if (status !== 'authenticated') {
    const href: Href = onboardingComplete ? '/(auth)/login' : '/(onboarding)/welcome';
    return <Redirect href={href} />;
  }

  return children;
}
