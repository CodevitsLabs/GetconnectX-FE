import type {
  TeamOverviewResponse,
  TeamEntityOption,
  UpdateStartupRequest,
  UpdateStartupResponse,
} from '../types/team.types';

const INDUSTRY_LABELS: Record<string, string> = {
  ai: 'AI & Automation',
  fintech: 'Fintech',
  healthtech: 'Healthtech',
  edtech: 'Edtech',
  climate: 'Climate',
  consumer: 'Consumer',
  b2b_saas: 'B2B SaaS',
  marketplace: 'Marketplace',
  logistics: 'Logistics',
  web3: 'Web3',
  devtools: 'Developer Tools',
  media: 'Media & Creator Economy',
};

const STAGE_LABELS: Record<string, string> = {
  idea: 'Idea',
  mvp: 'MVP',
  live: 'Live',
};

function cloneResponse(response: TeamOverviewResponse) {
  return JSON.parse(JSON.stringify(response)) as TeamOverviewResponse;
}

function mapIndustry(industryId: string): TeamEntityOption {
  return {
    id: industryId,
    label: INDUSTRY_LABELS[industryId] ?? industryId,
  };
}

function mapStage(stageId: string): TeamEntityOption {
  return {
    id: stageId,
    label: STAGE_LABELS[stageId] ?? stageId,
  };
}

const initialMockResponse: TeamOverviewResponse = {
  success: true,
  data: {
    startup: {
      id: 'stp_local_demo',
      name: 'My Startup',
      description: 'AI-powered supply chain platform for SMEs in Southeast Asia',
      industry: {
        id: 'fintech',
        label: 'Fintech',
      },
      stage: {
        id: 'mvp',
        label: 'MVP',
      },
    },
    teamCompleteness: {
      percent: 50,
      filledRoles: 2,
      targetRoles: 4,
    },
    members: [
      {
        id: 'tm_founder',
        userId: 'usr_founder',
        name: 'Founder',
        role: {
          id: 'business_founder',
          label: 'Business',
        },
        commitment: 'full_time',
        equityPercent: 40,
        isCurrentUser: true,
        avatarUrl: null,
        status: 'active',
      },
      {
        id: 'tm_ardi',
        userId: 'usr_ardi',
        name: 'Ardi Wijaya',
        role: {
          id: 'engineer',
          label: 'Engineering',
        },
        commitment: 'full_time',
        equityPercent: 25,
        isCurrentUser: false,
        avatarUrl:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
        status: 'active',
      },
    ],
    requiredRoles: [
      {
        id: 'product_designer',
        label: 'Product Designer',
        status: 'open',
      },
      {
        id: 'growth_marketer',
        label: 'Growth Marketer',
        status: 'open',
      },
    ],
    missingRoles: [
      {
        id: 'product_designer',
        label: 'Product Designer',
      },
      {
        id: 'growth_marketer',
        label: 'Growth Marketer',
      },
    ],
  },
};

let mockTeamOverviewState = cloneResponse(initialMockResponse);

export function getMockTeamOverviewResponse(startupId = 'stp_local_demo'): TeamOverviewResponse {
  const nextResponse = cloneResponse(mockTeamOverviewState);
  nextResponse.data.startup.id = startupId;
  return nextResponse;
}

export function applyMockStartupUpdate(
  startupId: string,
  payload: UpdateStartupRequest
): UpdateStartupResponse {
  const nextResponse = cloneResponse(mockTeamOverviewState);

  if (payload.name !== undefined) {
    nextResponse.data.startup.name = payload.name.trim();
  }

  if (payload.description !== undefined) {
    nextResponse.data.startup.description = payload.description.trim();
  }

  if (payload.industryId !== undefined) {
    nextResponse.data.startup.industry = mapIndustry(payload.industryId);
  }

  if (payload.stageId !== undefined) {
    nextResponse.data.startup.stage = mapStage(payload.stageId);
  }

  nextResponse.data.startup.id = startupId;
  mockTeamOverviewState = nextResponse;

  return {
    success: true,
    message: 'Startup updated',
    data: {
      ...nextResponse.data.startup,
      updatedAt: new Date().toISOString(),
    },
  };
}
