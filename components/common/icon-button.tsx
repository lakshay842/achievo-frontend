import type { LucideIcon } from 'lucide-react-native';
import { Pressable, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { radius, touchTarget } from '@/theme/spacing';

type IconButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  icon: LucideIcon;
  label: string;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({ icon: Icon, label, style, ...props }: IconButtonProps) {
  const { colors, scheme } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }, style]}
      {...props}
    >
      {({ pressed }) => (
        <View
          style={{
            width: touchTarget,
            height: touchTarget,
            borderRadius: radius.md,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: pressed
              ? scheme === 'dark'
                ? '#333333'
                : colors.secondarySoft
              : scheme === 'dark'
                ? '#242424'
                : colors.card,
            borderWidth: 2,
            borderColor: colors.inputBorder,
            elevation: 2,
          }}
        >
          <Icon color={colors.text} size={20} strokeWidth={2.2} />
        </View>
      )}
    </Pressable>
  );
}
