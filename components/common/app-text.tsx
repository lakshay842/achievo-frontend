import { Text, type TextProps, type TextStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { fontFamily, type FontWeight } from '@/theme/typography';

type Variant = 'display' | 'title' | 'heading' | 'body' | 'label' | 'caption' | 'kicker';
type Tone = 'default' | 'muted' | 'primary' | 'inverse' | 'danger' | 'success';

const variants: Record<
  Variant,
  { size: number; lineHeight: number; weight: FontWeight; letterSpacing: number; uppercase?: boolean }
> = {
  display: { size: 40, lineHeight: 48, weight: 'bold', letterSpacing: -0.8 },
  title: { size: 30, lineHeight: 36, weight: 'semibold', letterSpacing: -0.4 },
  heading: { size: 20, lineHeight: 28, weight: 'semibold', letterSpacing: -0.2 },
  body: { size: 16, lineHeight: 24, weight: 'regular', letterSpacing: 0 },
  label: { size: 15, lineHeight: 20, weight: 'medium', letterSpacing: 0 },
  caption: { size: 13, lineHeight: 18, weight: 'regular', letterSpacing: 0.1 },
  kicker: { size: 12, lineHeight: 16, weight: 'semibold', letterSpacing: 1.1, uppercase: true },
};

type AppTextProps = TextProps & {
  variant?: Variant;
  tone?: Tone;
};

export function AppText({ variant = 'body', tone = 'default', style, ...props }: AppTextProps) {
  const { colors, fontsReady } = useTheme();
  const config = variants[variant];
  const color = {
    default: colors.text,
    muted: colors.textMuted,
    primary: colors.primaryText,
    inverse: colors.onPrimary,
    danger: colors.error,
    success: colors.success,
  }[tone];

  const textStyle: TextStyle = {
    color,
    fontSize: config.size,
    lineHeight: config.lineHeight,
    letterSpacing: config.letterSpacing,
    textTransform: config.uppercase ? 'uppercase' : 'none',
    ...(fontsReady ? { fontFamily: fontFamily[config.weight] } : {}),
  };

  return (
    <Text
      maxFontSizeMultiplier={variant === 'display' || variant === 'title' ? 1.35 : 1.6}
      style={[textStyle, style]}
      {...props}
    />
  );
}
