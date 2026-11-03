import { router } from 'expo-router';
import { View } from 'react-native';

import { AppText } from '@/components/common/app-text';
import { Button } from '@/components/common/button';
import { ChoiceChip } from '@/components/common/choice-chip';
import { FlowScreen } from '@/components/common/flow-screen';
import { StepIndicator } from '@/components/common/step-indicator';
import { useToast } from '@/components/common/toast';
import { INTEREST_OPTIONS } from '@/constants/goals';
import { useOnboardingStore } from '@/store/onboarding.store';

export default function InterestsScreen() {
  const interests = useOnboardingStore((state) => state.interests);
  const toggleInterest = useOnboardingStore((state) => state.toggleInterest);
  const { showToast } = useToast();

  function continueNext() {
    if (interests.length === 0) {
      showToast('Pick at least one interest', 'error');
      return;
    }
    router.push('/(onboarding)/preferences');
  }

  return (
    <FlowScreen
      showNav
      eyebrow="Step 2"
      title="What do you want to work on?"
      description="Choose the areas that matter now. Achievo uses this to shape your first plan."
      footer={<Button label="Continue" onPress={continueNext} />}
    >
      <StepIndicator step={2} total={4} />
      <AppText variant="caption" tone="muted">
        Selected {interests.length}
      </AppText>
      <View className="flex-row flex-wrap" style={{ gap: 8 }}>
        {INTEREST_OPTIONS.map((option) => (
          <ChoiceChip
            key={option.value}
            label={option.label}
            selected={interests.includes(option.value)}
            onPress={() => toggleInterest(option.value)}
          />
        ))}
      </View>
    </FlowScreen>
  );
}
