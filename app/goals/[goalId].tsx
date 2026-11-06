import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import {
  Archive,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Flag,
  Pause,
  Play,
  PlayCircle,
  RefreshCw,
  RotateCcw,
  Route,
  type LucideIcon,
} from 'lucide-react-native';
import { useCallback, useEffect } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/common/app-text';
import { Button } from '@/components/common/button';
import { Card } from '@/components/common/card';
import { FlowScreen } from '@/components/common/flow-screen';
import { LoadingBlock } from '@/components/common/loading-block';
import { useToast } from '@/components/common/toast';
import { queryKeys } from '@/constants/query-keys';
import { useTheme } from '@/hooks/use-theme';
import { activateGoal, archiveGoal, getGoal, pauseGoal, resumeGoal } from '@/services/api/goals.api';
import { getGoalProgress } from '@/services/api/progress.api';
import { listRoadmaps } from '@/services/api/roadmaps.api';
import { listTasks } from '@/services/api/tasks.api';
import { useGoalStore } from '@/store/goal.store';
import { radius, spacing } from '@/theme/spacing';
import type { GoalStatus, Task, TaskStatus } from '@/types/api';
import { getErrorMessage } from '@/utils/errors';
import { readParam } from '@/utils/params';

function ActionButton({
  label,
  icon: Icon,
  color,
  loading,
  onPress,
  flex = false,
  solid = false,
}: {
  label: string;
  icon: LucideIcon;
  color: string;
  loading?: boolean;
  onPress: () => void;
  flex?: boolean;
  solid?: boolean;
}) {
  const { scheme } = useTheme();
  const outlineBg = scheme === 'dark' ? '#1F1F1F' : '#FFFFFF';
  const labelColor = solid ? '#0A0A0A' : color;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: flex ? 1 : undefined,
        width: flex ? undefined : '100%',
        alignSelf: 'stretch',
        opacity: loading ? 0.6 : pressed ? 0.88 : 1,
      })}
    >
      <View
        style={{
          minHeight: 52,
          borderRadius: radius.full,
          borderWidth: solid ? 0 : 2,
          borderColor: color,
          backgroundColor: solid ? color : outlineBg,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
          paddingHorizontal: 12,
          elevation: solid ? 4 : 2,
          shadowColor: color,
          shadowOpacity: solid ? 0.4 : 0.2,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
        }}
      >
        {loading ? (
          <ActivityIndicator color={labelColor} />
        ) : (
          <>
            <Icon color={labelColor} size={17} strokeWidth={2.4} />
            <AppText variant="label" style={{ color: labelColor, fontWeight: '700' }}>
              {label}
            </AppText>
          </>
        )}
      </View>
    </Pressable>
  );
}

function goalStatusStyle(status: GoalStatus, colors: ReturnType<typeof useTheme>['colors']) {
  switch (status) {
    case 'active':
      return { bg: `${colors.primary}22`, fg: colors.primary, label: 'Active' };
    case 'archived':
      return { bg: `${colors.coral}22`, fg: colors.coral, label: 'Archived' };
    case 'draft':
      return { bg: `${colors.lavender}22`, fg: colors.lavender, label: 'Draft' };
    case 'paused':
      return { bg: `${colors.warning}22`, fg: colors.warning, label: 'Paused' };
    case 'completed':
      return { bg: `${colors.success}22`, fg: colors.success, label: 'Completed' };
    default:
      return { bg: colors.secondarySoft, fg: colors.textMuted, label: status };
  }
}

function milestoneTone(status: string, colors: ReturnType<typeof useTheme>['colors']) {
  if (status === 'completed') return { fg: colors.primary, bg: `${colors.primary}18`, label: 'Done' };
  if (status === 'active') return { fg: colors.lavender, bg: `${colors.lavender}18`, label: 'In progress' };
  return { fg: colors.textMuted, bg: colors.secondarySoft, label: 'Pending' };
}

function taskStatusTone(status: TaskStatus, colors: ReturnType<typeof useTheme>['colors']) {
  if (status === 'completed') return { fg: colors.primary, label: 'Done' };
  if (status === 'in_progress') return { fg: colors.lavender, label: 'In progress' };
  if (status === 'missed') return { fg: colors.coral, label: 'Missed' };
  return { fg: colors.textMuted, label: 'Upcoming' };
}

function formatTaskDate(task: Task) {
  if (!task.taskDate) return `Day ${task.day}`;
  try {
    return new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(
      new Date(`${task.taskDate}T12:00:00`),
    );
  } catch {
    return task.taskDate;
  }
}

function SectionHeader({
  title,
  meaning,
  count,
  accent,
}: {
  title: string;
  meaning: string;
  count?: number;
  accent: string;
}) {
  return (
    <View style={{ gap: 4 }}>
      <View className="flex-row items-center justify-between" style={{ gap: 12 }}>
        <AppText variant="heading">{title}</AppText>
        {typeof count === 'number' ? (
          <View
            style={{
              borderRadius: radius.full,
              backgroundColor: `${accent}22`,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <AppText variant="caption" style={{ color: accent }}>
              {count}
            </AppText>
          </View>
        ) : null}
      </View>
      <AppText variant="caption" tone="muted">
        {meaning}
      </AppText>
    </View>
  );
}

function ProgressTrack({ value, color, track }: { value: number; color: string; track: string }) {
  return (
    <View style={{ height: 8, borderRadius: radius.full, backgroundColor: track, overflow: 'hidden' }}>
      <View
        style={{
          width: `${Math.max(4, Math.min(100, Math.round(value)))}%`,
          height: '100%',
          borderRadius: radius.full,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

export default function GoalDetailsScreen() {
  const params = useLocalSearchParams<{ goalId?: string | string[] }>();
  const goalId = readParam(params.goalId);
  const rememberGoal = useGoalStore((state) => state.rememberGoal);
  const { colors } = useTheme();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (goalId) {
      rememberGoal(goalId);
    }
  }, [goalId, rememberGoal]);

  const goalQuery = useQuery({
    queryKey: queryKeys.goal(goalId ?? ''),
    queryFn: () => getGoal(goalId!),
    enabled: Boolean(goalId),
  });
  const progressQuery = useQuery({
    queryKey: ['progress', 'goal', goalId],
    queryFn: () => getGoalProgress(goalId!),
    enabled: Boolean(goalId),
  });
  const tasksQuery = useQuery({
    queryKey: ['tasks', 'goal', goalId],
    queryFn: () => listTasks({ goalId: goalId!, limit: 40 }),
    enabled: Boolean(goalId),
  });
  const roadmapsQuery = useQuery({
    queryKey: ['roadmaps', goalId],
    queryFn: () => listRoadmaps(goalId!),
    enabled: Boolean(goalId),
  });

  // Refetch when coming back from a completed task so Overall progress updates without a manual refresh.
  useFocusEffect(
    useCallback(() => {
      if (!goalId) return;
      void goalQuery.refetch();
      void progressQuery.refetch();
      void tasksQuery.refetch();
    }, [goalId]),
  );

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.goal(goalId!) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.goals() }),
      queryClient.invalidateQueries({ queryKey: ['progress', 'goal', goalId] }),
    ]);
  };

  const pauseMutation = useMutation({
    mutationFn: () => pauseGoal(goalId!),
    onSuccess: async () => {
      await invalidate();
      showToast('Goal paused', 'success');
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });
  const resumeMutation = useMutation({
    mutationFn: () => resumeGoal(goalId!),
    onSuccess: async () => {
      await invalidate();
      showToast('Goal resumed', 'success');
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });
  const archiveMutation = useMutation({
    mutationFn: () => archiveGoal(goalId!),
    onSuccess: async () => {
      await invalidate();
      showToast('Goal archived', 'success');
      router.replace('/(tabs)/goals');
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });
  const activateMutation = useMutation({
    mutationFn: () => activateGoal(goalId!),
    onSuccess: async () => {
      await invalidate();
      showToast('Goal activated', 'success');
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  const goal = goalQuery.data;
  const tasks = tasksQuery.data?.items ?? [];
  const completed = tasks.filter((task) => task.status === 'completed');
  const upcoming = tasks.filter((task) => task.status === 'pending' || task.status === 'in_progress');
  const draftRoadmap = (roadmapsQuery.data ?? []).find((item) => item.status === 'draft');
  const activeRoadmap = (roadmapsQuery.data ?? []).find((item) => item.status === 'approved');
  const milestones = progressQuery.data?.milestones ?? [];

  if (!goalId) {
    return (
      <FlowScreen showNav edges={['top', 'bottom', 'left', 'right']}>
        <AppText>Missing goal.</AppText>
      </FlowScreen>
    );
  }

  if (goalQuery.isLoading || !goal) {
    return (
      <FlowScreen showNav edges={['top', 'bottom', 'left', 'right']}>
        <LoadingBlock rows={5} />
      </FlowScreen>
    );
  }

  const status = goalStatusStyle(goal.status, colors);
  const showContinue = goal.status === 'draft' || Boolean(draftRoadmap);
  const showRebuild = Boolean(activeRoadmap);
  const showPause = goal.status === 'active';
  const showResume = goal.status === 'paused';
  const showArchive = goal.status !== 'archived';
  const showActivate = goal.status === 'archived';

  return (
    <FlowScreen
      showNav edges={['top', 'bottom', 'left', 'right']}
      footer={
        <View
          style={{
            gap: 10,
            paddingBottom: Math.max(0, insets.bottom - spacing.sm),
          }}
        >
          {showActivate ? (
            <ActionButton
              label="Activate goal"
              icon={RotateCcw}
              color={colors.primary}
              loading={activateMutation.isPending}
              onPress={() => activateMutation.mutate()}
            />
          ) : null}

          {showContinue ? (
            <Button
              label="Continue roadmap"
              icon={Route}
              onPress={() =>
                router.push({
                  pathname: draftRoadmap ? '/goals/roadmap-preview' : '/goals/clarification',
                  params: draftRoadmap ? { goalId, roadmapId: draftRoadmap.id } : { goalId },
                })
              }
              style={{ borderRadius: radius.full, minHeight: 52 }}
            />
          ) : null}

          {showRebuild && !showActivate ? (
            <ActionButton
              label="Rebuild plan"
              icon={RefreshCw}
              color={colors.lavender}
              onPress={() =>
                router.push({
                  pathname: '/goals/roadmap-preview',
                  params: { goalId, roadmapId: activeRoadmap!.id },
                })
              }
            />
          ) : null}

          {(showPause || showResume || showArchive) && (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {showPause ? (
                <ActionButton
                  label="Pause"
                  icon={Pause}
                  color={colors.warning}
                  loading={pauseMutation.isPending}
                  onPress={() => pauseMutation.mutate()}
                  flex
                />
              ) : null}

              {showResume ? (
                <ActionButton
                  label="Resume"
                  icon={Play}
                  color={colors.primary}
                  loading={resumeMutation.isPending}
                  onPress={() => resumeMutation.mutate()}
                  flex
                />
              ) : null}

              {showArchive ? (
                <ActionButton
                  label="Archive"
                  icon={Archive}
                  color={colors.coral}
                  loading={archiveMutation.isPending}
                  onPress={() => archiveMutation.mutate()}
                  flex
                />
              ) : null}
            </View>
          )}
        </View>
      }
    >
      {/* Hero — goal overview */}
      <View
        style={{
          backgroundColor: colors.primary,
          borderRadius: radius.xl,
          padding: 20,
          gap: 14,
        }}
      >
        <View className="flex-row items-center justify-between" style={{ gap: 12 }}>
          <View
            style={{
              borderRadius: radius.full,
              backgroundColor: 'rgba(0,0,0,0.16)',
              paddingHorizontal: 10,
              paddingVertical: 5,
            }}
          >
            <AppText variant="caption" style={{ color: colors.onPrimary }}>
              {status.label}
            </AppText>
          </View>
          <AppText variant="caption" style={{ color: colors.onPrimary, opacity: 0.75 }}>
            {goal.category}
          </AppText>
        </View>

        <AppText variant="title" style={{ color: colors.onPrimary }}>
          {goal.title}
        </AppText>

        <AppText variant="caption" style={{ color: colors.onPrimary, opacity: 0.8 }}>
          {goal.durationDays} days · {goal.availableMinutesPerDay} min/day
          {activeRoadmap ? ` · roadmap v${activeRoadmap.version}` : ''}
        </AppText>

        <View style={{ gap: 8 }}>
          <View className="flex-row items-end justify-between">
            <AppText variant="caption" style={{ color: colors.onPrimary, opacity: 0.8 }}>
              Overall progress
            </AppText>
            <AppText variant="heading" style={{ color: colors.onPrimary }}>
              {Math.round(progressQuery.data?.progressPercent ?? goal.progressPercent)}%
            </AppText>
          </View>
          <ProgressTrack
            value={progressQuery.data?.progressPercent ?? goal.progressPercent}
            color={colors.onPrimary}
            track="rgba(0,0,0,0.18)"
          />
        </View>
      </View>

      {goal.description ? (
        <Card>
          <AppText variant="kicker" tone="muted">
            About this goal
          </AppText>
          <AppText variant="body" tone="muted">
            {goal.description}
          </AppText>
        </Card>
      ) : null}

      {/* Milestones */}
      <View style={{ gap: spacing.md }}>
        <SectionHeader
          title="Milestones"
          meaning="Progress overview — not tappable. Use the task cards below"
          count={milestones.length}
          accent={colors.lavender}
        />

        {milestones.length === 0 ? (
          <Card>
            <AppText variant="body" tone="muted">
              Milestones appear after a roadmap is generated.
            </AppText>
          </Card>
        ) : (
          milestones.map((milestone, index) => {
            const tone = milestoneTone(milestone.status, colors);
            const accent = [colors.primary, colors.lavender, colors.coral][index % 3]!;
            return (
              <Card key={milestone.id} style={{ gap: 12 }}>
                <View className="flex-row items-start justify-between" style={{ gap: 12 }}>
                  <View className="flex-1" style={{ gap: 8 }}>
                    <View className="flex-row items-center" style={{ gap: 8 }}>
                      <View
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: radius.full,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: `${accent}22`,
                        }}
                      >
                        <Flag color={accent} size={14} strokeWidth={2.4} />
                      </View>
                      <AppText variant="caption" style={{ color: accent }}>
                        Milestone {milestone.sequence}
                      </AppText>
                    </View>
                    <AppText variant="label">{milestone.title}</AppText>
                  </View>
                  <View
                    style={{
                      borderRadius: radius.full,
                      backgroundColor: tone.bg,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                    }}
                  >
                    <AppText variant="caption" style={{ color: tone.fg }}>
                      {tone.label}
                    </AppText>
                  </View>
                </View>

                <ProgressTrack value={milestone.progressPercent} color={accent} track={colors.border} />

                <View className="flex-row items-center justify-between">
                  <AppText variant="caption" tone="muted">
                    {milestone.completedTasks}/{milestone.totalTasks} tasks done
                  </AppText>
                  <AppText variant="caption" style={{ color: accent }}>
                    {Math.round(milestone.progressPercent)}%
                  </AppText>
                </View>
              </Card>
            );
          })
        )}
      </View>

      {/* Upcoming */}
      <View style={{ gap: spacing.md }}>
        <SectionHeader
          title="Upcoming"
          meaning="Tap a card to open the task"
          count={upcoming.length}
          accent={colors.primary}
        />

        {upcoming.length === 0 ? (
          <Card>
            <AppText variant="body" tone="muted">
              No upcoming tasks right now.
            </AppText>
          </Card>
        ) : (
          upcoming.slice(0, 8).map((task) => {
            const tone = taskStatusTone(task.status, colors);
            const Icon = task.status === 'in_progress' ? PlayCircle : CircleDashed;
            return (
              <Pressable
                key={task.id}
                accessibilityRole="button"
                accessibilityHint="Opens this task"
                onPress={() => router.push({ pathname: '/tasks/[taskId]', params: { taskId: task.id } })}
                style={({ pressed }) => ({ opacity: pressed ? 0.86 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] })}
              >
                <Card
                  style={{
                    gap: 12,
                    borderWidth: 1.5,
                    borderColor: colors.inputBorder,
                    backgroundColor: colors.card,
                    overflow: 'hidden',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                    <View style={{ flex: 1, minWidth: 0, gap: 8 }}>
                      <AppText variant="label" numberOfLines={3}>
                        {task.title}
                      </AppText>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                            borderRadius: radius.full,
                            backgroundColor: colors.notice,
                            borderWidth: 1,
                            borderColor: colors.border,
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                          }}
                        >
                          <CalendarDays color={colors.iconMuted} size={13} strokeWidth={2.2} />
                          <AppText variant="caption" tone="muted">
                            {formatTaskDate(task)}
                          </AppText>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 5,
                            borderRadius: radius.full,
                            backgroundColor: `${tone.fg}22`,
                            borderWidth: 1,
                            borderColor: `${tone.fg}66`,
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                          }}
                        >
                          <Icon color={tone.fg} size={13} strokeWidth={2.2} />
                          <AppText variant="caption" style={{ color: tone.fg }}>
                            {tone.label}
                          </AppText>
                        </View>
                        <AppText variant="caption" tone="muted">
                          {task.durationMinutes}m
                        </AppText>
                      </View>
                    </View>
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: radius.full,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: colors.primary,
                        borderWidth: 1,
                        borderColor: colors.buttonBorder,
                        flexShrink: 0,
                      }}
                    >
                      <ChevronRight color={colors.onPrimary} size={18} strokeWidth={2.4} />
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTopWidth: 1,
                      borderTopColor: colors.border,
                      paddingTop: 10,
                      gap: 8,
                    }}
                  >
                    <AppText variant="caption" style={{ color: colors.primaryText, flexShrink: 1 }} numberOfLines={1}>
                      Tap to open task
                    </AppText>
                    <AppText variant="caption" style={{ color: colors.primaryText, fontWeight: '600' }}>
                      Open →
                    </AppText>
                  </View>
                </Card>
              </Pressable>
            );
          })
        )}
      </View>

      {/* Completed */}
      <View style={{ gap: spacing.md }}>
        <SectionHeader
          title="Completed"
          meaning="Tap these too to open details"
          count={completed.length}
          accent={colors.coral}
        />

        {completed.length === 0 ? (
          <Card>
            <AppText variant="body" tone="muted">
              No completed tasks yet — start the next upcoming one.
            </AppText>
          </Card>
        ) : (
          completed.slice(0, 8).map((task) => (
            <Pressable
              key={task.id}
              accessibilityRole="button"
              accessibilityHint="Opens this completed task"
              onPress={() => router.push({ pathname: '/tasks/[taskId]', params: { taskId: task.id } })}
              style={({ pressed }) => ({ opacity: pressed ? 0.86 : 1 })}
            >
              <Card
                style={{
                  gap: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <View className="flex-row items-center" style={{ gap: 10 }}>
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: radius.full,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: `${colors.primary}18`,
                    }}
                  >
                    <CheckCircle2 color={colors.primary} size={18} strokeWidth={2.2} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                    <AppText variant="label" numberOfLines={2}>
                      {task.title}
                    </AppText>
                    <AppText variant="caption" tone="muted">
                      {task.completedAt
                        ? new Date(task.completedAt).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })
                        : 'Completed'}
                    </AppText>
                  </View>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: radius.full,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: colors.secondarySoft,
                    }}
                  >
                    <ChevronRight color={colors.iconMuted} size={16} strokeWidth={2.2} />
                  </View>
                </View>
                <AppText variant="caption" style={{ color: colors.primary }}>
                  Tap to view details →
                </AppText>
              </Card>
            </Pressable>
          ))
        )}
      </View>
    </FlowScreen>
  );
}
