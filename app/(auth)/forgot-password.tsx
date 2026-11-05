import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocalSearchParams } from 'expo-router';
import { Mail } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
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
import { useTheme } from '@/hooks/use-theme';
import { forgotPassword, resetPassword } from '@/services/api/auth.api';
import { radius } from '@/theme/spacing';
import { getErrorMessage } from '@/utils/errors';

const emailSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').pipe(z.email('Enter a valid email')),
});

const resetSchema = z
  .object({
    token: z.string().min(20, 'Open the reset link from your email'),
    password: z.string().min(8, 'Use at least 8 characters').max(128, 'Password is too long'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type EmailValues = z.infer<typeof emailSchema>;
type ResetValues = z.infer<typeof resetSchema>;

function readParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? '';
  }
  return value?.trim() ?? '';
}

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const linkToken = useMemo(() => readParam(params.token), [params.token]);

  const [emailSentTo, setEmailSentTo] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { email: '' },
  });

  const resetForm = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: { token: linkToken, password: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (linkToken) {
      resetForm.setValue('token', linkToken, { shouldValidate: true });
    }
  }, [linkToken, resetForm]);

  async function requestReset(values: EmailValues) {
    try {
      await forgotPassword(values.email);
      setEmailSentTo(values.email.trim());
      showToast('Check your email for the reset link', 'success');
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

  function showFieldErrors() {
    showToast('Fix the highlighted fields', 'error');
  }

  const emailSent = Boolean(emailSentTo);

  return (
    <FlowScreen
      showNav
      edges={['top', 'bottom', 'left', 'right']}
      title={emailSent && !linkToken && !done ? 'Check your email' : 'Reset your password'}
      description={
        emailSent && !linkToken && !done
          ? 'We sent a secure link. Open it from your inbox to continue.'
          : 'Enter your account email. We will send a reset link — no token on this screen.'
      }
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
      ) : linkToken ? (
        <Card>
          <AppText variant="label">Set a new password</AppText>
          <AppText variant="caption" tone="muted">
            Reset link verified. Choose a new password.
          </AppText>
          <View style={{ gap: 12 }}>
            <Controller
              control={resetForm.control}
              name="password"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <TextField
                  label="New password"
                  secureTextEntry
                  autoComplete="new-password"
                  textContentType="newPassword"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={error?.message}
                />
              )}
            />
            <Controller
              control={resetForm.control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <TextField
                  label="Confirm password"
                  secureTextEntry
                  autoComplete="new-password"
                  textContentType="newPassword"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={error?.message}
                />
              )}
            />
            <Button
              label="Update password"
              loading={resetForm.formState.isSubmitting}
              onPress={() => void resetForm.handleSubmit(submitReset, showFieldErrors)()}
            />
          </View>
        </Card>
      ) : emailSent ? (
        <Card>
          <View style={{ alignItems: 'center', gap: 14, paddingVertical: 8 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: radius.full,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: `${colors.primary}22`,
              }}
            >
              <Mail color={colors.primary} size={28} strokeWidth={2} />
            </View>
            <AppText variant="heading" style={{ textAlign: 'center' }}>
              Email on the way
            </AppText>
            <AppText variant="body" tone="muted" style={{ textAlign: 'center' }}>
              If an account exists for{' '}
              <AppText variant="body" style={{ color: colors.text }}>
                {emailSentTo}
              </AppText>
              , you will get a reset link in a few moments.
            </AppText>
          </View>

          <View style={{ gap: 8, marginTop: 4 }}>
            <AppText variant="label">Next steps</AppText>
            <AppText variant="caption" tone="muted">
              1. Open your inbox (and spam / promotions)
            </AppText>
            <AppText variant="caption" tone="muted">
              2. Tap “Choose a new password” in the Achievo email
            </AppText>
            <AppText variant="caption" tone="muted">
              3. Set a new password — the link expires in 30 minutes
            </AppText>
          </View>

          <View style={{ gap: 10, marginTop: 8 }}>
            <Button
              label="Resend email"
              variant="secondary"
              loading={emailForm.formState.isSubmitting}
              onPress={() => void emailForm.handleSubmit(requestReset, showFieldErrors)()}
            />
            <Button label="Use a different email" variant="ghost" onPress={() => setEmailSentTo(null)} />
          </View>
        </Card>
      ) : (
        <Card>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: radius.full,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: `${colors.primary}22`,
              marginBottom: 4,
            }}
          >
            <Mail color={colors.primary} size={22} strokeWidth={2} />
          </View>
          <AppText variant="label">Account email</AppText>
          <AppText variant="caption" tone="muted">
            We will send a one-time reset link. Nothing sensitive shows on this page.
          </AppText>
          <Controller
            control={emailForm.control}
            name="email"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <TextField
                label="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={error?.message}
              />
            )}
          />
          <Button
            label="Send reset email"
            loading={emailForm.formState.isSubmitting}
            onPress={() => void emailForm.handleSubmit(requestReset, showFieldErrors)()}
          />
        </Card>
      )}
    </FlowScreen>
  );
}
