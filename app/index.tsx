import { router, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/common/app-text';
import { BrandMark } from '@/components/common/brand-mark';
import { BRAND, SPLASH_ACCENT, SPLASH_BACKGROUND, SPLASH_MUTED } from '@/constants/brand';
import { useAuthStore } from '@/store/auth.store';

const MINIMUM_VISIBLE_MS = 1100;

function readWebNextPath(): string | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return null;
  }

  try {
    const next = new URLSearchParams(window.location.search).get('next');
    if (!next || !next.startsWith('/') || next.startsWith('//')) {
      return null;
    }
    return next;
  } catch {
    return null;
  }
}

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

    const nextPath = readWebNextPath();
    if (nextPath) {
      router.replace(nextPath as Href);
      return;
    }

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
          <AppText variant="title" style={{ textAlign: 'center', color: '#F5F5F5' }}>
            {BRAND.name}
          </AppText>
          <AppText variant="body" style={{ color: SPLASH_MUTED, textAlign: 'center' }}>
            {BRAND.tagline}
          </AppText>
        </Animated.View>
        <View className="items-center" style={{ gap: 10 }}>
          <ActivityIndicator color={SPLASH_ACCENT} />
          <AppText variant="caption" style={{ color: SPLASH_MUTED }}>
            {bootstrapped ? 'Opening your workspace' : 'Checking your session'}
          </AppText>
        </View>
      </View>
    </SafeAreaView>
  );
}
