import { requestData, requestPaged } from '@/services/api/http';
import type { Assessment, CreateGoalInput, Goal, GoalStatus } from '@/types/api';

export function createGoal(input: CreateGoalInput) {
  return requestData<Goal>({
    method: 'POST',
    url: '/goals',
    data: input,
  });
}

export function listGoals(params?: { status?: GoalStatus; page?: number; limit?: number }) {
  return requestPaged<Goal[]>({
    method: 'GET',
    url: '/goals',
    params,
  });
}

export function getAssessment(goalId: string) {
  return requestData<Assessment>({
    method: 'GET',
    url: `/goals/${goalId}/assessment`,
  });
}

export function getGoal(goalId: string) {
  return requestData<Goal>({
    method: 'GET',
    url: `/goals/${goalId}`,
  });
}

export function updateGoal(goalId: string, input: Partial<CreateGoalInput>) {
  return requestData<Goal>({
    method: 'PATCH',
    url: `/goals/${goalId}`,
    data: input,
  });
}

export function pauseGoal(goalId: string) {
  return requestData<Goal>({
    method: 'POST',
    url: `/goals/${goalId}/pause`,
  });
}

export function resumeGoal(goalId: string) {
  return requestData<Goal>({
    method: 'POST',
    url: `/goals/${goalId}/resume`,
  });
}

export function archiveGoal(goalId: string) {
  return requestData<Goal>({
    method: 'POST',
    url: `/goals/${goalId}/archive`,
  });
}

export function activateGoal(goalId: string) {
  return requestData<Goal>({
    method: 'POST',
    url: `/goals/${goalId}/activate`,
  });
}

export function deleteGoal(goalId: string) {
  return requestData<{ id: string; deleted: boolean }>({
    method: 'DELETE',
    url: `/goals/${goalId}`,
  });
}
