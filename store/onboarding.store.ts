import { create } from 'zustand';

import type { GoalCategory } from '@/constants/goals';

type OnboardingState = {
  interests: GoalCategory[];
  dailyMinutes: number;
  motivationStyle: 'gentle' | 'direct' | 'ambitious';
  notificationTime: string;
  toggleInterest: (interest: GoalCategory) => void;
  setDailyMinutes: (minutes: number) => void;
  setMotivationStyle: (style: 'gentle' | 'direct' | 'ambitious') => void;
  setNotificationTime: (time: string) => void;
  reset: () => void;
};

const initial = {
  interests: [] as GoalCategory[],
  dailyMinutes: 60,
  motivationStyle: 'gentle' as const,
  notificationTime: '08:00',
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  ...initial,
  toggleInterest: (interest) => {
    const current = get().interests;
    set({
      interests: current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    });
  },
  setDailyMinutes: (dailyMinutes) => set({ dailyMinutes }),
  setMotivationStyle: (motivationStyle) => set({ motivationStyle }),
  setNotificationTime: (notificationTime) => set({ notificationTime }),
  reset: () => set(initial),
}));
