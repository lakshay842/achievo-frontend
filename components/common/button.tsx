import { LinearGradient } from 'expo-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, Pressable, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/common/app-text';
import { BRAND } from '@/constants/brand';
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

const CONTENT = {
  minHeight: touchTarget + 4,
  paddingHorizontal: 20,
  paddingVertical: 14,
  borderRadius: radius.full,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  flexDirection: 'row' as const,
  gap: 8,
  width: '100%' as const,
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

  const labelColor =
    variant === 'primary'
      ? BRAND.markInk
      : variant === 'danger'
        ? '#FFFFFF'
        : variant === 'secondary' && scheme === 'dark'
          ? colors.primaryText
          : colors.text;

  const outlineBg = scheme === 'dark' ? '#1F1F1F' : colors.card;
  const outlineBorder =
    variant === 'secondary'
      ? scheme === 'dark'
        ? colors.primary
        : colors.inputBorder
      : scheme === 'dark'
        ? '#6A6A6A'
        : colors.inputBorder;

  function renderLabel() {
    if (loading) {
      return <ActivityIndicator color={labelColor} />;
    }

    return (
      <>
        {Icon ? <Icon color={labelColor} size={18} strokeWidth={2.4} /> : null}
        <AppText variant="label" style={{ color: labelColor, fontWeight: '700' }}>
          {label}
        </AppText>
      </>
    );
  }

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
          opacity: isDisabled ? 0.55 : pressed ? 0.88 : 1,
          transform: [{ scale: pressed && !isDisabled ? 0.985 : 1 }],
        },
        style,
      ]}
      {...props}
    >
      {variant === 'primary' ? (
        <LinearGradient
          colors={[...BRAND.gradient]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[
            CONTENT,
            {
              // Match website: bright lime pill, no thin border washing out the fill.
              borderWidth: 0,
              elevation: 4,
              shadowColor: BRAND.gradient[0],
              shadowOpacity: scheme === 'dark' ? 0.55 : 0.28,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
            },
          ]}
        >
          {renderLabel()}
        </LinearGradient>
      ) : variant === 'danger' ? (
        <View
          style={[
            CONTENT,
            {
              backgroundColor: colors.error,
              borderWidth: 0,
              elevation: 3,
              shadowColor: colors.error,
              shadowOpacity: 0.35,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 3 },
            },
          ]}
        >
          {renderLabel()}
        </View>
      ) : (
        <View
          style={[
            CONTENT,
            {
              backgroundColor: outlineBg,
              borderWidth: 2,
              borderColor: outlineBorder,
              elevation: 1,
            },
          ]}
        >
          {renderLabel()}
        </View>
      )}
    </Pressable>
  );
}
