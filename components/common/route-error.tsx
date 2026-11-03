import type { ErrorBoundaryProps } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { palette } from '@/theme/colors';

export function RouteError({ error, retry }: ErrorBoundaryProps) {
  const colors = palette.light;
  const offline = /network|offline|internet|connection/i.test(error.message);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        gap: 16,
        backgroundColor: colors.background,
      }}
    >
      <Text style={{ fontSize: 28, lineHeight: 34, textAlign: 'center', color: colors.text, fontWeight: '600' }}>
        {offline ? 'You are offline' : 'Something went wrong'}
      </Text>
      <Text style={{ fontSize: 16, lineHeight: 24, textAlign: 'center', color: colors.textMuted }}>
        {offline ? 'Check your connection and try again.' : error.message}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => void retry()}
        style={{
          minHeight: 48,
          paddingHorizontal: 20,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.primary,
        }}
      >
        <Text style={{ color: colors.onPrimary, fontSize: 16, fontWeight: '600' }}>Try again</Text>
      </Pressable>
    </View>
  );
}
