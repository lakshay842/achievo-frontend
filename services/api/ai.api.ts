import { aiApi } from '@/services/api/client';
import type {
  AnalyzeGoalInput,
  Assessment,
  CoachReply,
  Goal,
  Roadmap,
} from '@/types/api';
import type { ApiSuccess } from '@/types/api';

async function aiData<T>(config: Parameters<typeof aiApi.request>[0]): Promise<T> {
  const response = await aiApi.request<ApiSuccess<T>>(config);
  return response.data.data;
}

export function analyzeGoal(input: AnalyzeGoalInput) {
  return aiData<{ goal: Goal; assessment: Assessment }>({
    method: 'POST',
    url: '/ai/goals/analyze',
    data: input,
  });
}

export function clarifyGoal(input: {
  goalId: string;
  answers: Array<{ questionId?: string; question?: string; answer: string }>;
}) {
  return aiData<{ goal: Goal; assessment: Assessment }>({
    method: 'POST',
    url: '/ai/goals/clarify',
    data: input,
  });
}

export function generateRoadmap(goalId: string) {
  return aiData<Roadmap>({
    method: 'POST',
    url: '/ai/roadmaps/generate',
    data: { goalId },
  });
}

export function replanRoadmap(roadmapId: string) {
  return aiData<Roadmap & { requiresApproval?: boolean; previousRoadmapId?: string; note?: string }>({
    method: 'POST',
    url: `/ai/roadmaps/${roadmapId}/replan`,
  });
}

export function chatWithAi(input: { message: string; conversationId?: string; goalId?: string }) {
  return aiData<CoachReply>({
    method: 'POST',
    url: '/ai/chat',
    data: input,
  });
}

export function explainTask(taskId: string) {
  return aiData<{ taskId: string; explanation: string }>({
    method: 'POST',
    url: `/ai/tasks/${taskId}/explain`,
  });
}
