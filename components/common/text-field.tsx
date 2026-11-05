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
};

export const TextField = forwardRef<TextInputInstance, TextFieldProps>(function TextField(
  { label, error, style, secureTextEntry, ...props },
  ref,
) {
  const { colors, fontsReady } = useTheme();
  const [visible, setVisible] = useState(false);
  const isPassword = secureTextEntry === true;
  const hideSecret = isPassword && !visible;

  return (
    <View style={{ gap: 8 }}>
      <AppText variant="label">{label}</AppText>
      <View style={{ position: 'relative', justifyContent: 'center' }}>
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={label}
          secureTextEntry={hideSecret}
          style={[
            {
              minHeight: props.multiline ? 120 : 48,
              borderWidth: 1,
              borderColor: error ? colors.error : colors.border,
              backgroundColor: colors.card,
              borderRadius: radius.md,
              paddingHorizontal: 14,
              paddingVertical: 12,
              paddingRight: isPassword ? 48 : 14,
              color: colors.text,
              fontSize: 16,
              textAlignVertical: props.multiline ? 'top' : 'center',
              ...(fontsReady ? { fontFamily: fontFamily.regular } : {}),
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
