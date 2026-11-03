import { create } from 'zustand';

import type { Assessment, Goal, Roadmap } from '@/types/api';

type GoalDraftState = {
  draftGoal: Goal | null;
  assessment: Assessment | null;
  draftRoadmap: Roadmap | null;
  lastOpenedGoalId: string | null;
  setDraft: (payload: { goal: Goal; assessment: Assessment }) => void;
  setAssessment: (assessment: Assessment) => void;
  setDraftRoadmap: (roadmap: Roadmap | null) => void;
  rememberGoal: (goalId: string) => void;
  clearDraft: () => void;
};

export const useGoalStore = create<GoalDraftState>((set) => ({
  draftGoal: null,
  assessment: null,
  draftRoadmap: null,
  lastOpenedGoalId: null,
  setDraft: ({ goal, assessment }) => set({ draftGoal: goal, assessment }),
  setAssessment: (assessment) => set({ assessment }),
  setDraftRoadmap: (draftRoadmap) => set({ draftRoadmap }),
  rememberGoal: (goalId) => set({ lastOpenedGoalId: goalId }),
  clearDraft: () => set({ draftGoal: null, assessment: null, draftRoadmap: null }),
}));
