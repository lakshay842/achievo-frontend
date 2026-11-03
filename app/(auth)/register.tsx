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

const schema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(80),
    email: z.email('Enter a valid email'),
    password: z.string().min(8, 'Use at least 8 characters').max(128),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterScreen() {
  const register = useAuthStore((state) => state.register);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const notificationTime = useOnboardingStore((state) => state.notificationTime);
  const { showToast } = useToast();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  async function onSubmit(values: FormValues) {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
        timezone,
      });
      await completeOnboarding();
      try {
        await updateNotificationPreferences({ dailyReminderTime: notificationTime });
      } catch {
        // Optional.
      }
      showToast('Account created', 'success');
      router.replace('/(tabs)');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  }

  return (
    <FlowScreen
      showNav
      edges={['top', 'bottom', 'left', 'right']}
      title="Create your account"
      description="Your name, email, and password are sent to Achievo. The password is not kept on this device."
      footer={
        <View style={{ gap: 8 }}>
          <Button label="Create account" loading={isSubmitting} onPress={() => void handleSubmit(onSubmit)()} />
          <Link href="/(auth)/login" asChild>
            <Pressable accessibilityRole="link" style={{ minHeight: 48, justifyContent: 'center', alignItems: 'center' }}>
              <AppText variant="label" tone="primary">
                I already have an account
              </AppText>
            </Pressable>
          </Link>
        </View>
      }
    >
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Name"
            autoComplete="name"
            textContentType="name"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.name?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.email?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Password"
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.password?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Confirm password"
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.confirmPassword?.message}
          />
        )}
      />
    </FlowScreen>
  );
}
