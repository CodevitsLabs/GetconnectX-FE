import 'react-native-url-polyfill/auto';
import 'expo-sqlite/localStorage/install';

import { createClient, type Session } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL. Set it before using Supabase-backed auth or chat.'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_ANON_KEY. Set it before using Supabase-backed auth or chat.'
  );
}

if (supabaseAnonKey.startsWith('sb_secret_')) {
  throw new Error(
    'EXPO_PUBLIC_SUPABASE_ANON_KEY must be the public anon/publishable key, not a secret service key.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export async function getSupabaseSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export async function syncSupabaseRealtimeAuth(session?: Session | null) {
  await supabase.realtime.setAuth(session?.access_token ?? null);
}

export async function signOutSupabase() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function requireSupabaseUser() {
  const session = await getSupabaseSession();

  if (!session?.user) {
    throw new Error('A Supabase user session is required for this action.');
  }

  return session.user;
}
