import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Bell, Plus, Sparkles } from 'lucide-react-native';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { AppText } from '@/components/common/app-text';
import { Button } from '@/components/common/button';
import { Card } from '@/components/common/card';
import { IconButton } from '@/components/common/icon-button';
import { LoadingBlock } from '@/components/common/loading-block';
import { Screen } from '@/components/common/screen';
import { ScreenHeading } from '@/components/common/screen-heading';
import { StatCard, StatGrid } from '@/components/common/stat-card';
import { queryKeys } from '@/constants/query-keys';
import { useTheme } from '@/hooks/use-theme';
import { getMotivation } from '@/services/api/coach.api';
import { listGoals } from '@/services/api/goals.api';
import { getProgressOverview } from '@/services/api/progress.api';
import { getTodayTasks } from '@/services/api/tasks.api';
import { useAuthStore } from '@/store/auth.store';
import { spacing } from '@/theme/spacing';
import { formatToday, greetingForHour } from '@/utils/date';
import { getErrorMessage } from '@/utils/errors';

export default function HomeScreen() {
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);

  const todayQuery = useQuery({
    queryKey: queryKeys.todayTasks,
    queryFn: getTodayTasks,
  });
  const progressQuery = useQuery({
    queryKey: queryKeys.progressOverview,
    queryFn: getProgressOverview,
  });
  const goalsQuery = useQuery({
    queryKey: queryKeys.goals('active'),
    queryFn: () => listGoals({ status: 'active', limit: 5 }),
  });
  const motivationQuery = useQuery({
    queryKey: queryKeys.motivation,
    queryFn: getMotivation,
  });

  const refreshing =
    todayQuery.isRefetching || progressQuery.isRefetching || goalsQuery.isRefetching || motivationQuery.isRefetching;

  async function refresh() {
    await Promise.all([
      todayQuery.refetch(),
      progressQuery.refetch(),
      goalsQuery.refetch(),
      motivationQuery.refetch(),
    ]);
  }

  const tasks = todayQuery.data?.tasks ?? [];
  const pending = tasks.filter((task) => task.status === 'pending' || task.status === 'in_progress');
  const completedToday = tasks.filter((task) => task.status === 'completed').length;
  const dailyPercent = tasks.length ? Math.round((completedToday / tasks.length) * 100) : 0;
  const activeGoals = goalsQuery.data?.items ?? [];
  const overview = progressQuery.data;

  return (
    <Screen edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.lg,
          paddingBottom: spacing.xxl,
          gap: spacing.lg,
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} />}
      >
        <ScreenHeading
          subtitle={formatToday()}
          title={`${greetingForHour()}${user?.name ? `, ${user.name.split(' ')[0]}` : ''}`}
          trailing={<IconButton icon={Bell} label="Notifications" onPress={() => router.push('/notifications')} />}
        />

        {progressQuery.isLoading || todayQuery.isLoading ? (
          <LoadingBlock rows={4} />
        ) : (
          <>
            <StatGrid>
              <StatCard label="Today" value={`${dailyPercent}%`} hint={`${completedToday}/${tasks.length} tasks`} />
              <StatCard
                label="Streak"
                value={`${overview?.currentStreak ?? 0}`}
                hint={`Best ${overview?.longestStreak ?? 0}`}
              />
              <StatCard
                label="Progress"
                value={`${Math.round(overview?.completionPercentage ?? 0)}%`}
                hint={`${overview?.activeGoals ?? 0} active goals`}
              />
            </StatGrid>

            <Card>
              <View className="flex-row items-center justify-between">
                <AppText variant="label">Today's tasks</AppText>
                <AppText variant="caption" tone="muted">
                  {pending.length} pending
                </AppText>
              </View>
              {tasks.length === 0 ? (
                <AppText variant="body" tone="muted">
                  No tasks for today yet. Create a goal and approve a roadmap to get started.
                </AppText>
              ) : (
                tasks.slice(0, 5).map((task) => (
                  <Pressable
                    key={task.id}
                    accessibilityRole="button"
                    onPress={() => router.push({ pathname: '/tasks/[taskId]', params: { taskId: task.id } })}
                    style={{
                      minHeight: 48,
                      borderTopWidth: 1,
                      borderTopColor: colors.border,
                      paddingVertical: 12,
                      gap: 4,
                    }}
                  >
                    <AppText variant="label">{task.title}</AppText>
                    <AppText variant="caption" tone="muted">
                      {task.durationMinutes} min · {task.priority} · {task.status.replace('_', ' ')}
                    </AppText>
                  </Pressable>
                ))
              )}
            </Card>

            <Card>
              <AppText variant="label">Active goals</AppText>
              {activeGoals.length === 0 ? (
                <AppText variant="body" tone="muted">
                  You do not have an active goal yet.
                </AppText>
              ) : (
                activeGoals.map((goal) => (
                  <Pressable
                    key={goal.id}
                    accessibilityRole="button"
                    onPress={() => router.push({ pathname: '/goals/[goalId]', params: { goalId: goal.id } })}
                    style={{
                      minHeight: 48,
                      borderTopWidth: 1,
                      borderTopColor: colors.border,
                      paddingVertical: 12,
                      gap: 4,
                    }}
                  >
                    <AppText variant="label">{goal.title}</AppText>
                    <AppText variant="caption" tone="muted">
                      {Math.round(goal.progressPercent)}% · {goal.category}
                    </AppText>
                  </Pressable>
                ))
              )}
            </Card>

            <Card>
              <View className="flex-row items-center" style={{ gap: 8 }}>
                <Sparkles size={18} color={colors.primary} strokeWidth={2} />
                <AppText variant="label">Coach note</AppText>
              </View>
              <AppText variant="body" tone="muted">
                {motivationQuery.data?.message ??
                  (motivationQuery.isError
                    ? getErrorMessage(motivationQuery.error)
                    : 'Your coach will leave a note once you have work in motion.')}
              </AppText>
            </Card>

            <Button label="Create a goal" icon={Plus} onPress={() => router.push('/goals/create')} />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
