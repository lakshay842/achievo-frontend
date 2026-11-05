import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, View } from 'react-native';
import { z } from 'zod';

import { AppText } from '@/components/common/app-text';
import { Button } from '@/components/common/button';
import { FlowScreen } from '@/components/common/flow-screen';
import { TextField } from '@/components/common/text-field';
import { useToast } from '@/components/common/toast';
import { updateNotificationPreferences } from '@/services/api/notifications.api';
import { useAuthStore } from '@/store/auth.store';
import { useOnboardingStore } from '@/store/onboarding.store';
import { getErrorMessage } from '@/utils/errors';

const schema = z.object({
  email: z.string().trim().min(1, 'Email is required').pipe(z.email('Enter a valid email')),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

const stackEdges = ['top', 'bottom', 'left', 'right'] as const;

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);
  const notificationTime = useOnboardingStore((state) => state.notificationTime);
  const { showToast } = useToast();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: FormValues) {
    try {
      await login(values);
      try {
        await updateNotificationPreferences({ dailyReminderTime: notificationTime });
      } catch {
        // Preferences can be edited later in Profile.
      }
      showToast('Welcome back', 'success');
      router.replace('/(tabs)');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  }

  return (
    <FlowScreen
      showNav
      showBack={false}
      edges={stackEdges}
      title="Welcome back"
      description="Sign in with your Achievo account. Your password is sent to the server and is never stored on this device."
      footer={
        <View style={{ gap: 8 }}>
          <Button
            label="Sign in"
            loading={isSubmitting}
            onPress={() =>
              void handleSubmit(onSubmit, () => {
                showToast('Fix the highlighted fields', 'error');
              })()
            }
          />
          <Link href="/(auth)/register" asChild>
            <Pressable accessibilityRole="link" style={{ minHeight: 48, justifyContent: 'center', alignItems: 'center' }}>
              <AppText variant="label" tone="primary">
                Create an account
              </AppText>
            </Pressable>
          </Link>
          <Link href="/(auth)/forgot-password" asChild>
            <Pressable accessibilityRole="link" style={{ minHeight: 48, justifyContent: 'center', alignItems: 'center' }}>
              <AppText variant="label" tone="muted">
                Forgot password
              </AppText>
            </Pressable>
          </Link>
        </View>
      }
    >
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <TextField
            label="Email"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <TextField
            label="Password"
            secureTextEntry
            autoComplete="password"
            textContentType="password"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={error?.message}
          />
        )}
      />
    </FlowScreen>
  );
}
