import { Redirect } from 'expo-router';

import { useAuth } from '../hooks/use-auth';
import { getRouteForAuthPhase } from '../utils/auth-routing';

export function AuthIndexRedirect() {
  const { authPhase, isHydrated } = useAuth();

  if (!isHydrated) {
    return null;
  }

  return <Redirect href={getRouteForAuthPhase(authPhase)} />;
}
