import { forwardRef } from 'react';
import { TextInput, View, type TextInputInstance, type TextInputProps } from 'react-native';

import { AppText } from '@/components/common/app-text';
import { useTheme } from '@/hooks/use-theme';
import { fontFamily } from '@/theme/typography';
import { radius } from '@/theme/spacing';

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
};

export const TextField = forwardRef<TextInputInstance, TextFieldProps>(function TextField(
  { label, error, style, ...props },
  ref,
) {
  const { colors, fontsReady } = useTheme();

  return (
    <View style={{ gap: 8 }}>
      <AppText variant="label">{label}</AppText>
      <TextInput
        ref={ref}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={label}
        style={[
          {
            minHeight: props.multiline ? 120 : 48,
            borderWidth: 1,
            borderColor: error ? colors.error : colors.border,
            backgroundColor: colors.card,
            borderRadius: radius.md,
            paddingHorizontal: 14,
            paddingVertical: 12,
            color: colors.text,
            fontSize: 16,
            textAlignVertical: props.multiline ? 'top' : 'center',
            ...(fontsReady ? { fontFamily: fontFamily.regular } : {}),
          },
          style,
        ]}
        {...props}
      />
      {error ? (
        <AppText variant="caption" tone="danger">
          {error}
        </AppText>
      ) : null}
    </View>
  );
});
