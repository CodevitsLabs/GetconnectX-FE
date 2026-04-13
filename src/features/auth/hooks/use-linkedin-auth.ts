import { useRouter } from 'expo-router';
import React from 'react';

import { useAuth } from './use-auth';

export function useLinkedInAuth() {
  const router = useRouter();
  const { completeLinkedInOAuth, signInWithLinkedIn } = useAuth();

  const startLinkedInAuth = React.useCallback(async () => {
    const callbackUrl = await signInWithLinkedIn();

    router.replace({
      pathname: '/oauth/linkedin-callback',
      params: { callbackUrl },
    });
  }, [router, signInWithLinkedIn]);

  const finalizeLinkedInAuth = React.useCallback(
    async (url: string) => {
      await completeLinkedInOAuth(url);
    },
    [completeLinkedInOAuth]
  );

  return {
    completeLinkedInAuth: finalizeLinkedInAuth,
    startLinkedInAuth,
  };
}
