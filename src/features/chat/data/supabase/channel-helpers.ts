import type { ChatPresenceMember, TypingState } from '../../domain/models';

type PresenceEntry = {
  displayName?: string;
  onlineAt?: string;
  userId?: string;
};

type PresenceState = Record<string, PresenceEntry[]>;

export function createRoomTopic(roomId: string) {
  return `room:${roomId}`;
}

export function createTypingPayload(input: {
  displayName: string;
  isTyping: boolean;
  roomId: string;
  userId: string;
}): TypingState {
  return {
    roomId: input.roomId,
    userId: input.userId,
    displayName: input.displayName,
    isTyping: input.isTyping,
    sentAt: new Date().toISOString(),
  };
}

export function mapPresenceState(state: PresenceState): ChatPresenceMember[] {
  const membersByUserId = new Map<string, ChatPresenceMember>();

  for (const entries of Object.values(state)) {
    for (const entry of entries) {
      if (!entry.userId) {
        continue;
      }

      const existingMember = membersByUserId.get(entry.userId);
      const nextOnlineAt = entry.onlineAt ?? new Date().toISOString();

      if (
        !existingMember ||
        existingMember.onlineAt.localeCompare(nextOnlineAt) < 0
      ) {
        membersByUserId.set(entry.userId, {
          userId: entry.userId,
          displayName: entry.displayName?.trim() || 'ConnectX Member',
          onlineAt: nextOnlineAt,
        });
      }
    }
  }

  return Array.from(membersByUserId.values()).sort((left, right) =>
    left.displayName.localeCompare(right.displayName)
  );
}
