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
  const { colors, scheme } = useTheme();
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
    danger: colors.errorSoft,
  }[variant];
  const labelColor =
    variant === 'primary' ? colors.onPrimary : variant === 'danger' ? '#FFFFFF' : colors.text;
  const borderColor = {
    primary: colors.buttonBorder,
    secondary: colors.inputBorder,
    ghost: colors.inputBorder,
    danger: colors.error,
  }[variant];
  const showBorder = variant !== 'primary' || scheme === 'dark';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        {
          width: '100%',
          alignSelf: 'stretch',
          minHeight: touchTarget,
          borderRadius: radius.md,
          paddingHorizontal: 18,
          paddingVertical: 12,
          backgroundColor: pressed && !isDisabled ? pressedBackground : background,
          borderWidth: showBorder ? 1.5 : 0,
          borderColor,
          opacity: isDisabled ? 0.55 : 1,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
          overflow: 'hidden',
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={labelColor} />
      ) : (
        <>
          {Icon ? <Icon color={labelColor} size={18} strokeWidth={2.2} /> : null}
          <AppText variant="label" style={{ color: labelColor, fontWeight: '600' }}>
            {label}
          </AppText>
        </>
      )}
    </Pressable>
  );
}
