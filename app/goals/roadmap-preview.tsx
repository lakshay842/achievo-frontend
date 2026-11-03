import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { AppText } from '@/components/common/app-text';
import { Button } from '@/components/common/button';
import { Card } from '@/components/common/card';
import { FlowScreen } from '@/components/common/flow-screen';
import { InlineNotice } from '@/components/common/inline-notice';
import { LoadingBlock } from '@/components/common/loading-block';
import { useToast } from '@/components/common/toast';
import { queryKeys } from '@/constants/query-keys';
import { generateRoadmap, replanRoadmap } from '@/services/api/ai.api';
import { approveRoadmap, getRoadmap } from '@/services/api/roadmaps.api';
import { useGoalStore } from '@/store/goal.store';
import { spacing } from '@/theme/spacing';
import { getErrorMessage } from '@/utils/errors';
import { readParam } from '@/utils/params';

export default function RoadmapPreviewScreen() {
  const params = useLocalSearchParams<{ goalId?: string | string[]; roadmapId?: string | string[] }>();
  const goalId = readParam(params.goalId);
  const roadmapId = readParam(params.roadmapId);
  const draftRoadmap = useGoalStore((state) => state.draftRoadmap);
  const setDraftRoadmap = useGoalStore((state) => state.setDraftRoadmap);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const roadmapQuery = useQuery({
    queryKey: queryKeys.roadmap(roadmapId ?? 'draft'),
    queryFn: () => getRoadmap(roadmapId!),
    enabled: Boolean(roadmapId),
    initialData: draftRoadmap && draftRoadmap.id === roadmapId ? draftRoadmap : undefined,
  });

  const roadmap = roadmapQuery.data ?? draftRoadmap;

  const approveMutation = useMutation({
    mutationFn: () => approveRoadmap(roadmap!.id),
    onSuccess: async (approved) => {
      setDraftRoadmap(approved);
      await queryClient.invalidateQueries({ queryKey: queryKeys.goals() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.todayTasks });
      showToast('Roadmap approved and activated', 'success');
      router.replace({ pathname: '/goals/[goalId]', params: { goalId: approved.goalId } });
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  const regenerateMutation = useMutation({
    mutationFn: async () => {
      if (roadmap?.status === 'draft') {
        return generateRoadmap(roadmap.goalId);
      }
      return replanRoadmap(roadmap!.id);
    },
    onSuccess: (next) => {
      setDraftRoadmap(next);
      showToast('A new draft is ready. It is not active yet.', 'success');
      router.setParams({ roadmapId: next.id, goalId: next.goalId });
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  if (!roadmap && roadmapQuery.isLoading) {
    return (
      <FlowScreen showNav edges={['top', 'bottom', 'left', 'right']}>
        <LoadingBlock rows={5} />
      </FlowScreen>
    );
  }

  if (!roadmap) {
    return (
      <FlowScreen
        showNav edges={['top', 'bottom', 'left', 'right']}
        footer={<Button label="Create a goal" onPress={() => router.replace('/goals/create')} />}
      >
        <InlineNotice title="No roadmap" message="Generate a roadmap from clarification first." tone="warning" />
      </FlowScreen>
    );
  }

  const milestones = roadmap.milestones ?? [];
  const tasks = milestones.flatMap((milestone) => milestone.tasks ?? []);

  return (
    <FlowScreen
      showNav edges={['top', 'bottom', 'left', 'right']}
      description="Review the summary before anything is scheduled. Approving is the only step that activates this plan."
      footer={
        <>
          {roadmap.status === 'draft' ? (
            <Button
              label="Approve roadmap"
              loading={approveMutation.isPending}
              onPress={() => approveMutation.mutate()}
            />
          ) : (
            <InlineNotice title="Already approved" message="This roadmap is active." tone="success" />
          )}
          <Button label="Edit goal details" variant="secondary" onPress={() => router.push('/goals/create')} />
          <Button
            label="Regenerate roadmap"
            variant="ghost"
            loading={regenerateMutation.isPending}
            onPress={() => regenerateMutation.mutate()}
          />
        </>
      }
    >
      <Card>
        <AppText variant="kicker" tone="primary">
          {roadmap.status.toUpperCase()}
        </AppText>
        <AppText variant="heading">{roadmap.title}</AppText>
        <AppText variant="body" tone="muted">
          {roadmap.durationDays} days · {roadmap.dailyMinutes} min/day · {roadmap.category}
        </AppText>
        <AppText variant="caption" tone="muted">
          Source: {roadmap.source}
        </AppText>
      </Card>

      <Card>
        <AppText variant="label">Expected outcome</AppText>
        <AppText variant="body" tone="muted">
          Complete {milestones.length} milestones across {tasks.length} planned tasks.
        </AppText>
      </Card>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
        {milestones.map((milestone) => (
          <Card key={milestone.id} style={{ width: 240 }}>
            <AppText variant="caption" tone="muted">
              Milestone {milestone.sequence}
            </AppText>
            <AppText variant="label">{milestone.title}</AppText>
            <AppText variant="caption" tone="muted">
              {(milestone.tasks ?? []).length} tasks
            </AppText>
          </Card>
        ))}
      </ScrollView>

      <Card>
        <AppText variant="label">Sample daily tasks</AppText>
        <View style={{ gap: 10 }}>
          {tasks.slice(0, 6).map((task) => (
            <View key={task.id} style={{ gap: 2 }}>
              <AppText variant="label">
                Day {task.day}: {task.title}
              </AppText>
              <AppText variant="caption" tone="muted">
                {task.durationMinutes} min · {task.priority}
              </AppText>
            </View>
          ))}
        </View>
      </Card>
    </FlowScreen>
  );
}
