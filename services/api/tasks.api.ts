import { requestData, requestPaged } from '@/services/api/http';
import type { Task, TaskStatus } from '@/types/api';

export function getTodayTasks() {
  return requestData<{ date: string; tasks: Task[] }>({
    method: 'GET',
    url: '/tasks/today',
  });
}

export function listTasks(params?: {
  status?: TaskStatus;
  goalId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}) {
  return requestPaged<Task[]>({
    method: 'GET',
    url: '/tasks',
    params,
  });
}

export function getTask(taskId: string) {
  return requestData<Task>({
    method: 'GET',
    url: `/tasks/${taskId}`,
  });
}

export function startTask(taskId: string) {
  return requestData<Task>({
    method: 'POST',
    url: `/tasks/${taskId}/start`,
  });
}

export function completeTask(taskId: string) {
  return requestData<Task>({
    method: 'POST',
    url: `/tasks/${taskId}/complete`,
  });
}

export function skipTask(taskId: string) {
  return requestData<Task>({
    method: 'POST',
    url: `/tasks/${taskId}/skip`,
  });
}

export function rescheduleTask(taskId: string, taskDate: string) {
  return requestData<Task>({
    method: 'POST',
    url: `/tasks/${taskId}/reschedule`,
    data: { taskDate },
  });
}

export function sendTaskFeedback(
  taskId: string,
  input: { difficulty: 'easy' | 'moderate' | 'hard'; note?: string },
) {
  return requestData<Task>({
    method: 'POST',
    url: `/tasks/${taskId}/feedback`,
    data: input,
  });
}
