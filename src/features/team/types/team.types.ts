export type TeamEntityOption = {
  id: string;
  label: string;
};

export type TeamRole = TeamEntityOption;

export type MissingRole = TeamEntityOption;

export type TeamMemberCommitment = 'full_time' | 'part_time' | 'flexible' | string;

export type TeamMemberStatus = 'active' | 'pending' | 'inactive' | string;

export type TeamMember = {
  id: string;
  userId: string;
  name: string;
  role: TeamRole;
  commitment: TeamMemberCommitment;
  equityPercent: number;
  isCurrentUser: boolean;
  avatarUrl: string | null;
  status: TeamMemberStatus;
};

export type RequiredRole = TeamRole & {
  status: 'open' | 'filled' | string;
};

export type StartupTeamOverview = {
  id: string;
  name: string;
  description: string;
  industry: TeamEntityOption;
  stage: TeamEntityOption;
};

export type TeamCompleteness = {
  percent: number;
  filledRoles: number;
  targetRoles: number;
};

export type TeamOverviewData = {
  startup: StartupTeamOverview;
  teamCompleteness: TeamCompleteness;
  members: TeamMember[];
  requiredRoles: RequiredRole[];
  missingRoles: MissingRole[];
};

export type TeamOverviewResponse = {
  success: boolean;
  data: TeamOverviewData;
};

export type UpdateRequiredRolesRequest = {
  roleIds: string[];
};

export type UpdateRequiredRolesResponse = {
  success: boolean;
  message: string;
  data: {
    requiredRoles: RequiredRole[];
    missingRoles: MissingRole[];
    teamCompleteness: TeamCompleteness;
  };
};

export type CreateStartupInvitationRequest = {
  email: string;
};

export type CreateStartupInvitationResponse = {
  success: boolean;
  message: string;
  data: {
    invitationId: string;
    email: string;
    status: 'pending' | string;
  };
};

export type StartupInvitationStatus = 'pending' | 'accepted' | 'denied' | 'expired' | string;

export type StartupInvitationDecision = 'accept' | 'deny';

export type StartupInvitationStartupSummary = {
  id: string;
  name: string;
  description: string;
  industry: TeamEntityOption;
  stage: TeamEntityOption;
};

export type StartupInvitationInviterSummary = {
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  roleLabel: string | null;
};

export type StartupInvitation = {
  id: string;
  recipientEmail: string;
  status: StartupInvitationStatus;
  sentAt: string;
  expiresAt: string | null;
  startup: StartupInvitationStartupSummary;
  inviter: StartupInvitationInviterSummary;
};

export type FetchStartupInvitationsResponse = {
  success: boolean;
  data: {
    invitations: StartupInvitation[];
  };
};

export type RespondToStartupInvitationRequest = {
  decision: StartupInvitationDecision;
};

export type RespondToStartupInvitationResponse = {
  success: boolean;
  message: string;
  data: {
    invitationId: string;
    status: Exclude<StartupInvitationStatus, 'pending'>;
    startupId: string;
    actedAt: string;
  };
};

export type StartupOptionsResponse = {
  success: boolean;
  data: {
    industries: TeamEntityOption[];
    stages: TeamEntityOption[];
    roles: TeamRole[];
  };
};
