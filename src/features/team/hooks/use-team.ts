import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@features/auth';

import { getMockTeamOverviewResponse } from '../mock/team.mock';
import { fetchTeamOverview, updateStartup } from '../services/team-service';
import type {
  TeamOverviewResponse,
  UpdateStartupRequest,
  UpdateStartupResponse,
} from '../types/team.types';

export const teamQueryKeys = {
  overview: (startupId: string) => ['team', 'overview', startupId] as const,
};

function mergeTeamOverview(
  baseResponse: TeamOverviewResponse,
  updateResponse: UpdateStartupResponse
): TeamOverviewResponse {
  return {
    ...baseResponse,
    success: updateResponse.success,
    data: {
      ...baseResponse.data,
      startup: {
        id: updateResponse.data.id,
        name: updateResponse.data.name,
        description: updateResponse.data.description,
        industry: updateResponse.data.industry,
        stage: updateResponse.data.stage,
      },
    },
  };
}

export function useCurrentStartupId() {
  const { session } = useAuth();
  return session?.user?.id ? `stp_${session.user.id}` : 'stp_local_demo';
}

export function useTeamOverview(startupId: string) {
  return useQuery({
    queryKey: teamQueryKeys.overview(startupId),
    queryFn: () => fetchTeamOverview(startupId),
  });
}

export function useUpdateStartup(startupId: string) {
  const queryClient = useQueryClient();
  const latestRequestIdRef = React.useRef(0);

  return useMutation({
    mutationFn: async ({
      payload,
      requestId,
    }: {
      payload: UpdateStartupRequest;
      requestId: number;
    }) => ({
      requestId,
      response: await updateStartup(startupId, payload),
    }),
    onMutate: ({ requestId }) => {
      latestRequestIdRef.current = Math.max(latestRequestIdRef.current, requestId);
    },
    onSuccess: async ({ requestId, response }) => {
      if (requestId !== latestRequestIdRef.current) {
        return;
      }

      queryClient.setQueryData<TeamOverviewResponse>(teamQueryKeys.overview(startupId), (current) =>
        mergeTeamOverview(current ?? getMockTeamOverviewResponse(startupId), response)
      );

      await queryClient.invalidateQueries({ queryKey: teamQueryKeys.overview(startupId) });
    },
  });
}
