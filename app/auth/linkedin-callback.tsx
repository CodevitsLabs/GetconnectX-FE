import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';

import { SplashScreen, getRouteForAuthPhase, useAuth } from '@features/auth';

function getSingleParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return getSingleParam(value[0]);
  }

  return typeof value === 'string' ? value.trim() || null : null;
}

export default function LinkedInCallbackRoute() {
  const router = useRouter();
  const { authPhase, isHydrated, session } = useAuth();
  const params = useLocalSearchParams<{
    error?: string | string[];
    message?: string | string[];
    token?: string | string[];
  }>();
  const callbackError = getSingleParam(params.error);
  const callbackMessage = getSingleParam(params.message);
  const callbackToken = getSingleParam(params.token);

  React.useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (session) {
      router.replace(getRouteForAuthPhase(authPhase));
      return;
    }

    if (callbackError || callbackMessage) {
      router.replace({
        pathname: '/login',
        params: {
          linkedin_error: callbackError ?? 'oauth_failed',
          linkedin_message: callbackMessage ?? 'LinkedIn sign-in failed. Please try again.',
        },
      });
      return;
    }

    const timeout = setTimeout(() => {
      router.replace({
        pathname: '/login',
        params: {
          linkedin_message: callbackToken
            ? 'LinkedIn sign-in is taking longer than expected. Please try again.'
            : 'LinkedIn sign-in returned an unexpected callback.',
        },
      });
    }, 4000);

    return () => clearTimeout(timeout);
  }, [authPhase, callbackError, callbackMessage, callbackToken, isHydrated, router, session]);

  if (isHydrated && session) {
    return <Redirect href={getRouteForAuthPhase(authPhase)} />;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SplashScreen />
    </>
  );
}
