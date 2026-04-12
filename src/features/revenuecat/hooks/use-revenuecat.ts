import { useRevenueCatContext } from '../store/revenuecat-provider';

export function useRevenueCat() {
  return useRevenueCatContext();
}
