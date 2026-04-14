import { ApiError } from '@shared/services/api';

import type {
  SpotlightActivationDeniedResponse,
  SpotlightActivationSuccessResponse,
  SwipeActionDeniedResponse,
  SwipeActionSuccessResponse,
} from '../types/discovery.types';

export const DISCOVERY_ERROR_STATUS = {
  superLikeRequiresBoost: 409,
  spotlightAlreadyActive: 409,
  spotlightRequiresCredit: 409,
} as const;

export function isSwipeActionDeniedResponse(payload: unknown): payload is SwipeActionDeniedResponse {
  if (!payload || typeof payload !== 'object' || !('error' in payload)) {
    return false;
  }

  const error = payload.error;

  if (!error || typeof error !== 'object' || !('code' in error)) {
    return false;
  }

  return error.code === 'DISCOVERY_SUPER_LIKE_REQUIRES_BOOST';
}

export function isSuperLikeRequiresBoostError(error: unknown): error is ApiError {
  if (!(error instanceof ApiError) || error.status !== DISCOVERY_ERROR_STATUS.superLikeRequiresBoost) {
    return false;
  }

  return isSwipeActionDeniedResponse(error.payload);
}

export function isSpotlightActivationDeniedResponse(
  payload: unknown
): payload is SpotlightActivationDeniedResponse {
  if (!payload || typeof payload !== 'object' || !('error' in payload)) {
    return false;
  }

  const error = payload.error;

  if (!error || typeof error !== 'object' || !('code' in error)) {
    return false;
  }

  return (
    error.code === 'DISCOVERY_SPOTLIGHT_REQUIRES_CREDIT' ||
    error.code === 'DISCOVERY_SPOTLIGHT_ALREADY_ACTIVE'
  );
}

export function isSwipeActionSuccessResponse(payload: unknown): payload is SwipeActionSuccessResponse {
  return Boolean(
    payload &&
      typeof payload === 'object' &&
      'success' in payload &&
      payload.success === true &&
      'data' in payload
  );
}

export function isSpotlightActivationSuccessResponse(
  payload: unknown
): payload is SpotlightActivationSuccessResponse {
  return Boolean(
    payload &&
      typeof payload === 'object' &&
      'success' in payload &&
      payload.success === true &&
      'data' in payload
  );
}
