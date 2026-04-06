import { Stack, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { AppButton, AppCard, AppListItem, AppPill, AppStatCard, AppText } from '@shared/components';

import { useAuth } from '@features/auth';

export function ProfileScreen() {
  const router = useRouter();
  const { session, signOut } = useAuth();

  if (!session) {
    return null;
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Account' }} />
      <ScrollView
        className="flex-1 bg-canvas"
        contentContainerClassName="gap-6 px-5 pt-4 pb-24"
        contentInsetAdjustmentBehavior="automatic">
        <View className="gap-3">
          <AppPill className="self-start" label="Account" tone="accent" />
          <AppText variant="hero">{session.displayName}</AppText>
          <AppText tone="muted">
            Keep identity, access method, and session controls clear and low-friction.
          </AppText>
        </View>

        <View className="flex-row gap-3">
          <AppStatCard
            className="flex-1"
            detail="Healthy"
            label="Security Status"
            tone="success"
            value="Secure"
          />
          <AppStatCard
            className="flex-1"
            detail="Active"
            label="Current Session"
            value="Live"
          />
        </View>

        <AppCard className="gap-3">
          <AppText variant="subtitle">Access details</AppText>
          <AppListItem
            description={session.method === 'google' ? 'Primary provider' : 'Recovery-friendly sign-in'}
            leading={<AppText variant="bodyStrong">ID</AppText>}
            title="Login method"
            value={session.method === 'google' ? 'Google' : 'Phone'}
          />
          <AppListItem
            description="Active identifier used for this demo session."
            leading={<AppText variant="bodyStrong">#</AppText>}
            meta="Verified"
            title="Sign-in ID"
            value={session.phoneNumber ?? 'OAuth'}
          />
        </AppCard>

        <AppCard tone="muted" className="gap-4">
          <View className="gap-1">
            <AppText variant="subtitle">Session control</AppText>
            <AppText tone="muted">
              Keep destructive actions visually quieter until the user truly needs them.
            </AppText>
          </View>

          <AppButton
            detail="Return to the secure entry screen"
            label="Sign Out"
            onPress={async () => {
              await signOut();
              router.replace('/login');
            }}
            variant="secondary"
          />
        </AppCard>
      </ScrollView>
    </>
  );
}
