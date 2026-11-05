import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from '@/components/common/app-text';
import { useTheme } from '@/hooks/use-theme';
import { radius } from '@/theme/spacing';

function Dot({ delayMs, color }: { delayMs: number; color: string }) {
  const bounce = useSharedValue(0);

  useEffect(() => {
    bounce.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 280, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 280, easing: Easing.in(Easing.quad) }),
        ),
        -1,
        false,
      ),
    );
  }, [bounce, delayMs]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.35 + bounce.value * 0.65,
    transform: [{ translateY: -bounce.value * 4 }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: 7,
          height: 7,
          borderRadius: 999,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

export function TypingDots() {
  const { colors } = useTheme();

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel="Coach is typing"
      style={{
        alignSelf: 'flex-start',
        maxWidth: '88%',
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: radius.lg,
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 8,
      }}
    >
      <AppText variant="caption" tone="muted">
        Coach is writing
      </AppText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 14 }}>
        <Dot delayMs={0} color={colors.primary} />
        <Dot delayMs={140} color={colors.primary} />
        <Dot delayMs={280} color={colors.primary} />
      </View>
    </View>
  );
}
