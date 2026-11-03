import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { cardShadow } from '@/theme/shadows';
import { radius } from '@/theme/spacing';

type CardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, style }: CardProps) {
  const { colors, scheme } = useTheme();

  return (
    <View
      className="gap-3 p-5"
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: radius.xl,
          borderWidth: scheme === 'dark' ? 0 : 1,
          borderColor: colors.border,
        },
        cardShadow(scheme),
        style,
      ]}
    >
      {children}
    </View>
  );
}
