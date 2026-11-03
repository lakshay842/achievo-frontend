import type { LucideIcon } from 'lucide-react-native';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { radius, touchTarget } from '@/theme/spacing';

type IconButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  icon: LucideIcon;
  label: string;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({ icon: Icon, label, style, ...props }: IconButtonProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => [
        {
          width: touchTarget,
          height: touchTarget,
          borderRadius: radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: pressed ? colors.secondarySoft : colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
      {...props}
    >
      <Icon color={colors.text} size={20} strokeWidth={2} />
    </Pressable>
  );
}
