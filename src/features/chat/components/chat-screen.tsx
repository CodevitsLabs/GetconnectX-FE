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

import { AppPill, AppStatCard, AppText } from '@shared/components';

import {
  LOCAL_MESSAGE_LIMIT,
  useAppendMockMessage,
  useChatConversations,
  useConversationMessages,
  useResetMockChatData,
} from '../hooks/use-mock-chat';
import type { ChatConversation } from '../types/chat.types';

// ─── helpers ──────────────────────────────────────────────────────────────────

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

// ─── conversation row ─────────────────────────────────────────────────────────

function ConversationRow({
  conversation,
  onPress,
}: {
  conversation: ChatConversation;
  onPress: () => void;
}) {
  const initials = getInitials(conversation.name);
  const time = formatRelativeTime(conversation.lastMessageAt);

  return (
    <Pressable className="active:opacity-70" onPress={onPress}>
      <View className="flex-row items-center gap-4 px-5 py-4">
        {/* Avatar */}
        <View className="h-12 w-12 items-center justify-center rounded-full bg-[#1E2030]">
          <AppText className="text-[#7B9CFF]" variant="bodyStrong">
            {initials}
          </AppText>
        </View>

        {/* Content */}
        <View className="flex-1 gap-0.5">
          <View className="flex-row items-center justify-between">
            <AppText variant="bodyStrong">{conversation.name}</AppText>
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

// ─── ChatListScreen ───────────────────────────────────────────────────────────

export function ChatListScreen() {
  const router = useRouter();
  const conversationsQuery = useChatConversations();
  const conversations = conversationsQuery.data ?? [];
  const resetChatMutation = useResetMockChatData(null);

  const unreadTotal = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 bg-[#111015]">
        {/* Header */}
        <View className="px-5 pb-4 pt-14">
          <View className="flex-row items-center justify-between">
            <AppText className="text-white" variant="display">
              Inbox
            </AppText>
            <Pressable
              className="rounded-full border border-[#2A2C36] bg-[#17161D] px-4 py-2 active:opacity-70"
              disabled={resetChatMutation.isPending}
              onPress={() => {
                void resetChatMutation.mutateAsync();
              }}>
              <AppText className="text-[#8F93A3]" variant="code">
                {resetChatMutation.isPending ? 'Resetting...' : 'Reset demo'}
              </AppText>
            </Pressable>
          </View>

          {/* Stats */}
          <View className="mt-5 flex-row gap-3">
            <AppStatCard
              className="flex-1"
              detail="Across all threads"
              label="Unread"
              tone={unreadTotal > 0 ? 'accent' : 'success'}
              value={String(unreadTotal)}
            />
            <AppStatCard
              className="flex-1"
              detail="Stored locally"
              label="Threads"
              value={String(conversations.length)}
            />
          </View>
        </View>

        {/* Divider */}
        <View className="mx-5 h-px bg-[#1E2028]" />

        {/* List */}
        <ScrollView className="flex-1" contentInsetAdjustmentBehavior="automatic">
          {conversationsQuery.isLoading ? (
            <AppText className="px-5 py-6" tone="muted">
              Loading threads...
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
                ✉️
              </AppText>
              <AppText align="center" tone="muted">
                No conversations yet. Tap "Reset demo" to populate.
              </AppText>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </>
  );
}

// ─── ChatConversationScreen ───────────────────────────────────────────────────

export function ChatConversationScreen({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const [draftMessage, setDraftMessage] = React.useState('');
  const conversationsQuery = useChatConversations();
  const conversation = conversationsQuery.data?.find((c) => c.id === conversationId) ?? null;
  const messagesQuery = useConversationMessages(conversationId);
  const appendMutation = useAppendMockMessage(conversationId);
  const messages = messagesQuery.data ?? [];
  const scrollRef = React.useRef<ScrollView>(null);

  const handleSend = React.useCallback(async () => {
    const body = draftMessage.trim();
    if (!body || appendMutation.isPending) return;
    await appendMutation.mutateAsync(body);
    setDraftMessage('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [appendMutation, draftMessage]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-[#111015]"
        keyboardVerticalOffset={0}>
        {/* Custom header */}
        <View className="flex-row items-center gap-3 px-4 pb-4 pt-14">
          <Pressable
            className="h-10 w-10 items-center justify-center rounded-full bg-[#17161D] active:opacity-70"
            onPress={() => router.back()}>
            <AppText className="text-[18px] text-[#7B9CFF]">←</AppText>
          </Pressable>

          <View className="h-10 w-10 items-center justify-center rounded-full bg-[#1E2030]">
            <AppText className="text-[#7B9CFF]" variant="bodyStrong">
              {conversation ? getInitials(conversation.name) : '?'}
            </AppText>
          </View>

          <View className="flex-1">
            <AppText className="text-white" variant="bodyStrong">
              {conversation?.name ?? 'Loading...'}
            </AppText>
            <AppText tone="soft" variant="code">
              {conversation?.kind === 'group' ? 'Group thread' : 'Direct'} ·{' '}
              {LOCAL_MESSAGE_LIMIT} msg limit
            </AppText>
          </View>

          {conversation?.unreadCount ? (
            <AppPill label={`${conversation.unreadCount} unread`} tone="accent" />
          ) : null}
        </View>

        <View className="mx-4 h-px bg-[#1E2028]" />

        {/* Messages */}
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

          {messages.map((message) => (
            <View
              key={message.id}
              className={message.direction === 'outgoing' ? 'items-end' : 'items-start'}>
              <View
                className={
                  message.direction === 'outgoing'
                    ? 'max-w-[80%] rounded-[18px] rounded-br-[4px] bg-[#5D96FF] px-4 py-3'
                    : 'max-w-[80%] rounded-[18px] rounded-bl-[4px] border border-[#232229] bg-[#17161D] px-4 py-3'
                }>
                <AppText
                  tone={message.direction === 'outgoing' ? 'inverse' : 'default'}
                  variant="body">
                  {message.body}
                </AppText>
              </View>
              <AppText className="mt-1 px-1" tone="soft" variant="code">
                {formatRelativeTime(message.createdAt)}
              </AppText>
            </View>
          ))}
        </ScrollView>

        {/* Composer */}
        <View className="border-t border-[#1E2028] px-4 pb-8 pt-3">
          {appendMutation.error instanceof Error ? (
            <AppText className="mb-2" tone="soft" variant="code">
              ⚠ {appendMutation.error.message}
            </AppText>
          ) : null}
          <View className="flex-row items-end gap-3">
            <View className="flex-1 rounded-[20px] border border-[#232229] bg-[#17161D] px-4 py-3">
              <TextInput
                className="font-body text-[16px] text-white"
                multiline
                onChangeText={setDraftMessage}
                placeholder="Write a message…"
                placeholderTextColor="#5A5E6D"
                value={draftMessage}
              />
            </View>
            <Pressable
              className="h-12 w-12 items-center justify-center rounded-full bg-[#5D96FF] active:opacity-70"
              disabled={!draftMessage.trim() || appendMutation.isPending}
              onPress={() => void handleSend()}
              style={{
                opacity: !draftMessage.trim() || appendMutation.isPending ? 0.5 : 1,
              }}>
              {appendMutation.isPending ? (
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
