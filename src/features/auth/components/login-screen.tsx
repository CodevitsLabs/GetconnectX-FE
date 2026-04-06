import { Redirect, Stack, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';

import { AppButton, AppCard, AppInput, AppListItem, AppPill, AppText } from '@shared/components';

import { useAuth } from '../hooks/use-auth';

const trustPoints = [
  {
    title: 'Fast access',
    description: 'Use Google for the quickest sign-in path into the protected workspace.',
    badge: '01',
  },
  {
    title: 'Phone fallback',
    description: 'Phone entry stays available when teams need a simple backup route.',
    badge: '02',
  },
  {
    title: 'Demo-safe flow',
    description: 'This environment is local-only, so you can validate UX without production risk.',
    badge: '03',
  },
] as const;

function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 13);

  if (!digits) {
    return '';
  }

  if (digits.length <= 2) {
    return `+${digits}`;
  }

  if (digits.length <= 5) {
    return `+${digits.slice(0, 2)} ${digits.slice(2)}`;
  }

  if (digits.length <= 9) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  }

  return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 9)} ${digits.slice(9)}`;
}

export function LoginScreen() {
  const router = useRouter();
  const { isHydrated, session, signInWithGoogle, signInWithPhone } = useAuth();
  const [phoneNumber, setPhoneNumber] = React.useState('+62 ');

  if (!isHydrated) {
    return null;
  }

  if (session) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: 'Login' }} />
      <ScrollView
        className="flex-1 bg-canvas"
        contentContainerClassName="gap-6 px-5 pt-12 pb-24"
        contentInsetAdjustmentBehavior="automatic">
        <View className="gap-3">
          <AppPill className="self-start" label="Secure Access" tone="accent" />
          <AppText variant="display">Enter ConnectX</AppText>
          <AppText tone="muted">
            One clean entry point for your pipeline, inbox, and team workflow.
          </AppText>
        </View>

        <AppCard className="gap-5 p-5">
          <View className="gap-2">
            <AppText tone="muted" variant="label">
              Preferred Method
            </AppText>
            <AppText variant="title">Use the fastest route in.</AppText>
            <AppText tone="muted">
              Both actions are mocked for demo mode, but the hierarchy matches a real production
              auth flow.
            </AppText>
          </View>

          <AppButton
            detail="Primary sign-in route"
            label="Continue with Google"
            onPress={async () => {
              await signInWithGoogle();
              router.replace('/(tabs)');
            }}
            size="lg"
          />

          <AppCard tone="muted" className="gap-4">
            <View className="gap-1">
              <AppText variant="subtitle">Continue with phone</AppText>
              <AppText tone="muted">
                Enter any valid-looking number to simulate a phone-based login.
              </AppText>
            </View>

            <AppInput
              keyboardType="phone-pad"
              label="Phone Number"
              onChangeText={(value) => {
                setPhoneNumber(formatPhoneNumber(value));
              }}
              placeholder="+62 812 3456 7890"
              value={phoneNumber}
            />

            <AppButton
              detail="Secondary recovery path"
              disabled={phoneNumber.replace(/\D/g, '').length < 8}
              label="Continue with Phone"
              onPress={async () => {
                await signInWithPhone(phoneNumber);
                router.replace('/(tabs)');
              }}
              variant="secondary"
            />
          </AppCard>
        </AppCard>

        <AppCard tone="muted" className="gap-3">
          <View className="gap-1">
            <AppText variant="subtitle">Why this feels trustworthy</AppText>
            <AppText tone="muted">
              The screen stays focused on access, confidence, and one obvious next step.
            </AppText>
          </View>

          {trustPoints.map((point) => (
            <AppListItem
              key={point.title}
              description={point.description}
              leading={<AppText variant="bodyStrong">{point.badge}</AppText>}
              title={point.title}
            />
          ))}
        </AppCard>
      </ScrollView>
    </>
  );
}
