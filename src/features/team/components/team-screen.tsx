import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppCard, AppInput, AppText, AppTopBar } from '@shared/components';
import { Shadows } from '@shared/theme';

import {
  useCreateStartupInvitation,
  useRespondToStartupInvitation,
  useStartupInvitations,
  useTeamOverview,
} from '../hooks/use-team';
import { isNoActiveStartupError } from '../services/team-service';
import type { StartupInvitation, TeamMember } from '../types/team.types';

function getCommitmentLabel(value: string) {
  switch (value) {
    case 'full_time':
      return 'Full-time';
    case 'part_time':
      return 'Part-time';
    case 'flexible':
      return 'Flexible';
    default:
      return value.replace(/_/g, ' ');
  }
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function formatInvitationDate(value: string | null) {
  if (!value) {
    return 'No expiry';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function getInvitationStatusLabel(status: string) {
  switch (status) {
    case 'accepted':
      return 'Accepted';
    case 'denied':
      return 'Denied';
    case 'expired':
      return 'Expired';
    default:
      return 'Pending';
  }
}

function InfoPill({
  label,
}: {
  label: string;
}) {
  return (
    <View className="rounded-full border border-[#FF9A3E]/30 bg-[#FF9A3E]/10 px-4 py-2">
      <AppText className="text-[#FF9A3E]" variant="body">
        {label}
      </AppText>
    </View>
  );
}

function InvitationStatusPill({ status }: { status: string }) {
  const palette =
    status === 'accepted'
      ? {
          backgroundColor: 'rgba(52, 211, 153, 0.12)',
          borderColor: 'rgba(52, 211, 153, 0.28)',
          color: '#34D399',
        }
      : status === 'denied'
        ? {
            backgroundColor: 'rgba(248, 113, 113, 0.12)',
            borderColor: 'rgba(248, 113, 113, 0.28)',
            color: '#F87171',
          }
        : {
            backgroundColor: '#FF9A3E1A',
            borderColor: '#FF9A3E4D',
            color: '#FF9A3E',
          };

  return (
    <View
      className="rounded-full border px-3 py-1"
      style={{
        backgroundColor: palette.backgroundColor,
        borderColor: palette.borderColor,
      }}>
      <AppText className="text-[11px]" style={{ color: palette.color }} variant="label">
        {getInvitationStatusLabel(status)}
      </AppText>
    </View>
  );
}

function MemberCard({ member }: { member: TeamMember }) {
  return (
    <View
      className="flex-row items-center gap-4 rounded-[20px] border border-white/10 bg-[#2C2C2C] px-4 py-4"
      style={Shadows.card}>
      <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-[16px] bg-[#3A3A3C]">
        {member.avatarUrl ? (
          <Image contentFit="cover" source={{ uri: member.avatarUrl }} style={{ height: '100%', width: '100%' }} />
        ) : (
          <View className="h-12 w-12 items-center justify-center rounded-xl bg-[#FF9A3E]/10">
            <Ionicons color="#FF9A3E" name="briefcase" size={24} />
          </View>
        )}
      </View>

      <View className="flex-1 gap-1">
        <AppText variant="subtitle">{member.role.label}</AppText>
        <AppText className="text-[13px]" tone="muted">{member.name}</AppText>
        <AppText className="text-[13px] text-[#FF9A3E]" variant="bodyStrong">
          Equity: {member.equityPercent}%
        </AppText>
      </View>

      <View className="items-end gap-2">
        <View className="flex-row gap-2">
          {member.isCurrentUser && (
            <View className="rounded-full bg-[#FF9A3E]/15 px-2 py-0.5 border border-[#FF9A3E]/30">
              <AppText className="text-[11px] text-[#FF9A3E]" variant="label">You</AppText>
            </View>
          )}
        </View>
        <AppText className="text-[12px]" tone="muted">{getCommitmentLabel(member.commitment)}</AppText>
      </View>
    </View>
  );
}

function InvitationCard({
  invitation,
  isAcceptPending,
  isDenyPending,
  onAccept,
  onDeny,
}: {
  invitation: StartupInvitation;
  isAcceptPending: boolean;
  isDenyPending: boolean;
  onAccept: () => void;
  onDeny: () => void;
}) {
  const isPending = invitation.status === 'pending';

  return (
    <AppCard className="gap-4 bg-[#2C2C2C] border-white/10">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <AppText variant="subtitle">{invitation.startup.name}</AppText>
          <AppText className="text-[13px] leading-5" tone="muted">
            {invitation.startup.description}
          </AppText>
        </View>
        <InvitationStatusPill status={invitation.status} />
      </View>

      <View className="gap-2 rounded-[16px] border border-white/10 bg-[#343434] px-4 py-3">
        <View className="flex-row items-center gap-2">
          <Ionicons color="#FF9A3E" name="person-outline" size={16} />
          <AppText className="flex-1 text-[13px]" tone="muted">
            Invited by {invitation.inviter.name}
            {invitation.inviter.roleLabel ? ` • ${invitation.inviter.roleLabel}` : ''}
          </AppText>
        </View>
        <View className="flex-row items-center gap-2">
          <Ionicons color="#98A2B3" name="mail-outline" size={16} />
          <AppText className="flex-1 text-[13px]" tone="muted">
            {invitation.recipientEmail}
          </AppText>
        </View>
        <View className="flex-row items-center gap-2">
          <Ionicons color="#98A2B3" name="calendar-outline" size={16} />
          <AppText className="flex-1 text-[13px]" tone="muted">
            Sent {formatInvitationDate(invitation.sentAt)} • Expires {formatInvitationDate(invitation.expiresAt)}
          </AppText>
        </View>
      </View>

      <View className="flex-row flex-wrap gap-2">
        <InfoPill label={invitation.startup.industry.label} />
        <InfoPill label={invitation.startup.stage.label} />
      </View>

      {isPending ? (
        <View className="flex-row gap-3">
          <Pressable
            className="min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-[16px] border border-white/10 bg-[#3A3A3C] px-4 py-3"
            disabled={isAcceptPending || isDenyPending}
            onPress={onDeny}
            style={{ opacity: isAcceptPending || isDenyPending ? 0.65 : 1 }}>
            {isDenyPending ? (
              <ActivityIndicator color="#F5F7FA" size="small" />
            ) : (
              <Ionicons color="#F5F7FA" name="close-outline" size={18} />
            )}
            <AppText className="text-[#F5F7FA]" variant="bodyStrong">
              {isDenyPending ? 'Declining...' : 'Deny'}
            </AppText>
          </Pressable>
          <Pressable
            className="min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-[16px] bg-[#FF9A3E] px-4 py-3"
            disabled={isAcceptPending || isDenyPending}
            onPress={onAccept}
            style={{ opacity: isAcceptPending || isDenyPending ? 0.65 : 1 }}>
            {isAcceptPending ? (
              <ActivityIndicator color="#11131A" size="small" />
            ) : (
              <Ionicons color="#11131A" name="checkmark-outline" size={18} />
            )}
            <AppText className="text-[#11131A]" variant="bodyStrong">
              {isAcceptPending ? 'Accepting...' : 'Accept'}
            </AppText>
          </Pressable>
        </View>
      ) : (
        <AppText className="text-[13px]" tone="muted">
          This invitation is no longer actionable.
        </AppText>
      )}
    </AppCard>
  );
}

function MissingRoleCard({ label, onFind }: { label: string; onFind: () => void }) {
  return (
    <View
      className="flex-row items-center gap-4 rounded-[20px] border border-white/10 bg-[#2C2C2C] px-4 py-4"
      style={Shadows.card}>
      <View className="h-16 w-16 items-center justify-center rounded-[16px] bg-[#3A3A3C]">
        <View className="h-12 w-12 items-center justify-center rounded-xl bg-border/20">
          <Ionicons color="#98A2B3" name="add" size={28} />
        </View>
      </View>

      <View className="flex-1 gap-1">
        <AppText variant="subtitle">Early Team</AppText>
        <AppText className="text-[13px]" tone="muted">{label}</AppText>
      </View>

      <Pressable
        className="rounded-lg border border-[#FF9A3E] px-4 py-2"
        onPress={onFind}>
        <AppText className="text-[13px] text-[#FF9A3E]" variant="bodyStrong">Find</AppText>
      </Pressable>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
  variant,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  variant: 'primary' | 'secondary';
}) {
  const isPrimary = variant === 'primary';
  const iconColor = isPrimary ? '#11131A' : '#F5F7FA';

  return (
    <Pressable
      className={isPrimary
        ? 'min-h-[56px] flex-1 flex-row items-center justify-center gap-3 rounded-[18px] bg-[#FF9A3E] px-5 py-4'
        : 'min-h-[56px] flex-1 flex-row items-center justify-center gap-3 rounded-[18px] border border-white/10 bg-[#2C2C2C] px-5 py-4'}
      onPress={onPress}
      style={Shadows.card}>
      <Ionicons color={iconColor} name={icon} size={22} />
      <AppText
        className={isPrimary ? 'text-[#11131A]' : 'text-[#F5F7FA]'}
        variant="subtitle">
        {label}
      </AppText>
    </Pressable>
  );
}

export function TeamScreen() {
  const router = useRouter();
  const teamOverviewQuery = useTeamOverview();
  const isNoStartupState = teamOverviewQuery.isError && isNoActiveStartupError(teamOverviewQuery.error);
  const startupInvitationsQuery = useStartupInvitations(isNoStartupState);
  const respondToStartupInvitationMutation = useRespondToStartupInvitation();
  const createStartupInvitationMutation = useCreateStartupInvitation();
  const [inviteComposerVisible, setInviteComposerVisible] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteError, setInviteError] = React.useState<string | null>(null);
  const [inviteSuccessMessage, setInviteSuccessMessage] = React.useState<string | null>(null);
  const [invitationFeedbackMessage, setInvitationFeedbackMessage] = React.useState<string | null>(null);
  const [invitationActionError, setInvitationActionError] = React.useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const overview = teamOverviewQuery.data;
  const pendingInvitations =
    startupInvitationsQuery.data?.data.invitations.filter((invitation) => invitation.status === 'pending') ?? [];

  const navigateToHome = React.useCallback(() => {
    router.navigate('/(tabs)' as never);
  }, [router]);

  const openInviteComposer = React.useCallback(() => {
    setInviteComposerVisible(true);
    setInviteError(null);
    setInviteSuccessMessage(null);
  }, []);

  const closeInviteComposer = React.useCallback(() => {
    setInviteComposerVisible(false);
    setInviteEmail('');
    setInviteError(null);
  }, []);

  const handleInvite = React.useCallback(async () => {
    const normalizedEmail = inviteEmail.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      setInviteError('Enter a valid email address.');
      return;
    }

    setInviteError(null);
    setInviteSuccessMessage(null);

    try {
      const response = await createStartupInvitationMutation.mutateAsync({
        email: normalizedEmail,
      });

      setInviteComposerVisible(false);
      setInviteEmail('');
      setInviteSuccessMessage(response.message);
    } catch (error) {
      setInviteError(error instanceof Error ? error.message : 'Unable to send invitation.');
    }
  }, [createStartupInvitationMutation, inviteEmail]);

  const handleInvitationDecision = React.useCallback(
    async (invitationId: string, decision: 'accept' | 'deny') => {
      setInvitationActionError(null);
      setInvitationFeedbackMessage(null);

      try {
        const response = await respondToStartupInvitationMutation.mutateAsync({
          invitationId,
          payload: {
            decision,
          },
        });

        setInvitationFeedbackMessage(response.message);

        if (decision === 'accept') {
          await teamOverviewQuery.refetch();
        }
      } catch (error) {
        setInvitationActionError(
          error instanceof Error ? error.message : 'Unable to respond to this invitation right now.'
        );
      }
    },
    [respondToStartupInvitationMutation, teamOverviewQuery]
  );

  if (teamOverviewQuery.isPending && !overview) {
    return (
      <>
        <Stack.Screen options={{ title: 'Team', headerShown: false }} />
        <View className="flex-1" style={{ backgroundColor: '#262626' }}>
          <AppTopBar />
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              paddingBottom: insets.bottom + 96,
              paddingHorizontal: 20,
              paddingTop: 16,
            }}
            contentInsetAdjustmentBehavior="automatic">

            <AppCard className="gap-3">
              <AppText variant="subtitle">Loading team</AppText>
              <AppText tone="muted">
                Pulling the latest startup details and team structure.
              </AppText>
            </AppCard>
          </ScrollView>
        </View>
      </>
    );
  }

  if (teamOverviewQuery.isError && !overview) {
    return (
      <>
        <Stack.Screen options={{ title: 'Team', headerShown: false }} />
        <View className="flex-1" style={{ backgroundColor: '#262626' }}>
          <AppTopBar />
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              paddingBottom: insets.bottom + 96,
              paddingHorizontal: 20,
              paddingTop: 16,
            }}
            contentInsetAdjustmentBehavior="automatic">
            <AppCard className="gap-4">
              <View className="flex-row items-center gap-3">
                <Ionicons
                  color={isNoStartupState ? '#98A2B3' : '#FF9A3E'}
                  name={isNoStartupState ? 'people-outline' : 'alert-circle-outline'}
                  size={24}
                />
                <AppText variant="subtitle">
                  {isNoStartupState ? 'No startup team yet' : 'Unable to load team'}
                </AppText>
              </View>
              <AppText tone="muted">
                {isNoStartupState
                  ? 'This account is not linked to an active startup yet. Once you create or join a startup team, it will show up here.'
                  : 'We could not load your startup team right now. Try again in a moment.'}
              </AppText>
              <AppButton
                label={teamOverviewQuery.isRefetching ? 'Refreshing...' : 'Try Again'}
                onPress={() => {
                  void teamOverviewQuery.refetch();
                }}
                variant="secondary"
              />
            </AppCard>

            {isNoStartupState ? (
              <View className="mt-5 gap-4">
                <View className="px-1">
                  <AppText tone="muted" variant="label">Incoming Invitations</AppText>
                </View>

                {invitationFeedbackMessage ? (
                  <View className="rounded-[18px] border border-[#FF9A3E]/30 bg-[#FF9A3E]/10 px-4 py-3">
                    <AppText className="text-[#FF9A3E]" variant="bodyStrong">
                      {invitationFeedbackMessage}
                    </AppText>
                  </View>
                ) : null}

                {invitationActionError ? (
                  <View className="rounded-[16px] border border-danger/30 bg-danger-tint px-4 py-3">
                    <AppText tone="danger">{invitationActionError}</AppText>
                  </View>
                ) : null}

                {startupInvitationsQuery.isPending && !startupInvitationsQuery.data ? (
                  <AppCard className="gap-3 bg-[#2C2C2C] border-white/10">
                    <AppText variant="subtitle">Loading invitations</AppText>
                    <AppText tone="muted">
                      Checking whether any startup teams have invited you to join.
                    </AppText>
                  </AppCard>
                ) : null}

                {startupInvitationsQuery.isError ? (
                  <AppCard className="gap-3 bg-[#2C2C2C] border-white/10">
                    <AppText variant="subtitle">Unable to load invitations</AppText>
                    <AppText tone="muted">
                      We could not load your incoming invitations right now. Try again in a moment.
                    </AppText>
                    <AppButton
                      label={startupInvitationsQuery.isRefetching ? 'Refreshing...' : 'Try Again'}
                      onPress={() => {
                        void startupInvitationsQuery.refetch();
                      }}
                      variant="secondary"
                    />
                  </AppCard>
                ) : null}

                {!startupInvitationsQuery.isPending &&
                !startupInvitationsQuery.isError &&
                pendingInvitations.length === 0 ? (
                  <AppCard className="gap-3 bg-[#2C2C2C] border-white/10">
                    <AppText variant="subtitle">No pending invitations</AppText>
                    <AppText tone="muted">
                      You do not have any active startup invitations right now.
                    </AppText>
                  </AppCard>
                ) : null}

                {pendingInvitations.map((invitation) => {
                  const activeVariables = respondToStartupInvitationMutation.variables;
                  const isCurrentInvitation =
                    respondToStartupInvitationMutation.isPending &&
                    activeVariables?.invitationId === invitation.id;

                  return (
                    <InvitationCard
                      key={invitation.id}
                      invitation={invitation}
                      isAcceptPending={
                        isCurrentInvitation && activeVariables?.payload.decision === 'accept'
                      }
                      isDenyPending={
                        isCurrentInvitation && activeVariables?.payload.decision === 'deny'
                      }
                      onAccept={() => {
                        void handleInvitationDecision(invitation.id, 'accept');
                      }}
                      onDeny={() => {
                        void handleInvitationDecision(invitation.id, 'deny');
                      }}
                    />
                  );
                })}
              </View>
            ) : null}
          </ScrollView>
        </View>
      </>
    );
  }

  if (!overview) {
    return null;
  }

  const startup = overview.data.startup;

  return (
    <>
      <Stack.Screen options={{ title: '', headerShown: false }} />
      <View
        className="flex-1"
        style={{ backgroundColor: '#262626' }}>
        <AppTopBar />

        <View className="flex-row items-center gap-3 px-5 pb-6 pt-2">
          <Ionicons color="#FF9A3E" name="rocket" size={28} />
          <AppText className="text-2xl font-bold text-text">Startup Team Builder</AppText>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            gap: 24,
            paddingBottom: insets.bottom + 128,
            paddingHorizontal: 20,
          }}
          showsVerticalScrollIndicator={false}>


          <AppCard className="gap-6 bg-[#2C2C2C] border-white/10">
            <View className="gap-4">
              <View className="gap-1 border-b border-border/30 pb-4">
                <AppText tone="muted" variant="label">Startup Name</AppText>
                <AppText className="font-display text-xl font-bold text-text py-1">
                  {startup.name}
                </AppText>
              </View>

              <View className="gap-1 border-b border-border/30 pb-4">
                <AppText tone="muted" variant="label">Startup Idea</AppText>
                <AppText className="font-body text-[15px] leading-6 text-text-muted py-1">
                  {startup.description || 'No startup description yet.'}
                </AppText>
              </View>
            </View>

            <View className="flex-row gap-8">
              <View className="flex-1 gap-2">
                <AppText tone="muted" variant="label">Industry</AppText>
                <View className="flex-row flex-wrap gap-2">
                  <InfoPill label={startup.industry.label} />
                </View>
              </View>

              <View className="flex-1 gap-2">
                <AppText tone="muted" variant="label">Stage</AppText>
                <View className="flex-row flex-wrap gap-2">
                  <InfoPill label={startup.stage.label} />
                </View>
              </View>
            </View>
          </AppCard>

          <AppCard className="gap-4 bg-[#2C2C2C] border-white/10">
            <View className="flex-row items-center justify-between">
              <AppText className="text-[15px] font-semibold text-text">Team Completeness</AppText>
              <AppText className="text-[17px] font-bold text-[#FF9A3E]">
                {overview.data.teamCompleteness.percent}%
              </AppText>
            </View>

            <View className="h-2.5 overflow-hidden rounded-full bg-[#3A3A3C] border border-white/10">
              <View
                className="h-full rounded-full bg-[#FF9A3E]"
                style={{ width: `${overview.data.teamCompleteness.percent}%` }}
              />
            </View>
          </AppCard>

          <View className="gap-4">
            <AppText className="px-1" tone="muted" variant="label">Team Members</AppText>
            <View className="gap-3">
              {overview.data.members.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
              {overview.data.missingRoles.map((role) => (
                <MissingRoleCard key={role.id} label={role.label} onFind={navigateToHome} />
              ))}
            </View>
          </View>

          {inviteSuccessMessage ? (
            <View className="rounded-[18px] border border-[#FF9A3E]/30 bg-[#FF9A3E]/10 px-4 py-3">
              <AppText className="text-[#FF9A3E]" variant="bodyStrong">{inviteSuccessMessage}</AppText>
            </View>
          ) : null}

          {inviteComposerVisible ? (
            <AppCard className="gap-4 bg-[#2C2C2C] border-white/10">
              <View className="gap-1">
                <AppText variant="subtitle">Invite by email</AppText>
                <AppText tone="muted">
                  Send a team invitation using the startup linked to your current account.
                </AppText>
              </View>

              <AppInput
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                label="Email"
                className="bg-[#3A3A3C] border-none"
                onChangeText={(value) => {
                  setInviteEmail(value);
                  if (inviteError) {
                    setInviteError(null);
                  }
                }}
                placeholder="person@example.com"
                value={inviteEmail}
              />

              {inviteError ? (
                <View className="rounded-[16px] border border-danger/30 bg-danger-tint px-4 py-3">
                  <AppText tone="danger">{inviteError}</AppText>
                </View>
              ) : null}

              <View className="flex-row gap-3">
                <AppButton
                  className="flex-1 bg-[#3A3A3C] border-white/10"
                  disabled={createStartupInvitationMutation.isPending}
                  label="Cancel"
                  onPress={closeInviteComposer}
                  variant="secondary"
                />
                <Pressable
                  className="min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-[16px] bg-[#FF9A3E] px-4 py-3"
                  disabled={createStartupInvitationMutation.isPending}
                  onPress={() => {
                    void handleInvite();
                  }}
                  style={{ opacity: createStartupInvitationMutation.isPending ? 0.7 : 1 }}>
                  {createStartupInvitationMutation.isPending ? (
                    <ActivityIndicator color="#11131A" size="small" />
                  ) : (
                    <Ionicons color="#11131A" name="mail-outline" size={18} />
                  )}
                  <AppText className="text-[#11131A]" variant="bodyStrong">
                    {createStartupInvitationMutation.isPending ? 'Sending...' : 'Send Invite'}
                  </AppText>
                </Pressable>
              </View>
            </AppCard>
          ) : null}

          <View className="flex-row gap-4 mt-2">
            <ActionButton
              icon="search-outline"
              label="Find Members"
              onPress={navigateToHome}
              variant="primary"
            />
            <ActionButton
              icon="mail-outline"
              label="Invite"
              onPress={openInviteComposer}
              variant="secondary"
            />
          </View>
        </ScrollView>
      </View>
    </>
  );
}
