import { router } from 'expo-router';
import { useState } from 'react';

import { AppText } from '@/components/common/app-text';
import { Button } from '@/components/common/button';
import { Card } from '@/components/common/card';
import { FlowScreen } from '@/components/common/flow-screen';
import { StepIndicator } from '@/components/common/step-indicator';
import { useToast } from '@/components/common/toast';
import { requestNotificationAccess } from '@/services/notifications/permissions';
import { useAuthStore } from '@/store/auth.store';
import { getErrorMessage } from '@/utils/errors';

const reasons = [
  'A daily reminder at the time you choose',
  'A nudge when a task is waiting',
  'A note when you reach a milestone',
  'A prompt before a deadline',
];

export default function NotificationPermissionScreen() {
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  async function finish(requestPermission: boolean) {
    setSaving(true);
    try {
      if (requestPermission) {
        const result = await requestNotificationAccess();
        showToast(
          result.granted ? 'Reminders are allowed' : 'You can enable reminders later in Profile',
          result.granted ? 'success' : 'info',
        );
      }
      await completeOnboarding();
      router.replace('/(auth)/register');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <FlowScreen
      showNav
      eyebrow="Step 4"
      title="Reminders, only when they help"
      description="Achievo can remind you about the plan you approved. The phone asks for permission only after this explanation. You can decline and keep using the app."
      footer={
        <>
          <Button label="Allow reminders" loading={saving} onPress={() => void finish(true)} />
          <Button label="Not now" variant="ghost" loading={saving} onPress={() => void finish(false)} />
        </>
      }
    >
      <StepIndicator step={4} total={4} />
      <Card>
        {reasons.map((reason) => (
          <AppText key={reason} variant="body">
            {reason}
          </AppText>
        ))}
      </Card>
    </FlowScreen>
  );
}
