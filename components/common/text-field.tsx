import { Eye, EyeOff } from 'lucide-react-native';
import { forwardRef, useState } from 'react';
import { Pressable, TextInput, View, type TextInputInstance, type TextInputProps } from 'react-native';

import { AppText } from '@/components/common/app-text';
import { useTheme } from '@/hooks/use-theme';
import { fontFamily } from '@/theme/typography';
import { radius } from '@/theme/spacing';

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  /** Compact single-line composer for chat bars. */
  compact?: boolean;
};

export const TextField = forwardRef<TextInputInstance, TextFieldProps>(function TextField(
  {
    label,
    error,
    style,
    secureTextEntry,
    compact = false,
    multiline,
    onFocus,
    onBlur,
    ...props
  },
  ref,
) {
  const { colors, fontsReady, scheme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const isPassword = secureTextEntry === true;
  const hideSecret = isPassword && !visible;
  const borderColor = error ? colors.error : focused ? colors.primary : colors.inputBorder;

  return (
    <View style={{ gap: compact ? 0 : 8, flex: compact ? 1 : undefined, minWidth: 0 }}>
      {compact ? null : <AppText variant="label">{label}</AppText>}
      <View style={{ position: 'relative', justifyContent: 'center', width: '100%' }}>
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={label}
          secureTextEntry={hideSecret}
          multiline={multiline}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[
            {
              minHeight: compact ? 44 : multiline ? 120 : 48,
              maxHeight: compact && multiline ? 120 : undefined,
              borderWidth: 1.5,
              borderColor,
              backgroundColor: colors.card,
              borderRadius: compact ? radius.full : radius.md,
              paddingHorizontal: compact ? 16 : 14,
              paddingVertical: compact ? 10 : 12,
              paddingRight: isPassword ? 48 : compact ? 16 : 14,
              color: colors.text,
              fontSize: 16,
              textAlignVertical: multiline ? 'top' : 'center',
              ...(fontsReady ? { fontFamily: fontFamily.regular } : {}),
              ...(scheme === 'dark'
                ? {
                    shadowColor: '#000',
                    shadowOpacity: 0.35,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 2,
                  }
                : {}),
            },
            style,
          ]}
          {...props}
        />
        {isPassword ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Hide password' : 'Show password'}
            hitSlop={8}
            onPress={() => setVisible((current) => !current)}
            style={{
              position: 'absolute',
              right: 6,
              top: 0,
              bottom: 0,
              width: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {visible ? (
              <EyeOff color={colors.textMuted} size={20} strokeWidth={2} />
            ) : (
              <Eye color={colors.textMuted} size={20} strokeWidth={2} />
            )}
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <AppText
          variant="caption"
          tone="danger"
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
          style={{ marginTop: 2 }}
        >
          {error}
        </AppText>
      ) : null}
    </View>
  );
});
