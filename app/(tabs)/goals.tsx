import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ChevronRight, Home, Plus, RotateCcw, Target, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { AppText } from '@/components/common/app-text';
import { Button } from '@/components/common/button';
import { Card } from '@/components/common/card';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { EmptyState } from '@/components/common/empty-state';
import { IconButton } from '@/components/common/icon-button';
import { LoadingBlock } from '@/components/common/loading-block';
import { Screen } from '@/components/common/screen';
import { ScreenHeading } from '@/components/common/screen-heading';
import { useToast } from '@/components/common/toast';
import { queryKeys } from '@/constants/query-keys';
import { useTheme } from '@/hooks/use-theme';
import { activateGoal, deleteGoal, listGoals } from '@/services/api/goals.api';
import { radius, spacing } from '@/theme/spacing';
import type { GoalStatus } from '@/types/api';
import { getErrorMessage } from '@/utils/errors';

function statusStyle(status: GoalStatus, colors: ReturnType<typeof useTheme>['colors']) {
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

export default function GoalsScreen() {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(null);

  const goalsQuery = useQuery({
    queryKey: queryKeys.goals(),
    queryFn: () => listGoals({ limit: 50 }),
  });

  async function refreshGoalQueries() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.goals() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.goals('active') }),
      queryClient.invalidateQueries({ queryKey: queryKeys.progressOverview }),
      queryClient.invalidateQueries({ queryKey: queryKeys.todayTasks }),
    ]);
  }

  const deleteMutation = useMutation({
    mutationFn: deleteGoal,
    onSuccess: async () => {
      setPendingDelete(null);
      showToast('Goal deleted', 'success');
      await refreshGoalQueries();
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  const activateMutation = useMutation({
    mutationFn: activateGoal,
    onSuccess: async () => {
      showToast('Goal activated', 'success');
      await refreshGoalQueries();
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  const goals = goalsQuery.data?.items ?? [];

  return (
    <Screen edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.lg,
          paddingBottom: spacing.xxl,
          gap: spacing.lg,
        }}
        refreshControl={
          <RefreshControl refreshing={goalsQuery.isRefetching} onRefresh={() => void goalsQuery.refetch()} />
        }
      >
        <ScreenHeading
          title="My Goals"
          subtitle="Plans you have started or approved"
          trailing={<IconButton icon={Home} label="Home" onPress={() => router.replace('/(tabs)')} />}
        />
        <Button label="Create a goal" icon={Plus} onPress={() => router.push('/goals/create')} />

        {goalsQuery.isLoading ? (
          <LoadingBlock rows={4} />
        ) : goalsQuery.isError ? (
          <Card>
            <AppText variant="body" tone="danger">
              {getErrorMessage(goalsQuery.error)}
            </AppText>
            <Button label="Retry" onPress={() => void goalsQuery.refetch()} />
          </Card>
        ) : goals.length === 0 ? (
          <Card>
            <EmptyState
              icon={Target}
              title="No goals yet"
              description="Start with a sentence about what you want to learn, build, or change."
              actionLabel="Create a goal"
              onAction={() => router.push('/goals/create')}
            />
          </Card>
        ) : (
          goals.map((goal) => {
            const status = statusStyle(goal.status, colors);
            const deleting = deleteMutation.isPending && deleteMutation.variables === goal.id;
            const activating = activateMutation.isPending && activateMutation.variables === goal.id;

            return (
              <Card key={goal.id} style={{ gap: 14, paddingBottom: 14 }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${goal.title}`}
                  onPress={() => router.push({ pathname: '/goals/[goalId]', params: { goalId: goal.id } })}
                  style={{ gap: 12 }}
                >
                  <View className="flex-row items-start justify-between" style={{ gap: 12 }}>
                    <View className="flex-1" style={{ gap: 8 }}>
                      <AppText variant="heading" numberOfLines={2}>
                        {goal.title}
                      </AppText>
                      <View className="flex-row flex-wrap items-center" style={{ gap: 8 }}>
                        <AppText variant="caption" tone="muted">
                          {goal.category}
                        </AppText>
                        <View
                          style={{
                            borderRadius: radius.full,
                            backgroundColor: status.bg,
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                          }}
                        >
                          <AppText variant="caption" style={{ color: status.fg }}>
                            {status.label}
                          </AppText>
                        </View>
                      </View>
                    </View>

                    <View
                      style={{
                        minWidth: 52,
                        height: 52,
                        borderRadius: radius.lg,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: `${colors.primary}18`,
                        paddingHorizontal: 8,
                      }}
                    >
                      <AppText variant="label" style={{ color: colors.primary }}>
                        {Math.round(goal.progressPercent)}%
                      </AppText>
                    </View>
                  </View>
                </Pressable>

                <View style={{ height: 1, backgroundColor: colors.border, opacity: 0.7 }} />

                <View className="flex-row items-center justify-between" style={{ gap: 10 }}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${goal.title}`}
                    onPress={() => router.push({ pathname: '/goals/[goalId]', params: { goalId: goal.id } })}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      opacity: pressed ? 0.7 : 1,
                      paddingVertical: 4,
                    })}
                  >
                    <AppText variant="caption" tone="muted">
                      View plan
                    </AppText>
                    <ChevronRight color={colors.iconMuted} size={16} strokeWidth={2.2} />
                  </Pressable>

                  <View className="flex-row items-center" style={{ gap: 8 }}>
                    {goal.status === 'archived' ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Activate ${goal.title}`}
                        disabled={activateMutation.isPending}
                        onPress={() => activateMutation.mutate(goal.id)}
                        style={({ pressed }) => ({
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                          minHeight: 36,
                          paddingHorizontal: 12,
                          borderRadius: radius.full,
                          backgroundColor: pressed || activating ? `${colors.primary}28` : `${colors.primary}14`,
                          borderWidth: 1,
                          borderColor: `${colors.primary}40`,
                          opacity: activating ? 0.6 : 1,
                        })}
                      >
                        <RotateCcw color={colors.primary} size={15} strokeWidth={2.2} />
                        <AppText variant="caption" style={{ color: colors.primary }}>
                          {activating ? 'Activating…' : 'Activate'}
                        </AppText>
                      </Pressable>
                    ) : null}

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Delete ${goal.title}`}
                      disabled={deleteMutation.isPending}
                      onPress={() => setPendingDelete({ id: goal.id, title: goal.title })}
                      style={({ pressed }) => ({
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        minHeight: 36,
                        paddingHorizontal: 12,
                        borderRadius: radius.full,
                        backgroundColor: pressed || deleting ? colors.errorSoft : `${colors.coral}14`,
                        borderWidth: 1,
                        borderColor: `${colors.coral}40`,
                        opacity: deleting ? 0.6 : 1,
                      })}
                    >
                      <Trash2 color={colors.coral} size={15} strokeWidth={2.2} />
                      <AppText variant="caption" style={{ color: colors.coral }}>
                        {deleting ? 'Deleting…' : 'Delete'}
                      </AppText>
                    </Pressable>
                  </View>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>

      <ConfirmDialog
        visible={Boolean(pendingDelete)}
        title="Delete goal?"
        message={
          pendingDelete
            ? `"${pendingDelete.title}" aur uske tasks/roadmap delete ho jayenge. Ye undo nahi hoga.`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            deleteMutation.mutate(pendingDelete.id);
          }
        }}
      />
    </Screen>
  );
}
