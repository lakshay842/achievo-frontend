import type { ReactNode } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/common/app-text';

type ScreenHeadingProps = {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
};

export function ScreenHeading({ title, subtitle, trailing }: ScreenHeadingProps) {
  return (
    <View className="flex-row items-end justify-between" style={{ gap: 12 }}>
      <View className="flex-1" style={{ gap: 4 }}>
        {subtitle ? <AppText variant="caption" tone="muted">{subtitle}</AppText> : null}
        <AppText variant="title">{title}</AppText>
      </View>
      {trailing}
    </View>
  );
}
