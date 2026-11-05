import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Home } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { AppText } from '@/components/common/app-text';
import { Card } from '@/components/common/card';
import { IconButton } from '@/components/common/icon-button';
import { LoadingBlock } from '@/components/common/loading-block';
import { Screen } from '@/components/common/screen';
import { queryKeys } from '@/constants/query-keys';
import { useTheme } from '@/hooks/use-theme';
import {
  getMonthlyProgress,
  getProgressOverview,
  getStreaks,
  getWeeklyProgress,
} from '@/services/api/progress.api';
import { radius, spacing } from '@/theme/spacing';
import { getErrorMessage } from '@/utils/errors';

type Period = 'D' | 'W' | 'M';
type Focus = 'overview' | 'streaks' | 'tasks';

const PERIODS: Array<{ id: Period; label: string; meaning: string }> = [
  { id: 'D', label: 'D', meaning: 'Today' },
  { id: 'W', label: 'W', meaning: 'This week' },
  { id: 'M', label: 'M', meaning: 'This month' },
];

const FOCUS_TABS: Array<{ id: Focus; label: string; meaning: string }> = [
  { id: 'overview', label: 'Overview', meaning: 'Overall completion' },
  { id: 'streaks', label: 'Streaks', meaning: 'Consistency' },
  { id: 'tasks', label: 'Tasks', meaning: 'Done vs missed' },
];

function dayLetter(date: string) {
  return new Intl.DateTimeFormat(undefined, { weekday: 'narrow' }).format(new Date(`${date}T12:00:00`));
}

function WeekBars({
  days,
  barColor,
  trackColor,
  inkColor,
}: {
  days: Array<{ date: string; completedTasks: number; scheduledTasks: number }>;
  barColor: string;
  trackColor: string;
  inkColor: string;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, height: 96 }}>
      {days.map((day) => {
        const ratio = day.scheduledTasks > 0 ? Math.min(1, day.completedTasks / day.scheduledTasks) : 0;
        const height = Math.max(10, Math.round(ratio * 72));
        return (
          <View key={day.date} style={{ flex: 1, alignItems: 'center', gap: 8 }}>
            <View
              style={{
                width: '100%',
                maxWidth: 28,
                height: 76,
                borderRadius: radius.full,
                backgroundColor: trackColor,
                justifyContent: 'flex-end',
                overflow: 'hidden',
              }}
            >
              <View style={{ height, borderRadius: radius.full, backgroundColor: barColor }} />
            </View>
            <AppText variant="caption" style={{ color: inkColor, opacity: 0.75 }}>
              {dayLetter(day.date)}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

function MetricRing({
  values,
  colors,
}: {
  values: [number, number, number];
  colors: [string, string, string];
}) {
  const sizes = [118, 88, 58];
  const strokes = [10, 10, 10];
  return (
    <View style={{ width: 118, height: 118, alignItems: 'center', justifyContent: 'center' }}>
      {sizes.map((size, index) => {
        const progress = Math.max(0.08, Math.min(1, values[index] / 100));
        return (
          <View
            key={size}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokes[index],
              borderColor: `${colors[index]}33`,
            }}
          >
            <View
              style={{
                position: 'absolute',
                top: -strokes[index],
                left: -strokes[index],
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: strokes[index],
                borderColor: 'transparent',
                borderTopColor: colors[index],
                borderRightColor: progress > 0.25 ? colors[index] : 'transparent',
                borderBottomColor: progress > 0.5 ? colors[index] : 'transparent',
                borderLeftColor: progress > 0.75 ? colors[index] : 'transparent',
                transform: [{ rotate: '-90deg' }],
              }}
            />
          </View>
        );
      })}
    </View>
  );
}

export default function ProgressScreen() {
  const { colors } = useTheme();
  const [period, setPeriod] = useState<Period>('W');
  const [focus, setFocus] = useState<Focus>('overview');

  const overviewQuery = useQuery({ queryKey: queryKeys.progressOverview, queryFn: getProgressOverview });
  const weeklyQuery = useQuery({ queryKey: queryKeys.progressWeekly, queryFn: getWeeklyProgress });
  const monthlyQuery = useQuery({ queryKey: queryKeys.progressMonthly, queryFn: getMonthlyProgress });
  const streaksQuery = useQuery({ queryKey: queryKeys.streaks, queryFn: getStreaks });

  const loading = overviewQuery.isLoading || weeklyQuery.isLoading || monthlyQuery.isLoading;
  const overview = overviewQuery.data;
  const weekly = weeklyQuery.data;
  const monthly = monthlyQuery.data;
  const streaks = streaksQuery.data;

  const activeRange = period === 'M' ? monthly : weekly;
  const completion = Math.round(
    period === 'D'
      ? overview?.completionPercentage ?? 0
      : activeRange?.completionPercentage ?? overview?.completionPercentage ?? 0,
  );
  const completed =
    period === 'D'
      ? overview?.completedTasks ?? 0
      : activeRange?.completedTasks ?? overview?.completedTasks ?? 0;
  const missed = overview?.missedTasks ?? 0;
  const scheduled =
    period === 'D'
      ? (overview?.completedTasks ?? 0) + (overview?.pendingTasks ?? 0) + (overview?.missedTasks ?? 0)
      : activeRange?.scheduledTasks ?? 0;

  const weekDays = useMemo(() => {
    const days = weekly?.days ?? [];
    if (days.length >= 7) return days.slice(0, 7);
    return days;
  }, [weekly?.days]);

  const periodMeaning = PERIODS.find((item) => item.id === period)?.meaning ?? 'This week';

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
          <RefreshControl
            refreshing={overviewQuery.isRefetching}
            tintColor={colors.primary}
            onRefresh={() => {
              void overviewQuery.refetch();
              void weeklyQuery.refetch();
              void monthlyQuery.refetch();
              void streaksQuery.refetch();
            }}
          />
        }
      >
        <View className="flex-row items-start justify-between" style={{ gap: 12 }}>
          <View className="flex-1" style={{ gap: 6 }}>
            <AppText variant="title">Stats</AppText>
            <AppText variant="body" tone="muted">
              Clear view of your streaks, completed work, and weekly rhythm
            </AppText>
          </View>
          <IconButton icon={Home} label="Home" onPress={() => router.replace('/(tabs)')} />
        </View>

        {/* Time range — what period are we looking at? */}
        <View style={{ gap: 10 }}>
          <AppText variant="kicker" tone="muted">
            Time range
          </AppText>
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: colors.card,
              borderRadius: radius.full,
              padding: 6,
              borderWidth: 1,
              borderColor: colors.border,
              gap: 4,
            }}
          >
            {PERIODS.map((item) => {
              const active = period === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setPeriod(item.id)}
                  style={{
                    flex: 1,
                    minHeight: 44,
                    borderRadius: radius.full,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: active ? colors.primary : 'transparent',
                  }}
                >
                  <AppText variant="label" style={{ color: active ? colors.onPrimary : colors.text }}>
                    {item.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          <AppText variant="caption" tone="muted">
            Showing: {periodMeaning}
          </AppText>
        </View>

        {/* Focus chips — which story are we reading? */}
        <View style={{ gap: 10 }}>
          <AppText variant="kicker" tone="muted">
            Focus
          </AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {FOCUS_TABS.map((tab) => {
              const active = focus === tab.id;
              const bg = active
                ? tab.id === 'overview'
                  ? colors.lavender
                  : tab.id === 'streaks'
                    ? colors.primary
                    : colors.coral
                : 'transparent';
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setFocus(tab.id)}
                  style={{
                    borderRadius: radius.full,
                    borderWidth: 1,
                    borderColor: active ? bg : colors.border,
                    backgroundColor: active ? bg : colors.card,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                  }}
                >
                  <AppText variant="label" style={{ color: active ? colors.onPrimary : colors.text }}>
                    {tab.label}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>
          <AppText variant="caption" tone="muted">
            {FOCUS_TABS.find((tab) => tab.id === focus)?.meaning}
          </AppText>
        </View>

        {loading ? (
          <LoadingBlock rows={5} />
        ) : overviewQuery.isError ? (
          <Card>
            <AppText tone="danger">{getErrorMessage(overviewQuery.error)}</AppText>
          </Card>
        ) : (
          <>
            {(focus === 'overview' || focus === 'tasks') && (
              <View style={{ gap: 10 }}>
                <AppText variant="kicker" tone="muted">
                  Completion
                </AppText>
                <AppText variant="caption" tone="muted">
                  Overall progress for {periodMeaning.toLowerCase()}
                </AppText>
                <View
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: radius.xl,
                    padding: 20,
                    gap: 18,
                  }}
                >
                  <View style={{ gap: 4 }}>
                    <AppText variant="label" style={{ color: colors.onPrimary, opacity: 0.8 }}>
                      Total activities
                    </AppText>
                    <AppText variant="display" style={{ color: colors.onPrimary }}>
                      {completion}%
                    </AppText>
                    <AppText variant="caption" style={{ color: colors.onPrimary, opacity: 0.75 }}>
                      {completed} done · {scheduled} scheduled
                    </AppText>
                  </View>
                  {period !== 'D' && weekDays.length > 0 ? (
                    <WeekBars
                      days={weekDays}
                      barColor={colors.onPrimary}
                      trackColor="rgba(0,0,0,0.18)"
                      inkColor={colors.onPrimary}
                    />
                  ) : null}
                </View>
              </View>
            )}

            {(focus === 'overview' || focus === 'tasks') && (
              <View style={{ gap: 10 }}>
                <AppText variant="kicker" tone="muted">
                  Task summary
                </AppText>
                <AppText variant="caption" tone="muted">
                  Done vs missed — yeh dikhata hai aapne kitne tasks complete/skip kiye
                </AppText>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: colors.card,
                      borderRadius: radius.xl,
                      borderWidth: 1,
                      borderColor: colors.border,
                      padding: 18,
                      gap: 10,
                      minHeight: 120,
                    }}
                  >
                    <AppText variant="caption" tone="muted">
                      Habits done
                    </AppText>
                    <AppText variant="title" style={{ color: colors.primary }}>
                      {completed}
                    </AppText>
                    <AppText variant="caption" tone="muted">
                      Completed tasks
                    </AppText>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: colors.card,
                      borderRadius: radius.xl,
                      borderWidth: 1,
                      borderColor: colors.border,
                      padding: 18,
                      gap: 10,
                      minHeight: 120,
                    }}
                  >
                    <AppText variant="caption" tone="muted">
                      Habits skipped
                    </AppText>
                    <AppText variant="title" style={{ color: colors.coral }}>
                      {missed}
                    </AppText>
                    <AppText variant="caption" tone="muted">
                      Missed tasks
                    </AppText>
                  </View>
                </View>
              </View>
            )}

            {(focus === 'overview' || focus === 'streaks') && (
              <View style={{ gap: 10 }}>
                <AppText variant="kicker" tone="muted">
                  Consistency
                </AppText>
                <AppText variant="caption" tone="muted">
                  Streak + completion + time — aap kitne consistent ho
                </AppText>
                <Card>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
                    <View style={{ flex: 1, gap: 14 }}>
                      <View style={{ gap: 2 }}>
                        <AppText variant="caption" style={{ color: colors.primary }}>
                          Current streak
                        </AppText>
                        <AppText variant="heading">{streaks?.currentStreak ?? overview?.currentStreak ?? 0} days</AppText>
                      </View>
                      <View style={{ gap: 2 }}>
                        <AppText variant="caption" style={{ color: colors.lavender }}>
                          Completion
                        </AppText>
                        <AppText variant="heading">{completion}%</AppText>
                      </View>
                      <View style={{ gap: 2 }}>
                        <AppText variant="caption" style={{ color: colors.coral }}>
                          Time invested
                        </AppText>
                        <AppText variant="heading">
                          {Math.round((overview?.timeInvestedMinutes ?? 0) / 60)}h
                        </AppText>
                      </View>
                    </View>
                    <MetricRing
                      values={[
                        Math.min(100, (streaks?.currentStreak ?? 0) * 10),
                        completion,
                        Math.min(100, Math.round((overview?.timeInvestedMinutes ?? 0) / 6)),
                      ]}
                      colors={[colors.primary, colors.lavender, colors.coral]}
                    />
                  </View>
                </Card>
              </View>
            )}

            {focus === 'streaks' && (
              <View style={{ gap: 10 }}>
                <AppText variant="kicker" tone="muted">
                  Streak record
                </AppText>
                <AppText variant="caption" tone="muted">
                  Longest streak — aapka best consistency record
                </AppText>
                <Card>
                  <AppText variant="label">Longest streak</AppText>
                  <AppText variant="display" tone="primary">
                    {streaks?.longestStreak ?? overview?.longestStreak ?? 0}
                  </AppText>
                  <AppText variant="caption" tone="muted">
                    Last active: {streaks?.lastActiveDate ?? overview?.lastActiveDate ?? '—'}
                  </AppText>
                </Card>
              </View>
            )}

            {focus === 'overview' && (
              <View style={{ gap: 10 }}>
                <AppText variant="kicker" tone="muted">
                  Goals pulse
                </AppText>
                <AppText variant="caption" tone="muted">
                  Progress by goal — see which ones are ahead
                </AppText>
                <Card>
                  {(overview?.goals ?? []).length === 0 ? (
                    <AppText tone="muted">No active goals yet. Create one to see progress here.</AppText>
                  ) : (
                    <View style={{ gap: 14 }}>
                      {(overview?.goals ?? []).slice(0, 4).map((goal, index) => {
                        const tint = [colors.primary, colors.lavender, colors.coral][index % 3]!;
                        return (
                          <View key={goal.id} style={{ gap: 8 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                              <AppText variant="label" style={{ flex: 1 }} numberOfLines={1}>
                                {goal.title}
                              </AppText>
                              <AppText variant="label" style={{ color: tint }}>
                                {Math.round(goal.progressPercent)}%
                              </AppText>
                            </View>
                            <View
                              style={{
                                height: 10,
                                borderRadius: radius.full,
                                backgroundColor: colors.border,
                                overflow: 'hidden',
                              }}
                            >
                              <View
                                style={{
                                  width: `${Math.max(4, Math.round(goal.progressPercent))}%`,
                                  height: '100%',
                                  backgroundColor: tint,
                                  borderRadius: radius.full,
                                }}
                              />
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </Card>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
