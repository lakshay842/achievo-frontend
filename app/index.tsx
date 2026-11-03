import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/common/app-text';
import { BrandMark } from '@/components/common/brand-mark';
import { BRAND, SPLASH_BACKGROUND } from '@/constants/brand';
import { useAuthStore } from '@/store/auth.store';

const MINIMUM_VISIBLE_MS = 1100;

export default function SplashRoute() {
  const status = useAuthStore((state) => state.status);
  const bootstrapped = useAuthStore((state) => state.bootstrapped);
  const onboardingComplete = useAuthStore((state) => state.onboardingComplete);
  const navigated = useRef(false);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.94);
  const [minimumElapsed, setMinimumElapsed] = useState(false);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
    scale.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
    const timeout = setTimeout(() => setMinimumElapsed(true), MINIMUM_VISIBLE_MS);
    return () => clearTimeout(timeout);
  }, [opacity, scale]);

  useEffect(() => {
    if (!bootstrapped || !minimumElapsed || navigated.current) {
      return;
    }

    navigated.current = true;

    if (status === 'authenticated') {
      router.replace('/(tabs)');
      return;
    }

    if (!onboardingComplete) {
      router.replace('/(onboarding)/welcome');
      return;
    }

    router.replace('/(auth)/login');
  }, [bootstrapped, minimumElapsed, onboardingComplete, status]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SPLASH_BACKGROUND }}>
      <StatusBar style="light" />
      <View className="flex-1 items-center justify-center px-8" style={{ gap: 28 }}>
        <Animated.View style={[{ alignItems: 'center', gap: 18 }, animatedStyle]}>
          <BrandMark size={92} />
          <AppText variant="title" tone="inverse" style={{ textAlign: 'center' }}>
            {BRAND.name}
          </AppText>
          <AppText variant="body" style={{ color: '#C4B5FD', textAlign: 'center' }}>
            {BRAND.tagline}
          </AppText>
        </Animated.View>
        <View className="items-center" style={{ gap: 10 }}>
          <ActivityIndicator color="#A78BFA" />
          <AppText variant="caption" style={{ color: '#A7A7C2' }}>
            {bootstrapped ? 'Opening your workspace' : 'Checking your session'}
          </AppText>
        </View>
      </View>
    </SafeAreaView>
  );
}
