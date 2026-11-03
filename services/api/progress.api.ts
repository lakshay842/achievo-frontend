import { requestData } from '@/services/api/http';
import type { GoalProgress, ProgressOverview, ProgressRange, Streaks } from '@/types/api';

export function getProgressOverview() {
  return requestData<ProgressOverview>({
    method: 'GET',
    url: '/progress/overview',
  });
}

export function getGoalProgress(goalId: string) {
  return requestData<GoalProgress>({
    method: 'GET',
    url: `/progress/goals/${goalId}`,
  });
}

export function getStreaks() {
  return requestData<Streaks>({
    method: 'GET',
    url: '/progress/streaks',
  });
}

export function getWeeklyProgress() {
  return requestData<ProgressRange>({
    method: 'GET',
    url: '/progress/weekly',
  });
}

export function getMonthlyProgress() {
  return requestData<ProgressRange>({
    method: 'GET',
    url: '/progress/monthly',
  });
}
