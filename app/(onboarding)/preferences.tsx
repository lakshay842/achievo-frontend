import { router } from 'expo-router';
import { View } from 'react-native';

import { AppText } from '@/components/common/app-text';
import { Button } from '@/components/common/button';
import { ChoiceChip } from '@/components/common/choice-chip';
import { FlowScreen } from '@/components/common/flow-screen';
import { StepIndicator } from '@/components/common/step-indicator';
import { DAILY_TIME_OPTIONS, MOTIVATION_STYLES, NOTIFICATION_TIMES } from '@/constants/goals';
import { useOnboardingStore } from '@/store/onboarding.store';

export default function PreferencesScreen() {
  const dailyMinutes = useOnboardingStore((state) => state.dailyMinutes);
  const motivationStyle = useOnboardingStore((state) => state.motivationStyle);
  const notificationTime = useOnboardingStore((state) => state.notificationTime);
  const setDailyMinutes = useOnboardingStore((state) => state.setDailyMinutes);
  const setMotivationStyle = useOnboardingStore((state) => state.setMotivationStyle);
  const setNotificationTime = useOnboardingStore((state) => state.setNotificationTime);

  return (
    <FlowScreen
      showNav
      eyebrow="Step 3"
      title="How should Achievo plan your days?"
      description="Set the time you can give, how you like to be motivated, and when a reminder is welcome."
      footer={
        <Button label="Continue" onPress={() => router.push('/(onboarding)/notification-permission')} />
      }
    >
      <StepIndicator step={3} total={4} />

      <View style={{ gap: 10 }}>
        <AppText variant="label">Daily available time</AppText>
        <View className="flex-row flex-wrap" style={{ gap: 8 }}>
          {DAILY_TIME_OPTIONS.map((option) => (
            <ChoiceChip
              key={option.value}
              label={option.label}
              selected={dailyMinutes === option.value}
              onPress={() => setDailyMinutes(option.value)}
            />
          ))}
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <AppText variant="label">Motivation style</AppText>
        <View className="flex-row flex-wrap" style={{ gap: 8 }}>
          {MOTIVATION_STYLES.map((option) => (
            <ChoiceChip
              key={option.value}
              label={option.label}
              selected={motivationStyle === option.value}
              onPress={() => setMotivationStyle(option.value)}
            />
          ))}
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <AppText variant="label">Preferred reminder time</AppText>
        <View className="flex-row flex-wrap" style={{ gap: 8 }}>
          {NOTIFICATION_TIMES.map((option) => (
            <ChoiceChip
              key={option.value}
              label={option.label}
              selected={notificationTime === option.value}
              onPress={() => setNotificationTime(option.value)}
            />
          ))}
        </View>
      </View>
    </FlowScreen>
  );
}
