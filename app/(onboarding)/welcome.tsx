import { router } from 'expo-router';
import { Sparkles, Target, TrendingUp } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/common/app-text';
import { Button } from '@/components/common/button';
import { Card } from '@/components/common/card';
import { FlowScreen } from '@/components/common/flow-screen';
import { StepIndicator } from '@/components/common/step-indicator';
import { BRAND } from '@/constants/brand';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/store/auth.store';

const points = [
  {
    icon: Target,
    title: 'Your plan',
    body: 'Describe a goal in your own words. Review the roadmap before it starts.',
  },
  {
    icon: Sparkles,
    title: 'Your coach',
    body: 'Ask for help, practice, and a push when the work gets quiet.',
  },
  {
    icon: TrendingUp,
    title: 'Your progress',
    body: 'See what you finished, what you missed, and the time you put in.',
  },
] as const;

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const [leaving, setLeaving] = useState(false);

  async function signIn() {
    setLeaving(true);
    try {
      await completeOnboarding();
      router.replace('/(auth)/login');
    } finally {
      setLeaving(false);
    }
  }

  return (
    <FlowScreen
      showNav
      showBack={false}
      eyebrow="Welcome"
      title={BRAND.name}
      description={BRAND.tagline}
      footer={
        <>
          <Button label="Get started" onPress={() => router.push('/(onboarding)/interests')} />
          <Button label="I already have an account" variant="ghost" loading={leaving} onPress={() => void signIn()} />
        </>
      }
    >
      <StepIndicator step={1} total={4} />
      <Card>
        {points.map((point) => {
          const Icon = point.icon;
          return (
            <View key={point.title} className="flex-row" style={{ gap: 12 }}>
              <Icon color={colors.primary} size={20} strokeWidth={2} />
              <View className="flex-1" style={{ gap: 2 }}>
                <AppText variant="label">{point.title}</AppText>
                <AppText variant="caption" tone="muted">
                  {point.body}
                </AppText>
              </View>
            </View>
          );
        })}
      </Card>
    </FlowScreen>
  );
}
