import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react-native';
import { RefreshControl, ScrollView, View } from 'react-native';

import { AppText } from '@/components/common/app-text';
import { Card } from '@/components/common/card';
import { EmptyState } from '@/components/common/empty-state';
import { LoadingBlock } from '@/components/common/loading-block';
import { Screen } from '@/components/common/screen';
import { FlowNavBar } from '@/components/navigation/header-nav';
import { queryKeys } from '@/constants/query-keys';
import { useTheme } from '@/hooks/use-theme';
import { listNotifications } from '@/services/api/notifications.api';
import { spacing } from '@/theme/spacing';
import { getErrorMessage } from '@/utils/errors';

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => listNotifications({ limit: 50 }),
  });

  const items = notificationsQuery.data?.items ?? [];

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']}>
      <View
        style={{
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.sm,
          paddingBottom: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.background,
        }}
      >
        <FlowNavBar />
      </View>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.lg,
          paddingBottom: spacing.xxl,
          gap: spacing.md,
        }}
        refreshControl={
          <RefreshControl
            refreshing={notificationsQuery.isRefetching}
            onRefresh={() => void notificationsQuery.refetch()}
          />
        }
      >
        {notificationsQuery.isLoading ? (
          <LoadingBlock rows={4} />
        ) : notificationsQuery.isError ? (
          <Card>
            <AppText tone="danger">{getErrorMessage(notificationsQuery.error)}</AppText>
          </Card>
        ) : items.length === 0 ? (
          <Card>
            <EmptyState
              icon={Bell}
              title="No reminders yet"
              description="Daily plans, tasks, milestones, and deadlines will show up here."
            />
          </Card>
        ) : (
          items.map((item) => (
            <Card key={item.id}>
              <View className="flex-row items-center justify-between" style={{ gap: 8 }}>
                <AppText variant="label">{item.title}</AppText>
                <AppText variant="caption" tone="muted">
                  {item.status}
                </AppText>
              </View>
              <AppText variant="body" tone="muted">
                {item.body}
              </AppText>
              <AppText variant="caption" style={{ color: colors.textMuted }}>
                {new Date(item.scheduledFor).toLocaleString()}
              </AppText>
            </Card>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}
