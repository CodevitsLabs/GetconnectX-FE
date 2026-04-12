import { Stack, useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@features/auth';
import { AppPill, AppStatCard, AppText } from '@shared/components';

import {
  useChatRooms,
  useMarkConversationRead,
  useRoomMessages,
  useRoomPresence,
  useRoomRealtime,
  useRoomTyping,
  useSendChatMessage,
} from '../presentation/hooks/use-chat';
import type { ChatRoom } from '../domain/models';

function createClientId(userId: string) {
  return `${userId}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
}

function formatRelativeTime(value: string) {
  const deltaInMinutes = Math.max(
    0,
    Math.round((Date.now() - new Date(value).getTime()) / (1000 * 60))
  );

  if (deltaInMinutes < 1) return 'just now';
  if (deltaInMinutes < 60) return `${deltaInMinutes}m ago`;

  const deltaInHours = Math.round(deltaInMinutes / 60);
  if (deltaInHours < 24) return `${deltaInHours}h ago`;

  return `${Math.round(deltaInHours / 24)}d ago`;
}

function getInitials(value: string) {
  return value
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function getPresenceLabel(onlineCount: number) {
  if (onlineCount <= 0) {
    return 'No one online';
  }

  if (onlineCount === 1) {
    return '1 person online';
  }

  return `${onlineCount} people online`;
}

function ChatExperimentNotice() {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-8 bg-[#111015]">
      <AppText className="text-white" variant="title">
        Chat experiment requires Google login
      </AppText>
      <AppText align="center" tone="muted">
        Sign in with Google to create a Supabase session, then seed a shared room in Supabase to
        test realtime chat across two devices.
      </AppText>
    </View>
  );
}

function ConversationRow({
  conversation,
  onPress,
}: {
  conversation: ChatRoom;
  onPress: () => void;
}) {
  const initials = getInitials(conversation.title);
  const time = formatRelativeTime(conversation.lastMessageAt);

  return (
    <Pressable className="active:opacity-70" onPress={onPress}>
      <View className="flex-row items-center gap-4 px-5 py-4">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-[#1E2030]">
          <AppText className="text-[#7B9CFF]" variant="bodyStrong">
            {initials}
          </AppText>
        </View>

        <View className="flex-1 gap-0.5">
          <View className="flex-row items-center justify-between">
            <AppText variant="bodyStrong">{conversation.title}</AppText>
            <AppText tone="soft" variant="code">
              {time}
            </AppText>
          </View>
          <View className="flex-row items-center justify-between gap-2">
            <AppText className="flex-1" numberOfLines={1} tone="muted" variant="body">
              {conversation.preview}
            </AppText>
            {conversation.unreadCount > 0 ? (
              <View className="h-5 w-5 items-center justify-center rounded-full bg-[#5D96FF]">
                <AppText className="text-[11px] text-white" variant="label">
                  {conversation.unreadCount}
                </AppText>
              </View>
            ) : null}
          </View>
          <AppPill
            className="self-start"
            label={conversation.kind === 'group' ? 'Group' : 'Direct'}
            tone="neutral"
          />
        </View>
      </View>
    </Pressable>
  );
}

export function ChatListScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const isChatEnabled = session?.method === 'google';
  const conversationsQuery = useChatRooms(isChatEnabled);
  const conversations = conversationsQuery.data ?? [];
  const unreadTotal = conversations.reduce((sum, room) => sum + room.unreadCount, 0);

  if (!isChatEnabled) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <ChatExperimentNotice />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 bg-[#111015]">
        <View className="px-5 pb-4 pt-14">
          <View className="flex-row items-center justify-between">
            <AppText className="text-white" variant="display">
              Inbox
            </AppText>
            <AppPill label="Supabase" tone="accent" />
          </View>

          <View className="mt-5 flex-row gap-3">
            <AppStatCard
              className="flex-1"
              detail="Shared room membership"
              label="Unread"
              tone={unreadTotal > 0 ? 'accent' : 'success'}
              value={String(unreadTotal)}
            />
            <AppStatCard
              className="flex-1"
              detail="Visible to this user"
              label="Threads"
              value={String(conversations.length)}
            />
          </View>
        </View>

        <View className="mx-5 h-px bg-[#1E2028]" />

        <ScrollView className="flex-1" contentInsetAdjustmentBehavior="automatic">
          {conversationsQuery.isLoading ? (
            <AppText className="px-5 py-6" tone="muted">
              Loading shared rooms...
            </AppText>
          ) : null}

          {conversationsQuery.error instanceof Error ? (
            <AppText className="px-5 py-6" tone="danger">
              {conversationsQuery.error.message}
            </AppText>
          ) : null}

          {conversations.map((conversation, index) => (
            <View key={conversation.id}>
              <ConversationRow
                conversation={conversation}
                onPress={() => {
                  router.push(`/conversation/${conversation.id}`);
                }}
              />
              {index < conversations.length - 1 ? (
                <View className="mx-5 h-px bg-[#1A1B22]" />
              ) : null}
            </View>
          ))}

          {conversations.length === 0 && !conversationsQuery.isLoading ? (
            <View className="items-center gap-2 px-5 py-16">
              <AppText className="text-[#555A67]" variant="display">
                Chat
              </AppText>
              <AppText align="center" tone="muted">
                No Supabase rooms are available for this user yet. Seed a test room and add both
                Google users to `chat_room_members`.
              </AppText>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </>
  );
}

export function ChatConversationScreen({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const { session } = useAuth();
  const isChatEnabled = session?.method === 'google';
  const [draftMessage, setDraftMessage] = React.useState('');
  const conversationsQuery = useChatRooms(isChatEnabled);
  const conversation = conversationsQuery.data?.find((room) => room.id === conversationId) ?? null;
  const messagesQuery = useRoomMessages(conversationId, isChatEnabled);
  const markConversationReadMutation = useMarkConversationRead(conversationId);
  const sendMessageMutation = useSendChatMessage(conversationId);
  const { typingState } = useRoomRealtime(conversationId, isChatEnabled);
  const presence = useRoomPresence(conversationId, isChatEnabled);
  const scrollRef = React.useRef<ScrollView>(null);
  const messages = messagesQuery.data?.items ?? [];

  useRoomTyping(conversationId, draftMessage, isChatEnabled);

  React.useEffect(() => {
    if (!isChatEnabled || !conversationId || !messagesQuery.isSuccess) {
      return;
    }

    if (!conversation?.unreadCount || markConversationReadMutation.isPending) {
      return;
    }

    void markConversationReadMutation.mutateAsync();
  }, [
    conversation?.unreadCount,
    conversationId,
    isChatEnabled,
    markConversationReadMutation,
    messagesQuery.isSuccess,
  ]);

  const handleSend = React.useCallback(async () => {
    const body = draftMessage.trim();

    if (!body || sendMessageMutation.isPending) {
      return;
    }

    await sendMessageMutation.mutateAsync({
      clientId: createClientId(session?.user?.id ?? 'anonymous'),
      content: body,
    });
    setDraftMessage('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [draftMessage, sendMessageMutation, session?.user?.id]);

  if (!isChatEnabled) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <ChatExperimentNotice />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-[#111015]"
        keyboardVerticalOffset={0}>
        <View className="flex-row items-center gap-3 px-4 pb-4 pt-14">
          <Pressable
            className="h-10 w-10 items-center justify-center rounded-full bg-[#17161D] active:opacity-70"
            onPress={() => router.back()}>
            <AppText className="text-[18px] text-[#7B9CFF]">←</AppText>
          </Pressable>

          <View className="h-10 w-10 items-center justify-center rounded-full bg-[#1E2030]">
            <AppText className="text-[#7B9CFF]" variant="bodyStrong">
              {conversation ? getInitials(conversation.title) : '?'}
            </AppText>
          </View>

          <View className="flex-1">
            <AppText className="text-white" variant="bodyStrong">
              {conversation?.title ?? 'Loading...'}
            </AppText>
            <AppText tone="soft" variant="code">
              {conversation?.kind === 'group' ? 'Group thread' : 'Direct thread'} ·{' '}
              {getPresenceLabel(presence.members.length)}
            </AppText>
          </View>

          <AppPill label="Realtime" tone="accent" />
        </View>

        <View className="mx-4 h-px bg-[#1E2028]" />

        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerClassName="gap-3 px-4 py-4"
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}>
          {messagesQuery.isLoading ? (
            <View className="items-center py-8">
              <ActivityIndicator color="#5D96FF" />
            </View>
          ) : null}

          {messagesQuery.error instanceof Error ? (
            <AppText className="py-4" tone="danger">
              {messagesQuery.error.message}
            </AppText>
          ) : null}

          {messages.map((message) => {
            const isOutgoing = message.senderId === session?.user?.id;

            return (
              <View
                key={message.id}
                className={isOutgoing ? 'items-end' : 'items-start'}>
                <View
                  className={
                    isOutgoing
                      ? 'max-w-[80%] rounded-[18px] rounded-br-[4px] bg-[#5D96FF] px-4 py-3'
                      : 'max-w-[80%] rounded-[18px] rounded-bl-[4px] border border-[#232229] bg-[#17161D] px-4 py-3'
                  }>
                  <AppText tone={isOutgoing ? 'inverse' : 'default'} variant="body">
                    {message.content}
                  </AppText>
                </View>
                <AppText className="mt-1 px-1" tone="soft" variant="code">
                  {formatRelativeTime(message.createdAt)}
                  {message.status === 'sending' ? ' · sending' : ''}
                  {message.status === 'failed' ? ' · failed' : ''}
                </AppText>
              </View>
            );
          })}
        </ScrollView>

        <View className="border-t border-[#1E2028] px-4 pb-8 pt-3">
          {typingState?.isTyping ? (
            <AppText className="mb-2" tone="soft" variant="code">
              {typingState.displayName} is typing...
            </AppText>
          ) : null}

          {presence.error ? (
            <AppText className="mb-2" tone="soft" variant="code">
              Presence unavailable: {presence.error.message}
            </AppText>
          ) : null}

          {sendMessageMutation.error instanceof Error ? (
            <AppText className="mb-2" tone="soft" variant="code">
              Send failed: {sendMessageMutation.error.message}
            </AppText>
          ) : null}

          <View className="flex-row items-end gap-3">
            <View className="flex-1 rounded-[20px] border border-[#232229] bg-[#17161D] px-4 py-3">
              <TextInput
                className="font-body text-[16px] text-white"
                multiline
                onChangeText={setDraftMessage}
                placeholder="Write a message..."
                placeholderTextColor="#5A5E6D"
                value={draftMessage}
              />
            </View>
            <Pressable
              className="h-12 w-12 items-center justify-center rounded-full bg-[#5D96FF] active:opacity-70"
              disabled={!draftMessage.trim() || sendMessageMutation.isPending}
              onPress={() => void handleSend()}
              style={{
                opacity: !draftMessage.trim() || sendMessageMutation.isPending ? 0.5 : 1,
              }}>
              {sendMessageMutation.isPending ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <AppText className="text-[20px] text-white">↑</AppText>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}
