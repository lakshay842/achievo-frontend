import { View } from 'react-native';

import { AppText } from '@/components/common/app-text';
import { useTheme } from '@/hooks/use-theme';
import { radius } from '@/theme/spacing';

type InlineNoticeProps = {
  title: string;
  message: string;
  tone?: 'info' | 'success' | 'warning';
};

export function InlineNotice({ title, message, tone = 'info' }: InlineNoticeProps) {
  const { colors } = useTheme();
  const background = tone === 'success' ? colors.successSoft : tone === 'warning' ? colors.warningSoft : colors.notice;
  const accent = tone === 'success' ? colors.success : tone === 'warning' ? colors.warning : colors.primary;

  return (
    <View
      accessibilityRole="text"
      style={{
        backgroundColor: background,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 16,
        gap: 4,
      }}
    >
      <AppText variant="label" style={{ color: accent }}>
        {title}
      </AppText>
      <AppText variant="caption" tone="muted">
        {message}
      </AppText>
    </View>
  );
}
