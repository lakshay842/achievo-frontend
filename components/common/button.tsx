import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/common/app-text';
import { useTheme } from '@/hooks/use-theme';
import { radius, touchTarget } from '@/theme/spacing';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: LucideIcon;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  variant = 'primary',
  loading = false,
  disabled,
  icon: Icon,
  style,
  ...props
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = Boolean(disabled || loading);
  const background = {
    primary: colors.primary,
    secondary: colors.card,
    ghost: 'transparent',
    danger: colors.error,
  }[variant];
  const pressedBackground = {
    primary: colors.primaryPressed,
    secondary: colors.secondarySoft,
    ghost: colors.secondarySoft,
    danger: colors.error,
  }[variant];
  const labelTone = variant === 'secondary' || variant === 'ghost' ? 'default' : 'inverse';
  const iconColor = labelTone === 'inverse' ? colors.onPrimary : colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        {
          minHeight: touchTarget,
          borderRadius: radius.md,
          paddingHorizontal: 18,
          backgroundColor: pressed && !isDisabled ? pressedBackground : background,
          borderWidth: variant === 'secondary' || variant === 'ghost' ? 1 : 0,
          borderColor: colors.border,
          opacity: isDisabled ? 0.55 : 1,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} />
      ) : (
        <>
          {Icon ? <Icon color={iconColor} size={18} strokeWidth={2.2} /> : null}
          <AppText variant="label" tone={labelTone}>
            {label}
          </AppText>
        </>
      )}
    </Pressable>
  );
}
