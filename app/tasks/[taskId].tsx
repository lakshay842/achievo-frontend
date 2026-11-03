import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import {
  CalendarClock,
  CheckCircle2,
  CircleDashed,
  MessageCircleQuestion,
  Play,
  SkipForward,
  Sparkles,
  type LucideIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/common/app-text';
import { Button } from '@/components/common/button';
import { Card } from '@/components/common/card';
import { FlowScreen } from '@/components/common/flow-screen';
import { InlineNotice } from '@/components/common/inline-notice';
import { LoadingBlock } from '@/components/common/loading-block';
import { TextField } from '@/components/common/text-field';
import { useToast } from '@/components/common/toast';
import { queryKeys } from '@/constants/query-keys';
import { useTheme } from '@/hooks/use-theme';
import { explainTask } from '@/services/api/ai.api';
import {
  completeTask,
  getTask,
  rescheduleTask,
  sendTaskFeedback,
  skipTask,
  startTask,
} from '@/services/api/tasks.api';
import { radius, spacing } from '@/theme/spacing';
import type { TaskStatus } from '@/types/api';
import { getErrorMessage } from '@/utils/errors';
import { readParam } from '@/utils/params';
import { toPlainText } from '@/utils/plain-text';

type PendingAction = 'start' | 'complete' | 'skip' | 'reschedule' | null;

function statusStyle(status: TaskStatus, colors: ReturnType<typeof useTheme>['colors']) {
  switch (status) {
    case 'completed':
      return { bg: `${colors.primary}22`, fg: colors.primary, label: 'Completed' };
    case 'in_progress':
      return { bg: `${colors.lavender}22`, fg: colors.lavender, label: 'In progress' };
    case 'skipped':
      return { bg: `${colors.warning}22`, fg: colors.warning, label: 'Skipped' };
    case 'missed':
      return { bg: `${colors.coral}22`, fg: colors.coral, label: 'Missed' };
    default:
      return { bg: colors.secondarySoft, fg: colors.textMuted, label: 'Upcoming' };
  }
}

function ActionPill({
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
  const { colors } = useTheme();
  const textColor = solid ? colors.onPrimary : color;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: flex ? 1 : undefined,
        width: flex ? undefined : '100%',
        minHeight: 52,
        borderRadius: radius.full,
        borderWidth: solid ? 0 : 1,
        borderColor: `${color}55`,
        backgroundColor: solid
          ? pressed
            ? colors.primaryPressed
            : color
          : pressed
            ? `${color}28`
            : `${color}16`,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
        opacity: loading ? 0.6 : 1,
        paddingHorizontal: 14,
      })}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          <Icon color={textColor} size={17} strokeWidth={2.3} />
          <AppText variant="label" style={{ color: textColor }}>
            {label}
          </AppText>
        </>
      )}
    </Pressable>
  );
}

export default function TaskDetailsScreen() {
  const params = useLocalSearchParams<{ taskId?: string | string[] }>();
  const taskId = readParam(params.taskId);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<PendingAction>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [explanation, setExplanation] = useState<string | null>(null);
  const [feedbackNote, setFeedbackNote] = useState('');

  const taskQuery = useQuery({
    queryKey: queryKeys.task(taskId ?? ''),
    queryFn: () => getTask(taskId!),
    enabled: Boolean(taskId),
  });

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.task(taskId!) }),
      queryClient.invalidateQueries({ queryKey: ['goals'] }),
      queryClient.invalidateQueries({ queryKey: queryKeys.todayTasks }),
      queryClient.invalidateQueries({ queryKey: queryKeys.progressOverview }),
      queryClient.invalidateQueries({ queryKey: queryKeys.progressWeekly }),
      queryClient.invalidateQueries({ queryKey: queryKeys.progressMonthly }),
      queryClient.invalidateQueries({ queryKey: queryKeys.streaks }),
      queryClient.invalidateQueries({ queryKey: ['progress', 'goal'] }),
      queryClient.invalidateQueries({ queryKey: ['tasks', 'goal'] }),
    ]);
  };

  const actionMutation = useMutation({
    mutationFn: async () => {
      if (!taskId || !pending) {
        throw new Error('Nothing to do');
      }
      if (pending === 'start') return startTask(taskId);
      if (pending === 'complete') return completeTask(taskId);
      if (pending === 'skip') return skipTask(taskId);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(rescheduleDate)) {
        throw new Error('Use YYYY-MM-DD for the new date');
      }
      return rescheduleTask(taskId, rescheduleDate);
    },
    onSuccess: async () => {
      await invalidate();
      showToast('Task updated', 'success');
      setPending(null);
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  const feedbackMutation = useMutation({
    mutationFn: (difficulty: 'easy' | 'moderate' | 'hard') =>
      sendTaskFeedback(taskId!, { difficulty, note: feedbackNote.trim() || undefined }),
    onSuccess: async () => {
      setFeedbackNote('');
      await invalidate();
      showToast('Feedback saved', 'success');
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  const explainMutation = useMutation({
    mutationFn: () => explainTask(taskId!),
    onSuccess: (data) => {
      setExplanation(toPlainText(data.explanation));
      showToast('AI tip ready — scroll up to read', 'success');
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  const task = taskQuery.data;

  if (!taskId) {
    return (
      <FlowScreen showNav edges={['top', 'bottom', 'left', 'right']}>
        <AppText>Missing task.</AppText>
      </FlowScreen>
    );
  }

  if (taskQuery.isLoading || !task) {
    return (
      <FlowScreen showNav edges={['top', 'bottom', 'left', 'right']}>
        <LoadingBlock rows={5} />
      </FlowScreen>
    );
  }

  const status = statusStyle(task.status, colors);
  const canStart = task.status === 'pending' || task.status === 'missed';
  const canComplete = task.status === 'pending' || task.status === 'in_progress' || task.status === 'missed';
  const canSkip = task.status === 'pending' || task.status === 'in_progress';
  const canReschedule = task.status !== 'completed' && task.status !== 'skipped' && task.status !== 'superseded';

  return (
    <FlowScreen
      showNav edges={['top', 'bottom', 'left', 'right']}
      stickToEnd={Boolean(pending || explanation)}
      footer={
        <View
          style={{
            marginHorizontal: -spacing.xl,
            marginBottom: -spacing.xl,
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.md,
            paddingBottom: Math.max(insets.bottom, spacing.md),
            gap: 10,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
          }}
        >
          {canStart ? (
            <ActionPill
              label="Start task"
              icon={Play}
              color={colors.primary}
              solid
              onPress={() => setPending('start')}
            />
          ) : null}

          {canComplete ? (
            <ActionPill
              label="Complete task"
              icon={CheckCircle2}
              color={colors.primary}
              onPress={() => setPending('complete')}
            />
          ) : null}

          {(canSkip || canReschedule) && (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {canSkip ? (
                <ActionPill
                  label="Skip"
                  icon={SkipForward}
                  color={colors.warning}
                  flex
                  onPress={() => setPending('skip')}
                />
              ) : null}
              {canReschedule ? (
                <ActionPill
                  label="Reschedule"
                  icon={CalendarClock}
                  color={colors.lavender}
                  flex
                  onPress={() => setPending('reschedule')}
                />
              ) : null}
            </View>
          )}

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <ActionPill
              label="Ask AI"
              icon={MessageCircleQuestion}
              color={colors.coral}
              flex
              loading={explainMutation.isPending}
              onPress={() => explainMutation.mutate()}
            />
            <ActionPill
              label="AI Coach"
              icon={Sparkles}
              color={colors.lavender}
              flex
              onPress={() => router.push('/(tabs)/coach')}
            />
          </View>
        </View>
      }
    >
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: radius.xl,
          padding: 20,
          gap: 12,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View className="flex-row items-center justify-between" style={{ gap: 10 }}>
          <View
            style={{
              borderRadius: radius.full,
              backgroundColor: status.bg,
              paddingHorizontal: 10,
              paddingVertical: 5,
            }}
          >
            <AppText variant="caption" style={{ color: status.fg }}>
              {status.label}
            </AppText>
          </View>
          <AppText variant="caption" tone="muted">
            {task.durationMinutes} min · {task.priority}
          </AppText>
        </View>
        <AppText variant="title">{task.title}</AppText>
        <View className="flex-row items-center" style={{ gap: 8 }}>
          <CircleDashed color={colors.iconMuted} size={14} />
          <AppText variant="caption" tone="muted">
            {task.taskDate ? task.taskDate : `Day ${task.day}`}
          </AppText>
        </View>
      </View>

      <Card>
        <AppText variant="kicker" tone="muted">
          Instructions
        </AppText>
        <AppText variant="caption" tone="muted">
          Kaise karna hai — step by step
        </AppText>
        {(task.instructions ?? []).length === 0 ? (
          <AppText variant="body" tone="muted">
            No instructions provided.
          </AppText>
        ) : (
          task.instructions.map((item, index) => (
            <View key={`${item}-${index}`} className="flex-row" style={{ gap: 10 }}>
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: radius.full,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: `${colors.primary}18`,
                }}
              >
                <AppText variant="caption" style={{ color: colors.primary }}>
                  {index + 1}
                </AppText>
              </View>
              <AppText variant="body" style={{ flex: 1 }}>
                {item}
              </AppText>
            </View>
          ))
        )}
      </Card>

      <Card>
        <AppText variant="kicker" tone="muted">
          Done when
        </AppText>
        <AppText variant="caption" tone="muted">
          Complete tabhi mark karo jab yeh true ho
        </AppText>
        {(task.completionCriteria ?? []).length === 0 ? (
          <AppText variant="body" tone="muted">
            Mark complete when the work is done.
          </AppText>
        ) : (
          task.completionCriteria.map((item, index) => (
            <View key={`${item}-${index}`} className="flex-row items-start" style={{ gap: 10 }}>
              <CheckCircle2 color={colors.lavender} size={18} strokeWidth={2.2} />
              <AppText variant="body" style={{ flex: 1 }}>
                {item}
              </AppText>
            </View>
          ))
        )}
      </Card>

      {task.status === 'completed' ? (
        <Card>
          <AppText variant="label">How did this feel?</AppText>
          <AppText variant="caption" tone="muted">
            {task.difficultyFeedback
              ? `Saved as ${task.difficultyFeedback}. You can update it.`
              : 'Easy, moderate, or hard keeps the next plan realistic.'}
          </AppText>
          <TextField label="Optional note" value={feedbackNote} onChangeText={setFeedbackNote} />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <ActionPill
              label="Easy"
              icon={CheckCircle2}
              color={colors.primary}
              flex
              loading={feedbackMutation.isPending}
              onPress={() => feedbackMutation.mutate('easy')}
            />
            <ActionPill
              label="OK"
              icon={CircleDashed}
              color={colors.lavender}
              flex
              loading={feedbackMutation.isPending}
              onPress={() => feedbackMutation.mutate('moderate')}
            />
            <ActionPill
              label="Hard"
              icon={SkipForward}
              color={colors.coral}
              flex
              loading={feedbackMutation.isPending}
              onPress={() => feedbackMutation.mutate('hard')}
            />
          </View>
        </Card>
      ) : null}

      {explanation ? (
        <Card style={{ borderWidth: 1, borderColor: `${colors.coral}55`, backgroundColor: `${colors.coral}10` }}>
          <AppText variant="kicker" style={{ color: colors.coral }}>
            AI help
          </AppText>
          <AppText variant="body">{explanation}</AppText>
        </Card>
      ) : null}

      {pending ? (
        <Card style={{ borderWidth: 1, borderColor: `${colors.warning}55` }}>
          <InlineNotice
            title={
              pending === 'start'
                ? 'Start this task?'
                : pending === 'complete'
                  ? 'Mark this task complete?'
                  : pending === 'skip'
                    ? 'Skip this task?'
                    : 'Reschedule this task?'
            }
            message="Confirm karo — update Achievo account pe save hoga."
            tone="warning"
          />
          {pending === 'reschedule' ? (
            <TextField
              label="New date (YYYY-MM-DD)"
              autoCapitalize="none"
              value={rescheduleDate}
              onChangeText={setRescheduleDate}
              placeholder="2026-11-03"
            />
          ) : null}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button
              label="Cancel"
              variant="secondary"
              onPress={() => setPending(null)}
              style={{ flex: 1, borderRadius: radius.full }}
            />
            <Button
              label="Confirm"
              loading={actionMutation.isPending}
              onPress={() => actionMutation.mutate()}
              style={{ flex: 1, borderRadius: radius.full }}
            />
          </View>
        </Card>
      ) : null}
    </FlowScreen>
  );
}
