import React from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { configureApiClient } from '@shared/services/api';
import {
  clearSupabaseSession,
  getSupabaseSession,
  signOutSupabase,
  supabase,
  syncSupabaseRealtimeAuth,
} from '@shared/services/supabase/client';

import { isAuthBypassEnabled } from '../config/auth-config';
import {
  clearPersistedAuth,
  createSocialAuthSessionFromSupabaseSession,
  enterWithDevBypassSession,
  getPersistedAuthState,
  getStoredToken,
  loginWithGoogleSupabase,
  loginWithApi,
  registerWithApi,
  resendWhatsappOtpWithApi,
  resendEmailOtpWithMock,
  replaceStoredSession,
  sendWhatsappOtpWithApi,
  sendEmailOtpWithMock,
  verifyEmailOtpWithMock,
  verifyWhatsappOtpWithApi,
} from '../services/auth-service';
import type { LoginPayload } from '../services/auth-service';
import { signInWithGoogleToken } from '../services/google-auth-service';
import {
  clearPendingLinkedInAuth,
  completeLinkedInOAuth as completeLinkedInOAuthFlow,
  getPendingLinkedInAuth,
  startLinkedInOAuth,
} from '../services/linkedin-auth-service';
import type {
  AuthPhase,
  AuthMethod,
  AuthSession,
  RegisterPayload,
  VerifyEmailPayload,
  VerifyWhatsappPayload,
  WhatsappOtpPayload,
} from '../types/auth.types';

type AuthContextValue = {
  authPhase: AuthPhase;
  completeOnboarding: () => Promise<void>;
  enterPendingOnboarding: () => Promise<void>;
  isHydrated: boolean;
  isAuthBypassEnabled: boolean;
  session: AuthSession | null;
  enterWithDevBypass: () => Promise<void>;
  login: (payload: LoginPayload) => ReturnType<typeof loginWithApi>;
  register: (payload: RegisterPayload) => ReturnType<typeof registerWithApi>;
  resendEmailOtp: () => ReturnType<typeof resendEmailOtpWithMock>;
  resendWhatsappOtp: () => ReturnType<typeof resendWhatsappOtpWithApi>;
  sendEmailOtp: () => ReturnType<typeof sendEmailOtpWithMock>;
  sendWhatsappOtp: (payload: WhatsappOtpPayload) => ReturnType<typeof sendWhatsappOtpWithApi>;
  signInWithGoogle: (fcmToken?: string | null) => ReturnType<typeof loginWithGoogleSupabase>;
  signInWithLinkedIn: () => ReturnType<typeof startLinkedInOAuth>;
  completeLinkedInOAuth: (url: string) => Promise<void>;
  signOut: () => Promise<void>;
  verifyEmailOtp: (payload: VerifyEmailPayload) => ReturnType<typeof verifyEmailOtpWithMock>;
  verifyWhatsappOtp: (payload: VerifyWhatsappPayload) => ReturnType<typeof verifyWhatsappOtpWithApi>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

function isSupabaseSocialMethod(method: AuthMethod | null | undefined): method is 'google' | 'linkedin' {
  return method === 'google' || method === 'linkedin';
}

function shouldReuseStoredSocialSession(
  storedSession: AuthSession | null,
  supabaseSession: Awaited<ReturnType<typeof getSupabaseSession>>
) {
  if (!storedSession || storedSession.method !== 'linkedin' || !supabaseSession?.user) {
    return false;
  }

  const storedUserId = storedSession.user?.id?.trim();

  if (!storedUserId) {
    return false;
  }

  return storedUserId === supabaseSession.user.id;
}

function resolveSessionFromSupabaseState(
  supabaseSession: NonNullable<Awaited<ReturnType<typeof getSupabaseSession>>>,
  storedSession: AuthSession | null,
  preferLinkedIn: boolean
) : AuthSession {
  if (shouldReuseStoredSocialSession(storedSession, supabaseSession)) {
    return storedSession as AuthSession;
  }

  return createSocialAuthSessionFromSupabaseSession(
    supabaseSession,
    preferLinkedIn ? 'linkedin' : undefined
  );
}

function isRecoverableSupabaseSessionError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const normalizedName = error.name.toLowerCase();
  const normalizedMessage = error.message.toLowerCase();

  if (normalizedName === 'authsessionmissingerror') {
    return true;
  }

  return (
    normalizedName === 'authapierror' &&
    normalizedMessage.includes('refresh token') &&
    (normalizedMessage.includes('invalid') || normalizedMessage.includes('not found'))
  );
}

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [isHydrated, setIsHydrated] = React.useState(false);
  const [authPhase, setAuthPhase] = React.useState<AuthPhase>('signed_out');
  const [session, setSession] = React.useState<AuthSession | null>(null);
  const authBypassEnabled = React.useMemo(() => isAuthBypassEnabled(), []);
  const sessionRef = React.useRef<AuthSession | null>(null);

  React.useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const signOut = React.useCallback(async () => {
    const shouldSignOutSupabase = isSupabaseSocialMethod(session?.method);

    await Promise.all([clearPersistedAuth(), clearPendingLinkedInAuth()]);

    if (shouldSignOutSupabase) {
      await signOutSupabase();
    }

    setAuthPhase('signed_out');
    setSession(null);
  }, [session?.method]);

  const enterPendingOnboarding = React.useCallback(async () => {
    if (!session) {
      throw new Error('No auth session is available for onboarding.');
    }

    const nextSession: AuthSession = {
      ...session,
      authPhase: 'pending_onboarding',
      onboardingCompletedAt: session.onboardingCompletedAt ?? null,
      user: session.user
        ? {
            ...session.user,
            is_active: false,
            registration_step: Math.max(session.user.registration_step, 4),
          }
        : null,
    };

    await replaceStoredSession(nextSession);
    setSession(nextSession);
    setAuthPhase(nextSession.authPhase);
  }, [session]);

  const completeOnboarding = React.useCallback(async () => {
    if (!session) {
      return;
    }

    const completedAt = new Date().toISOString();
    const nextSession: AuthSession = {
      ...session,
      authPhase: 'authenticated',
      onboardingCompletedAt: completedAt,
      user: session.user
        ? {
            ...session.user,
            is_active: true,
            registration_step: Math.max(session.user.registration_step, 5),
          }
        : null,
    };

    await replaceStoredSession(nextSession);
    setSession(nextSession);
    setAuthPhase(nextSession.authPhase);
  }, [session]);

  React.useEffect(() => {
    let isActive = true;

    const hydrate = async () => {
      try {
        const [{ token, session: storedSession }, pendingLinkedInAuth, supabaseSession] = await Promise.all([
          getPersistedAuthState(),
          getPendingLinkedInAuth(),
          getSupabaseSession(),
        ]);

        if (!isActive) {
          return;
        }

        if (supabaseSession?.user) {
          const nextSession = resolveSessionFromSupabaseState(
            supabaseSession,
            storedSession,
            Boolean(pendingLinkedInAuth)
          );

          await Promise.all([
            replaceStoredSession(nextSession),
            syncSupabaseRealtimeAuth(supabaseSession),
            pendingLinkedInAuth ? clearPendingLinkedInAuth() : Promise.resolve(),
          ]);

          if (!isActive) {
            return;
          }

          setSession(nextSession);
          setAuthPhase(nextSession.authPhase);
          setIsHydrated(true);
          return;
        }

        if (token && storedSession) {
          setSession(storedSession);
          setAuthPhase(storedSession.authPhase);
        } else {
          await clearPersistedAuth();
          setSession(null);
          setAuthPhase('signed_out');
        }

        setIsHydrated(true);
      } catch (error) {
        if (!isRecoverableSupabaseSessionError(error)) {
          throw error;
        }

        if (__DEV__) {
          console.warn('[auth] cleared stale Supabase session during hydrate', error);
        }

        await Promise.allSettled([
          clearPersistedAuth(),
          clearSupabaseSession(),
          syncSupabaseRealtimeAuth(null),
        ]);

        if (!isActive) {
          return;
        }

        setSession(null);
        setAuthPhase('signed_out');
        setIsHydrated(true);
      }
    };

    void hydrate();

    return () => {
      isActive = false;
    };
  }, []);

  React.useEffect(() => {
    configureApiClient({
      getAccessToken: getStoredToken,
      onUnauthorized: async () => {
        if (isSupabaseSocialMethod(session?.method)) {
          return;
        }

        await signOut();
      },
    });
  }, [session?.method, signOut]);

  React.useEffect(() => {
    const syncAutoRefresh = (state: AppStateStatus) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    };

    syncAutoRefresh(AppState.currentState);
    const subscription = AppState.addEventListener('change', syncAutoRefresh);

    return () => {
      subscription.remove();
    };
  }, []);

  React.useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, nextSupabaseSession) => {
      if (event === 'SIGNED_OUT') {
        if (isSupabaseSocialMethod(sessionRef.current?.method)) {
          await clearPersistedAuth();
          setSession(null);
          setAuthPhase('signed_out');
        }

        return;
      }

      if (
        (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') &&
        nextSupabaseSession?.user
      ) {
        const [{ session: storedSession }, pendingLinkedInAuth] = await Promise.all([
          getPersistedAuthState(),
          getPendingLinkedInAuth(),
        ]);
        const nextSession = resolveSessionFromSupabaseState(
          nextSupabaseSession,
          storedSession,
          Boolean(pendingLinkedInAuth)
        );

        await Promise.all([
          replaceStoredSession(nextSession),
          syncSupabaseRealtimeAuth(nextSupabaseSession),
          pendingLinkedInAuth ? clearPendingLinkedInAuth() : Promise.resolve(),
        ]);
        setSession(nextSession);
        setAuthPhase(nextSession.authPhase);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = React.useCallback(
    async (payload: LoginPayload) => {
      const result = await loginWithApi(payload);
      setSession(result.session);
      setAuthPhase(result.session.authPhase);
      return result;
    },
    []
  );

  const signInWithGoogle = React.useCallback(async (fcmToken?: string | null) => {
    const googleResult = await signInWithGoogleToken();
    const result = await loginWithGoogleSupabase({
      accessToken: googleResult.accessToken,
      displayName: googleResult.displayName,
      email: googleResult.email,
      fcmToken,
      idToken: googleResult.idToken,
    });

    setSession(result.session);
    setAuthPhase(result.session.authPhase);

    return result;
  }, []);

  const signInWithLinkedIn = React.useCallback(async () => {
    return startLinkedInOAuth();
  }, []);

  const completeLinkedInOAuth = React.useCallback(async (url: string) => {
    console.log('[auth][linkedin] completing oauth callback');

    const supabaseSession = await completeLinkedInOAuthFlow(url);
    const nextSession = createSocialAuthSessionFromSupabaseSession(
      supabaseSession,
      'linkedin'
    );

    await Promise.all([replaceStoredSession(nextSession), clearPendingLinkedInAuth()]);
    setSession(nextSession);
    setAuthPhase(nextSession.authPhase);

    console.log('[auth][linkedin] frontend session established', {
      authPhase: nextSession.authPhase,
      email: nextSession.email,
    });
  }, []);

  const register = React.useCallback(
    async (payload: RegisterPayload) => {
      console.log('registering', payload);
      const result = await registerWithApi(payload);
      setSession(result.session);
      setAuthPhase(result.session.authPhase);
      return result;
    },
    []
  );

  const sendEmailOtp = React.useCallback(async () => {
    const result = await sendEmailOtpWithMock();
    setSession(result.session);
    setAuthPhase(result.session.authPhase);
    return result;
  }, []);

  const resendEmailOtp = React.useCallback(async () => {
    const result = await resendEmailOtpWithMock();
    setSession(result.session);
    setAuthPhase(result.session.authPhase);
    return result;
  }, []);

  const sendWhatsappOtp = React.useCallback(async (payload: WhatsappOtpPayload) => {
    const result = await sendWhatsappOtpWithApi(payload);
    setSession(result.session);
    setAuthPhase(result.session.authPhase);
    return result;
  }, []);

  const resendWhatsappOtp = React.useCallback(async () => {
    const result = await resendWhatsappOtpWithApi();
    setSession(result.session);
    setAuthPhase(result.session.authPhase);
    return result;
  }, []);

  const verifyEmailOtp = React.useCallback(async (payload: VerifyEmailPayload) => {
    const result = await verifyEmailOtpWithMock(payload);
    setSession(result.session);
    setAuthPhase(result.session.authPhase);
    return result;
  }, []);

  const verifyWhatsappOtp = React.useCallback(async (payload: VerifyWhatsappPayload) => {
    const result = await verifyWhatsappOtpWithApi(payload);
    setSession(result.session);
    setAuthPhase(result.session.authPhase);
    return result;
  }, []);

  const enterWithDevBypass = React.useCallback(async () => {
    const nextSession = await enterWithDevBypassSession();
    setSession(nextSession);
    setAuthPhase(nextSession.authPhase);
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      authPhase,
      completeOnboarding,
      enterWithDevBypass,
      enterPendingOnboarding,
      isHydrated,
      isAuthBypassEnabled: authBypassEnabled,
      login,
      register,
      resendEmailOtp,
      resendWhatsappOtp,
      sendEmailOtp,
      sendWhatsappOtp,
      session,
      completeLinkedInOAuth,
      signInWithGoogle,
      signInWithLinkedIn,
      signOut,
      verifyEmailOtp,
      verifyWhatsappOtp,
    }),
    [
      authPhase,
      authBypassEnabled,
      completeOnboarding,
      enterWithDevBypass,
      enterPendingOnboarding,
      isHydrated,
      login,
      register,
      resendEmailOtp,
      resendWhatsappOtp,
      sendEmailOtp,
      sendWhatsappOtp,
      session,
      completeLinkedInOAuth,
      signInWithGoogle,
      signInWithLinkedIn,
      signOut,
      verifyEmailOtp,
      verifyWhatsappOtp,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const value = React.useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return value;
}
