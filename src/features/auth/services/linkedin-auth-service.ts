import * as AuthSession from 'expo-auth-session';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import type { Session as SupabaseSession } from '@supabase/supabase-js';

import { apiFetch } from '@shared/services/api';
import { supabase, syncSupabaseRealtimeAuth } from '@shared/services/supabase/client';

import { getLinkedInAuthConfig } from '../config/auth-config';

const LINKEDIN_NATIVE_CALLBACK_PATH = 'oauth/linkedin-callback';
const LINKEDIN_NATIVE_CALLBACK_URL = 'connectx://oauth/linkedin-callback';
const LINKEDIN_EXCHANGE_CODE_PATH = '/auth/linkedin';
const LINKEDIN_PENDING_AUTH_KEY = 'connectx.auth.linkedin.pending';
const LINKEDIN_SCOPES = 'openid profile email';

type PendingLinkedInAuth = {
  redirectUri: string;
  startedAt: string;
  state: string;
};

type LinkedInCodeExchangeResponse = {
  magicLink?: string | null;
};

type LinkedInCallbackParams = {
  accessToken: string | null;
  code: string | null;
  errorDescription: string | null;
  refreshToken: string | null;
  state: string | null;
};

WebBrowser.maybeCompleteAuthSession();

function decodeParamValue(value: string) {
  return decodeURIComponent(value.replace(/\+/g, ' '));
}

function parseUrlParams(url: string) {
  const segments = url.match(/[?#][^?#]+/g) ?? [];
  const params = new Map<string, string>();

  segments.forEach((segment) => {
    const rawEntries = segment.slice(1).split('&').filter(Boolean);

    rawEntries.forEach((entry) => {
      const [rawKey, ...rawValueParts] = entry.split('=');

      if (!rawKey) {
        return;
      }

      params.set(decodeParamValue(rawKey), decodeParamValue(rawValueParts.join('=')));
    });
  });

  return params;
}

async function setPendingLinkedInAuth(value: PendingLinkedInAuth) {
  await SecureStore.setItemAsync(LINKEDIN_PENDING_AUTH_KEY, JSON.stringify(value));
}

export async function getPendingLinkedInAuth() {
  const rawValue = await SecureStore.getItemAsync(LINKEDIN_PENDING_AUTH_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<PendingLinkedInAuth>;

    if (
      typeof parsedValue.redirectUri !== 'string' ||
      typeof parsedValue.startedAt !== 'string' ||
      typeof parsedValue.state !== 'string'
    ) {
      await SecureStore.deleteItemAsync(LINKEDIN_PENDING_AUTH_KEY);
      return null;
    }

    return parsedValue as PendingLinkedInAuth;
  } catch {
    await SecureStore.deleteItemAsync(LINKEDIN_PENDING_AUTH_KEY);
    return null;
  }
}

export async function clearPendingLinkedInAuth() {
  await SecureStore.deleteItemAsync(LINKEDIN_PENDING_AUTH_KEY);
}

function parseLinkedInCallbackUrl(url: string): LinkedInCallbackParams {
  const params = parseUrlParams(url);

  return {
    accessToken: params.get('access_token')?.trim() ?? null,
    code: params.get('code')?.trim() ?? null,
    errorDescription:
      params.get('error_description')?.trim() ??
      params.get('error')?.trim() ??
      params.get('message')?.trim() ??
      null,
    refreshToken: params.get('refresh_token')?.trim() ?? null,
    state: params.get('state')?.trim() ?? null,
  };
}

async function exchangeLinkedInCodeForMagicLink({
  code,
  redirectUri,
}: {
  code: string;
  redirectUri: string;
}) {
  const payload = { code, redirectUri };

  console.log('[auth][linkedin] backend exchange payload', payload);

  const response = await apiFetch<LinkedInCodeExchangeResponse>(LINKEDIN_EXCHANGE_CODE_PATH, {
    method: 'POST',
    body: payload as any,
  });

  console.log('[auth][linkedin] backend exchange response', response);

  const magicLink = response.magicLink?.trim();

  if (!magicLink) {
    throw new Error('LinkedIn backend exchange succeeded, but no Supabase magic link was returned.');
  }

  return magicLink;
}

async function setSupabaseSessionFromMagicLinkUrl(url: string) {
  const { accessToken, refreshToken } = parseLinkedInCallbackUrl(url);

  console.log('[auth][linkedin] magic-link callback params detected', {
    hasAccessToken: Boolean(accessToken),
    hasRefreshToken: Boolean(refreshToken),
  });

  if (!accessToken || !refreshToken) {
    throw new Error('Supabase magic link did not return a complete session.');
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    throw error;
  }

  if (!data.session?.user) {
    throw new Error('Supabase magic link succeeded, but no session was returned.');
  }

  await syncSupabaseRealtimeAuth(data.session);

  console.log('[auth][linkedin] supabase session created from magic link', {
    provider: data.session.user.app_metadata?.provider ?? null,
    userId: data.session.user.id,
  });

  return data.session;
}

export function getLinkedInRedirectUrl() {
  return AuthSession.makeRedirectUri({
    native: LINKEDIN_NATIVE_CALLBACK_URL,
    path: LINKEDIN_NATIVE_CALLBACK_PATH,
  });
}

export async function startLinkedInOAuth() {
  if (process.env.EXPO_OS === 'web') {
    throw new Error('LinkedIn Sign-In is only enabled in the native iOS and Android builds.');
  }

  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    throw new Error('LinkedIn Sign-In requires a development build or production app, not Expo Go.');
  }

  const { clientId } = getLinkedInAuthConfig();
  const redirectUri = getLinkedInRedirectUrl();
  const state = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');

  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', LINKEDIN_SCOPES);
  authUrl.searchParams.set('state', state);

  await setPendingLinkedInAuth({
    redirectUri,
    startedAt: new Date().toISOString(),
    state,
  });

  console.log('[auth][linkedin] opening oauth session', {
    authorizeUrl: authUrl.toString(),
    redirectTo: redirectUri,
    state,
  });

  try {
    const result = await WebBrowser.openAuthSessionAsync(authUrl.toString(), redirectUri);

    switch (result.type) {
      case 'success':
        console.log('[auth][linkedin] oauth session returned to app', {
          hasUrl: Boolean(result.url),
        });
        return result.url;
      case 'cancel':
        await clearPendingLinkedInAuth();
        throw new Error('LinkedIn Sign-In was cancelled.');
      case 'dismiss':
        await clearPendingLinkedInAuth();
        throw new Error('LinkedIn Sign-In was dismissed.');
      default:
        await clearPendingLinkedInAuth();
        throw new Error('LinkedIn Sign-In did not complete. Please try again.');
    }
  } catch (error) {
    await clearPendingLinkedInAuth();
    throw error;
  }
}

export async function completeLinkedInOAuth(url: string): Promise<SupabaseSession> {
  const callback = parseLinkedInCallbackUrl(url);
  const pendingAuth = await getPendingLinkedInAuth();

  console.log('[auth][linkedin] callback params detected', {
    hasAccessToken: Boolean(callback.accessToken),
    hasCode: Boolean(callback.code),
    hasError: Boolean(callback.errorDescription),
    hasRefreshToken: Boolean(callback.refreshToken),
    state: callback.state,
  });

  if (callback.errorDescription) {
    console.error('[auth][linkedin] callback returned an error', callback.errorDescription);
    throw new Error(callback.errorDescription);
  }

  if (!pendingAuth) {
    throw new Error('LinkedIn Sign-In could not be completed because the pending auth state was missing.');
  }

  if (callback.state && callback.state !== pendingAuth.state) {
    throw new Error('LinkedIn Sign-In returned with an unexpected state.');
  }

  if (callback.code) {
    const magicLink = await exchangeLinkedInCodeForMagicLink({
      code: callback.code,
      redirectUri: pendingAuth.redirectUri,
    });

    console.log('[auth][linkedin] opening Supabase magic link', {
      redirectTo: pendingAuth.redirectUri,
    });

    const magicLinkResult = await WebBrowser.openAuthSessionAsync(
      magicLink,
      pendingAuth.redirectUri
    );

    if (magicLinkResult.type !== 'success' || !magicLinkResult.url) {
      throw new Error('Supabase magic link did not return to the app successfully.');
    }

    return setSupabaseSessionFromMagicLinkUrl(magicLinkResult.url);
  }

  if (callback.accessToken && callback.refreshToken) {
    return setSupabaseSessionFromMagicLinkUrl(url);
  }

  throw new Error('LinkedIn callback did not include an authorization code or Supabase session tokens.');
}
