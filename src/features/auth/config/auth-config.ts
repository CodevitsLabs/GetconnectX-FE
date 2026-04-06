function parseBooleanEnv(value: string | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }

  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return null;
}

export function isAuthBypassEnabled() {
  const envValue = parseBooleanEnv(process.env.EXPO_PUBLIC_AUTH_BYPASS);

  if (envValue !== null) {
    return envValue;
  }

  return __DEV__;
}
