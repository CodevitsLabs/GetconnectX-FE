import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuth, useLinkedInAuth } from '@features/auth';
import { AppButton, AppText } from '@shared/components';

export default function LinkedInCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ callbackUrl?: string | string[] }>();
  const linkedUrl = Linking.useURL();
  const { authPhase, isHydrated, session } = useAuth();
  const { completeLinkedInAuth } = useLinkedInAuth();
  const [statusMessage, setStatusMessage] = React.useState('Completing LinkedIn Sign-In...');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const hasStartedRef = React.useRef(false);
  const callbackUrl = React.useMemo(() => {
    const paramUrl = Array.isArray(params.callbackUrl) ? params.callbackUrl[0] : params.callbackUrl;

    return paramUrl ?? linkedUrl ?? null;
  }, [linkedUrl, params.callbackUrl]);

  React.useEffect(() => {
    if (!isHydrated || !callbackUrl || hasStartedRef.current) {
      return;
    }

    console.log('[auth][linkedin] callback screen mounted', {
      hasCallbackUrl: Boolean(callbackUrl),
    });

    hasStartedRef.current = true;

    const finalize = async () => {
      try {
        await completeLinkedInAuth(callbackUrl);
        router.replace('/(tabs)');
      } catch (error) {
        console.error('[auth][linkedin] callback flow failed', error);
        hasStartedRef.current = false;
        setStatusMessage('LinkedIn Sign-In could not be completed.');
        setErrorMessage(
          error instanceof Error ? error.message : 'LinkedIn Sign-In failed. Please try again.'
        );
      }
    };

    void finalize();
  }, [callbackUrl, completeLinkedInAuth, isHydrated, router]);

  if (session && authPhase === 'authenticated') {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 items-center justify-center gap-4 bg-canvas px-6">
        {errorMessage ? null : <ActivityIndicator color="#0A66C2" size="large" />}
        <AppText align="center" variant="title">
          {errorMessage ? 'LinkedIn Sign-In failed' : 'Finishing LinkedIn Sign-In'}
        </AppText>
        <AppText align="center" tone={errorMessage ? 'danger' : 'muted'}>
          {errorMessage ?? statusMessage}
        </AppText>
        {errorMessage ? (
          <AppButton
            className="mt-2 min-w-[200px]"
            label="Back to login"
            onPress={() => router.replace('/login')}
            size="lg"
          />
        ) : null}
      </View>
    </>
  );
}
