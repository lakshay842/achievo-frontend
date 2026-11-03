import type { ReactNode } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/common/app-text';
import { Card } from '@/components/common/card';

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
};

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <Card style={{ flex: 1, minWidth: 140 }}>
      <AppText variant="caption" tone="muted">
        {label}
      </AppText>
      <AppText variant="heading">{value}</AppText>
      {hint ? (
        <AppText variant="caption" tone="muted">
          {hint}
        </AppText>
      ) : null}
    </Card>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return (
    <View className="flex-row flex-wrap" style={{ gap: 12 }}>
      {children}
    </View>
  );
}
