import { Redirect, Stack, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { AppButton, AppInput, AppText } from '@shared/components';

import { useAuth } from '../hooks/use-auth';
import { getMockRegisterPayloadDefaults } from '../services/auth-service';
import { getRouteForAuthPhase } from '../utils/auth-routing';
import { getEmailError, getPasswordError } from '../utils/auth-validation';
import { AuthShell } from './auth-shell';

const registerHighlights = [
  {
    description: 'The register payload already includes the mock `fcm_token` and `entity_type: null` defaults.',
    title: 'Contract-shaped',
  },
  {
    description: 'Account creation routes directly into email verification instead of dropping the user cold.',
    title: 'Guided next step',
  },
  {
    description: 'Validation lives on-device so obvious mistakes are caught before network wiring exists.',
    title: 'Low-friction validation',
  },
] as const;

export function RegisterScreen() {
  const router = useRouter();
  const { authPhase, isHydrated, register, session } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [passwordConfirmation, setPasswordConfirmation] = React.useState('');
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [passwordConfirmationError, setPasswordConfirmationError] = React.useState<string | null>(null);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!isHydrated) {
    return null;
  }

  if (session) {
    return <Redirect href={getRouteForAuthPhase(authPhase)} />;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: 'Register' }} />
      <AuthShell
        description="Create the account shell now, then continue straight into the mocked email OTP flow."
        highlights={registerHighlights}
        pill="Create Account"
        title="Start your ConnectX access">
        <View className="gap-4">
          <View className="gap-2">
            <AppText tone="muted" variant="label">Registration</AppText>
            <AppText variant="title">Set up your email access.</AppText>
            <AppText tone="muted">
              This screen already follows the contract shape you shared, including password
              confirmation and the email verification handoff.
            </AppText>
          </View>

          <AppInput
            autoCapitalize="none"
            autoCorrect={false}
            error={emailError ?? undefined}
            keyboardType="email-address"
            label="Email"
            onChangeText={(value) => {
              setEmail(value);

              if (emailError) {
                setEmailError(null);
              }
            }}
            placeholder="you@company.com"
            value={email}
          />

          <AppInput
            autoCapitalize="none"
            autoCorrect={false}
            error={passwordError ?? undefined}
            label="Password"
            onChangeText={(value) => {
              setPassword(value);

              if (passwordError) {
                setPasswordError(null);
              }
            }}
            placeholder="Use at least 8 characters"
            secureTextEntry
            value={password}
          />

          <AppInput
            autoCapitalize="none"
            autoCorrect={false}
            error={passwordConfirmationError ?? undefined}
            label="Confirm Password"
            onChangeText={(value) => {
              setPasswordConfirmation(value);

              if (passwordConfirmationError) {
                setPasswordConfirmationError(null);
              }
            }}
            placeholder="Repeat your password"
            secureTextEntry
            value={passwordConfirmation}
          />

          <AppButton
            detail="Creates the account shell, then opens email verification"
            disabled={isSubmitting}
            label={isSubmitting ? 'Creating account...' : 'Create Account'}
            onPress={async () => {
              const nextEmailError = getEmailError(email);
              const nextPasswordError = getPasswordError(password);
              const nextPasswordConfirmationError =
                passwordConfirmation !== password ? 'Passwords must match.' : getPasswordError(passwordConfirmation);

              setEmailError(nextEmailError);
              setPasswordError(nextPasswordError);
              setPasswordConfirmationError(nextPasswordConfirmationError);
              setStatusMessage(null);

              if (nextEmailError || nextPasswordError || nextPasswordConfirmationError) {
                return;
              }

              setIsSubmitting(true);

              try {
                const payloadDefaults = getMockRegisterPayloadDefaults();

                await register({
                  email,
                  password,
                  password_confirmation: passwordConfirmation,
                  ...payloadDefaults,
                });
                router.replace('/verify-email');
              } finally {
                setIsSubmitting(false);
              }
            }}
            size="lg"
          />

          {statusMessage ? (
            <AppText selectable tone="signal">
              {statusMessage}
            </AppText>
          ) : null}

          <AppButton
            detail="Back to the sign-in screen"
            label="Back to Login"
            onPress={() => {
              router.replace('/login');
            }}
            variant="ghost"
          />
        </View>
      </AuthShell>
    </>
  );
}
