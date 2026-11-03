import { aiApi } from '@/services/api/client';
import { requestData } from '@/services/api/http';
import type { ApiSuccess, CoachHistory, CoachReply, Motivation } from '@/types/api';

export function getMotivation() {
  return requestData<Motivation>({
    method: 'GET',
    url: '/coach/motivation',
  });
}

export function getCoachHistory(conversationId?: string) {
  return requestData<CoachHistory>({
    method: 'GET',
    url: '/coach/chat/history',
    params: conversationId ? { conversationId } : undefined,
  });
}

export async function coachChat(input: {
  message: string;
  conversationId?: string;
  goalId?: string;
}) {
  const response = await aiApi.request<ApiSuccess<CoachReply>>({
    method: 'POST',
    url: '/coach/chat',
    data: input,
  });
  return response.data.data;
}
