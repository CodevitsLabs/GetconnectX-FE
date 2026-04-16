import type {
  CreateStartupInvitationRequest,
  CreateStartupInvitationResponse,
  FetchStartupInvitationsResponse,
  RespondToStartupInvitationRequest,
  RespondToStartupInvitationResponse,
  StartupInvitation,
  TeamOverviewResponse,
} from '../types/team.types';

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
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

const initialMockInvitations: StartupInvitation[] = [
  {
    id: 'inv_atlas_cto',
    recipientEmail: 'builder@connectx.app',
    status: 'pending',
    sentAt: '2026-04-12T09:30:00.000Z',
    expiresAt: '2026-04-26T09:30:00.000Z',
    startup: {
      id: 'stp_atlas_commerce',
      name: 'Atlas Commerce',
      description: 'B2B commerce tools helping Indonesian distributors manage catalog, credit, and repeat orders.',
      industry: {
        id: 'b2b_saas',
        label: 'B2B SaaS',
      },
      stage: {
        id: 'mvp',
        label: 'MVP',
      },
    },
    inviter: {
      userId: 'usr_nadia',
      name: 'Nadia Prasetyo',
      email: 'nadia@atlascommerce.app',
      avatarUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80',
      roleLabel: 'Founder',
    },
  },
  {
    id: 'inv_klinik_ops',
    recipientEmail: 'builder@connectx.app',
    status: 'pending',
    sentAt: '2026-04-14T03:15:00.000Z',
    expiresAt: '2026-04-28T03:15:00.000Z',
    startup: {
      id: 'stp_klinik_ops',
      name: 'KlinikOps',
      description: 'Workflow software for multi-branch clinics to manage staffing, patient queues, and finance reconciliation.',
      industry: {
        id: 'healthtech',
        label: 'Healthtech',
      },
      stage: {
        id: 'live',
        label: 'Live',
      },
    },
    inviter: {
      userId: 'usr_ryan',
      name: 'Ryan Kusuma',
      email: 'ryan@klinikops.app',
      avatarUrl:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=80',
      roleLabel: 'CEO',
    },
  },
];

let mockTeamOverviewState = cloneValue(initialMockResponse);
let mockStartupInvitationsState = cloneValue(initialMockInvitations);
let mockAcceptedStartupId: string | null = null;

export function getMockTeamOverviewResponse(startupId = 'stp_local_demo'): TeamOverviewResponse {
  const nextResponse = cloneValue(mockTeamOverviewState);
  nextResponse.data.startup.id = startupId;
  return nextResponse;
}

export function getMockStartupInvitationsResponse(): FetchStartupInvitationsResponse {
  return {
    success: true,
    data: {
      invitations: cloneValue(mockStartupInvitationsState),
    },
  };
}

export function createMockStartupInvitationResponse(
  payload: CreateStartupInvitationRequest
): CreateStartupInvitationResponse {
  return {
    success: true,
    message: `Invitation sent to ${payload.email.trim().toLowerCase()}`,
    data: {
      invitationId: `inv_${Date.now().toString(36)}`,
      email: payload.email.trim().toLowerCase(),
      status: 'pending',
    },
  };
}

function syncMockOverviewFromInvitation(invitation: StartupInvitation) {
  mockTeamOverviewState = {
    ...mockTeamOverviewState,
    data: {
      ...mockTeamOverviewState.data,
      startup: cloneValue(invitation.startup),
    },
  };
}

export function getMockAcceptedStartupId() {
  return mockAcceptedStartupId;
}

export function respondToMockStartupInvitation(
  invitationId: string,
  payload: RespondToStartupInvitationRequest
): RespondToStartupInvitationResponse {
  const invitationIndex = mockStartupInvitationsState.findIndex((invitation) => invitation.id === invitationId);

  if (invitationIndex === -1) {
    throw new Error(`Unknown mock invitation: ${invitationId}`);
  }

  const invitation = mockStartupInvitationsState[invitationIndex];
  const actedAt = new Date().toISOString();
  const nextStatus = payload.decision === 'accept' ? 'accepted' : 'denied';

  mockStartupInvitationsState = mockStartupInvitationsState.map((currentInvitation) =>
    currentInvitation.id === invitationId
      ? {
          ...currentInvitation,
          status: nextStatus,
        }
      : currentInvitation
  );

  if (nextStatus === 'accepted') {
    mockAcceptedStartupId = invitation.startup.id;
    syncMockOverviewFromInvitation(invitation);
  }

  return {
    success: true,
    message:
      payload.decision === 'accept'
        ? `You joined ${invitation.startup.name}.`
        : `Invitation to ${invitation.startup.name} declined.`,
    data: {
      invitationId,
      status: nextStatus,
      startupId: invitation.startup.id,
      actedAt,
    },
  };
}
