import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, View } from 'react-native';
import { z } from 'zod';

import { AppText } from '@/components/common/app-text';
import { Button } from '@/components/common/button';
import { Card } from '@/components/common/card';
import { FlowScreen } from '@/components/common/flow-screen';
import { InlineNotice } from '@/components/common/inline-notice';
import { TextField } from '@/components/common/text-field';
import { useToast } from '@/components/common/toast';
import { forgotPassword, resetPassword } from '@/services/api/auth.api';
import { getErrorMessage } from '@/utils/errors';

const emailSchema = z.object({
  email: z.email('Enter a valid email'),
});

const resetSchema = z
  .object({
    token: z.string().min(20, 'Paste the full reset token'),
    password: z.string().min(8, 'Use at least 8 characters').max(128),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type EmailValues = z.infer<typeof emailSchema>;
type ResetValues = z.infer<typeof resetSchema>;

export default function ForgotPasswordScreen() {
  const { showToast } = useToast();
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const resetForm = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { token: '', password: '', confirmPassword: '' },
  });

  async function requestReset(values: EmailValues) {
    try {
      const result = await forgotPassword(values.email);
      if (result.resetToken) {
        setResetToken(result.resetToken);
        resetForm.setValue('token', result.resetToken);
      }
      showToast('If that account exists, reset instructions are ready', 'success');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  }

  async function submitReset(values: ResetValues) {
    try {
      await resetPassword({ token: values.token, password: values.password });
      setDone(true);
      showToast('Password updated. You can sign in.', 'success');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  }

  return (
    <FlowScreen
      showNav
      edges={['top', 'bottom', 'left', 'right']}
      title="Reset your password"
      description="Enter the email for your account. In development the API returns a reset token so you can finish without email."
      footer={
        <Link href="/(auth)/login" asChild>
          <Pressable accessibilityRole="link" style={{ minHeight: 48, justifyContent: 'center', alignItems: 'center' }}>
            <AppText variant="label" tone="primary">
              Back to sign in
            </AppText>
          </Pressable>
        </Link>
      }
    >
      {done ? (
        <InlineNotice title="Password updated" message="Use your new password on the sign-in screen." tone="success" />
      ) : (
        <>
          <Controller
            control={emailForm.control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={emailForm.formState.errors.email?.message}
              />
            )}
          />
          <Button
            label="Send reset link"
            loading={emailForm.formState.isSubmitting}
            onPress={() => void emailForm.handleSubmit(requestReset)()}
          />

          <Card>
            <AppText variant="label">Set a new password</AppText>
            <AppText variant="caption" tone="muted">
              {resetToken
                ? 'Development token filled in for you.'
                : 'Paste the reset token from email or the API response.'}
            </AppText>
            <View style={{ gap: 12 }}>
              <Controller
                control={resetForm.control}
                name="token"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextField
                    label="Reset token"
                    autoCapitalize="none"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={resetForm.formState.errors.token?.message}
                  />
                )}
              />
              <Controller
                control={resetForm.control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextField
                    label="New password"
                    secureTextEntry
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={resetForm.formState.errors.password?.message}
                  />
                )}
              />
              <Controller
                control={resetForm.control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextField
                    label="Confirm password"
                    secureTextEntry
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={resetForm.formState.errors.confirmPassword?.message}
                  />
                )}
              />
              <Button
                label="Update password"
                loading={resetForm.formState.isSubmitting}
                onPress={() => void resetForm.handleSubmit(submitReset)()}
              />
            </View>
          </Card>
        </>
      )}
    </FlowScreen>
  );
}
