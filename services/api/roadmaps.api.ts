import { requestData } from '@/services/api/http';
import type { Roadmap } from '@/types/api';

export function listRoadmaps(goalId?: string) {
  return requestData<Roadmap[]>({
    method: 'GET',
    url: '/roadmaps',
    params: goalId ? { goalId } : undefined,
  });
}

export function getRoadmap(roadmapId: string) {
  return requestData<Roadmap>({
    method: 'GET',
    url: `/roadmaps/${roadmapId}`,
  });
}

export function approveRoadmap(roadmapId: string, startDate?: string) {
  return requestData<Roadmap>({
    method: 'POST',
    url: `/roadmaps/${roadmapId}/approve`,
    data: startDate ? { startDate } : {},
  });
}
