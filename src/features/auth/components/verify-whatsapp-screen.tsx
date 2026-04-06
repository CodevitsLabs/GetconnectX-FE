import { Redirect, Stack, useRouter } from 'expo-router';
import { View } from 'react-native';

import { AppButton, AppText } from '@shared/components';

import { useAuth } from '../hooks/use-auth';
import { getRouteForAuthPhase } from '../utils/auth-routing';
import { AuthShell } from './auth-shell';

const whatsappHighlights = [
  {
    description: 'Email verification is complete and the session is now parked at the next onboarding checkpoint.',
    title: 'Email complete',
  },
  {
    description: 'This placeholder makes the backend-driven next step visible without falsely unlocking the app.',
    title: 'No false completion',
  },
  {
    description: 'Developer bypass is still available from login when the team needs full app access.',
    title: 'Bypass remains separate',
  },
] as const;

export function VerifyWhatsappScreen() {
  const router = useRouter();
  const { authPhase, isHydrated, session, signOut } = useAuth();

  if (!isHydrated) {
    return null;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  if (authPhase !== 'pending_whatsapp_verification') {
    return <Redirect href={getRouteForAuthPhase(authPhase)} />;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: 'Verify WhatsApp' }} />
      <AuthShell
        description="Email verification is done. The next backend step is WhatsApp verification, which is still a placeholder in this pass."
        highlights={whatsappHighlights}
        pill="Next Step"
        title="WhatsApp verification is next">
        <View className="gap-4">
          <View className="gap-2">
            <AppText tone="muted" variant="label">Pending Integration</AppText>
            <AppText variant="title">You are parked at the right checkpoint.</AppText>
            <AppText tone="muted">
              The backend response already points here with `NEED_WHATSAPP_VERIFICATION`, so the
              routing is wired even though the feature is still a placeholder.
            </AppText>
          </View>

          <View className="gap-2 rounded-[20px] border border-success/25 bg-success-tint p-4">
            <AppText variant="subtitle">Current status</AppText>
            <AppText selectable tone="muted">
              {session.email} has been verified successfully. Full app access still requires either
              the future WhatsApp step or the separate development bypass.
            </AppText>
          </View>

          <AppButton
            detail="Return to login and choose a different path"
            label="Back to Login"
            onPress={async () => {
              await signOut();
              router.replace('/login');
            }}
            variant="secondary"
          />
        </View>
      </AuthShell>
    </>
  );
}
