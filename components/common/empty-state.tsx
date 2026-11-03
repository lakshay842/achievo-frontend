import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/common/app-text';
import { Button } from '@/components/common/button';
import { useTheme } from '@/hooks/use-theme';
import { radius } from '@/theme/spacing';

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  footer?: ReactNode;
};

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction, footer }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View className="items-center px-2 py-6" style={{ gap: 12 }}>
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: radius.lg,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.secondarySoft,
        }}
      >
        <Icon color={colors.primary} size={24} strokeWidth={2} />
      </View>
      <AppText variant="heading" style={{ textAlign: 'center' }}>
        {title}
      </AppText>
      <AppText variant="body" tone="muted" style={{ textAlign: 'center' }}>
        {description}
      </AppText>
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} style={{ alignSelf: 'stretch' }} /> : null}
      {footer}
    </View>
  );
}
