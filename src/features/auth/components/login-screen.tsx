import { Redirect, Stack, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import { AppText } from '@shared/components';

import { useAuth } from '../hooks/use-auth';
import { getRouteForAuthPhase } from '../utils/auth-routing';
import { getEmailError, getPasswordError } from '../utils/auth-validation';

const socialProviders = [
  {
    detail: 'Google',
    label: 'GOOGLE',
  },
  {
    detail: 'Apple',
    label: 'Apple',
  },
] as const;

type AuthFieldProps = {
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  error?: string | null;
  keyboardType?: 'default' | 'email-address' | 'number-pad' | 'phone-pad';
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  trailing?: React.ReactNode;
  value: string;
};

function AuthField({
  autoCapitalize = 'none',
  autoCorrect = false,
  error,
  keyboardType = 'default',
  label,
  onChangeText,
  placeholder,
  secureTextEntry,
  trailing,
  value,
}: AuthFieldProps) {
  return (
    <View className="gap-2">
      <View className="gap-2 rounded-[22px] border border-[#232229] bg-[#17161d] px-4 py-4">
        <AppText className="text-[#8F93A3]" variant="label">
          {label}
        </AppText>
        <View className="flex-row items-center gap-3">
          <TextInput
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            className="flex-1 font-body text-[18px] text-white"
            keyboardType={keyboardType}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#5A5E6D"
            secureTextEntry={secureTextEntry}
            value={value}
          />
          {trailing}
        </View>
      </View>

      {error ? (
        <AppText selectable className="px-1 text-[#FF8E9C]" variant="code">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

export function LoginScreen() {
  const router = useRouter();
  const { authPhase, isHydrated, session, submitEmailLogin } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!isHydrated) {
    return null;
  }

  if (session) {
    return <Redirect href={getRouteForAuthPhase(authPhase)} />;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: 'Login' }} />
      <ScrollView
        className="flex-1 bg-[#111015]"
        contentContainerClassName="min-h-full px-4 pb-10 pt-12"
        contentInsetAdjustmentBehavior="automatic">
        <View className="flex-1 justify-between gap-10">
          <View className="gap-10">
            <View className="items-center gap-2 pt-8">
              <AppText align="center" className="text-white" variant="display">
                Welcome back
              </AppText>
              <AppText align="center" className="text-[18px] text-[#9A9EAD]">
                Sign in to continue
              </AppText>
            </View>

            <View className="gap-4">
              <AuthField
                error={emailError}
                keyboardType="email-address"
                label="EMAIL ADDRESS"
                onChangeText={(value) => {
                  setEmail(value);

                  if (emailError) {
                    setEmailError(null);
                  }
                }}
                placeholder="name@company.com"
                value={email}
              />

              <AuthField
                error={passwordError}
                label="PASSWORD"
                onChangeText={(value) => {
                  setPassword(value);

                  if (passwordError) {
                    setPasswordError(null);
                  }
                }}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                trailing={
                  <Pressable
                    className="rounded-full border border-[#313341] px-3 py-1.5"
                    onPress={() => {
                      setShowPassword((current) => !current);
                    }}>
                    <AppText className="text-[#C5C9D6]" variant="code">
                      {showPassword ? 'HIDE' : 'SHOW'}
                    </AppText>
                  </Pressable>
                }
                value={password}
              />

              <Pressable
                className="self-end px-1"
                onPress={() => {
                  setStatusMessage('Forgot password flow is not connected yet.');
                }}>
                <AppText className="text-[#4D8DFF]" variant="bodyStrong">
                  Forgot password?
                </AppText>
              </Pressable>

              <Pressable
                className="rounded-[28px] bg-[#5D96FF] px-5 py-5"
                onPress={async () => {
                  const nextEmailError = getEmailError(email);
                  const nextPasswordError = getPasswordError(password);

                  setEmailError(nextEmailError);
                  setPasswordError(nextPasswordError);
                  setStatusMessage(null);

                  if (nextEmailError || nextPasswordError || isSubmitting) {
                    return;
                  }

                  setIsSubmitting(true);

                  try {
                    const response = await submitEmailLogin();
                    setStatusMessage(response.message);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                style={{
                  boxShadow: '0 18px 34px rgba(73, 124, 255, 0.28)',
                }}>
                <AppText
                  align="center"
                  className="text-[#14274D]"
                  variant="bodyStrong">
                  {isSubmitting ? 'SIGNING IN...' : 'SIGN IN'}
                </AppText>
              </Pressable>

              {statusMessage ? (
                <AppText
                  align="center"
                  selectable
                  className="px-4 text-[#8F93A3]"
                  variant="code">
                  {statusMessage}
                </AppText>
              ) : null}

              <View className="flex-row items-center gap-4 py-1">
                <View className="h-px flex-1 bg-[#2A2C36]" />
                <AppText className="text-[#555A67]" variant="code">
                  OR
                </AppText>
                <View className="h-px flex-1 bg-[#2A2C36]" />
              </View>

              <View className="flex-row gap-4">
                {socialProviders.map((provider) => (
                  <Pressable
                    key={provider.label}
                    className="flex-1 rounded-[18px] border border-[#2A2B33] bg-[#232228] px-4 py-5 opacity-80"
                    disabled>
                    <View className="flex-row items-center justify-center gap-2">
                      <AppText className="tracking-[1.2px] text-white" variant="subtitle">
                        {provider.label}
                      </AppText>
                      <AppText className="text-[#D5D8E0]" variant="code">
                        {provider.detail}
                      </AppText>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <View className="items-center gap-7 pb-3">
            <View className="flex-row items-center gap-2">
              <AppText className="text-[#8D92A0]">Don&apos;t have an account?</AppText>
              <Pressable
                onPress={() => {
                  router.push('/register');
                }}>
                <AppText className="text-[#4D8DFF]" variant="bodyStrong">
                  Sign up
                </AppText>
              </Pressable>
            </View>

            <View className="flex-row items-center gap-7">
              <AppText className="tracking-[1.1px] text-[#424653]" variant="label">
                PRIVACY
              </AppText>
              <AppText className="tracking-[1.1px] text-[#424653]" variant="label">
                TERMS
              </AppText>
              <AppText className="tracking-[1.1px] text-[#424653]" variant="label">
                SECURITY
              </AppText>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
