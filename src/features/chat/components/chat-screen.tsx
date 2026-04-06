import { Stack } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import {
  AppButton,
  AppCard,
  AppInput,
  AppListItem,
  AppPill,
  AppStatCard,
  AppText,
} from '@shared/components';

import {
  LOCAL_MESSAGE_LIMIT,
  useAppendMockMessage,
  useChatConversations,
  useConversationMessages,
  useResetMockChatData,
} from '../hooks/use-mock-chat';

function formatRelativeTime(value: string) {
  const deltaInMinutes = Math.max(
    0,
    Math.round((Date.now() - new Date(value).getTime()) / (1000 * 60))
  );

  if (deltaInMinutes < 1) {
    return 'just now';
  }

  if (deltaInMinutes < 60) {
    return `${deltaInMinutes}m ago`;
  }

  const deltaInHours = Math.round(deltaInMinutes / 60);

  if (deltaInHours < 24) {
    return `${deltaInHours}h ago`;
  }

  const deltaInDays = Math.round(deltaInHours / 24);
  return `${deltaInDays}d ago`;
}

function getInitials(value: string) {
  return value
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function ChatScreen() {
  const [activeConversationId, setActiveConversationId] = React.useState<string | null>(null);
  const [draftMessage, setDraftMessage] = React.useState('');
  const conversationsQuery = useChatConversations();
  const conversations = conversationsQuery.data;
  const messagesQuery = useConversationMessages(activeConversationId);
  const appendMessageMutation = useAppendMockMessage(activeConversationId);
  const resetChatMutation = useResetMockChatData(activeConversationId);

  React.useEffect(() => {
    if (!conversations?.length) {
      setActiveConversationId(null);
      return;
    }

    const activeConversationStillExists = conversations.some(
      (conversation) => conversation.id === activeConversationId
    );

    if (!activeConversationStillExists) {
      setActiveConversationId(conversations[0]?.id ?? null);
    }
  }, [activeConversationId, conversations]);

  const activeConversation =
    conversations?.find((conversation) => conversation.id === activeConversationId) ?? null;
  const messages = messagesQuery.data ?? [];
  const mutationError =
    appendMessageMutation.error instanceof Error ? appendMessageMutation.error.message : null;
  const resetError = resetChatMutation.error instanceof Error ? resetChatMutation.error.message : null;
  const unreadTotal =
    conversations?.reduce((sum, conversation) => sum + conversation.unreadCount, 0) ?? 0;

  const handleSendMessage = React.useCallback(async () => {
    const nextDraftMessage = draftMessage.trim();

    if (!nextDraftMessage) {
      return;
    }

    await appendMessageMutation.mutateAsync(nextDraftMessage);
    setDraftMessage('');
  }, [appendMessageMutation, draftMessage]);

  return (
    <>
      <Stack.Screen options={{ title: 'Inbox' }} />
      <ScrollView
        className="flex-1 bg-canvas"
        contentContainerClassName="gap-6 px-5 pt-4 pb-24"
        contentInsetAdjustmentBehavior="automatic">
        <View className="gap-3">
          <AppPill className="self-start" label="Inbox" tone="accent" />
          <AppText variant="hero">Prioritize the conversations most likely to convert.</AppText>
          <AppText tone="muted">
            The screen leads with thread triage, then expands into a focused conversation view.
          </AppText>
        </View>

        <View className="flex-row gap-3">
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
            value={String(conversations?.length ?? 0)}
          />
        </View>

        <AppCard className="gap-4">
          <View className="flex-row items-center justify-between gap-3">
            <View className="flex-1 gap-1">
              <AppText variant="subtitle">Priority inbox</AppText>
              <AppText tone="muted">
                Pick a conversation to inspect the latest locally stored message window.
              </AppText>
            </View>
            <AppButton
              detail="Restore demo data"
              disabled={resetChatMutation.isPending}
              label={resetChatMutation.isPending ? 'Resetting...' : 'Reset'}
              onPress={() => {
                void resetChatMutation.mutateAsync();
              }}
              size="md"
              variant="secondary"
            />
          </View>

          {conversationsQuery.isLoading ? (
            <AppText tone="muted">Loading threads...</AppText>
          ) : null}

          {conversations?.map((conversation) => (
            <Pressable
              key={conversation.id}
              onPress={() => {
                setActiveConversationId(conversation.id);
              }}>
              <AppListItem
                description={conversation.preview}
                leading={<AppText variant="bodyStrong">{getInitials(conversation.name)}</AppText>}
                meta={formatRelativeTime(conversation.lastMessageAt)}
                title={conversation.name}
                tone={conversation.id === activeConversationId ? 'accent' : 'default'}
                trailing={
                  <View className="items-end gap-2">
                    <AppText variant="subtitle">{conversation.unreadCount}</AppText>
                    <AppPill
                      label={conversation.kind === 'group' ? 'Group' : 'Direct'}
                      tone="neutral"
                    />
                  </View>
                }
              />
            </Pressable>
          ))}
        </AppCard>

        {activeConversation ? (
          <AppCard className="gap-4">
            <View className="gap-2">
              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-1 gap-1">
                  <AppText variant="subtitle">{activeConversation.name}</AppText>
                  <AppText tone="muted">
                    Local mode keeps the newest {LOCAL_MESSAGE_LIMIT} messages for this thread.
                  </AppText>
                </View>
                <AppPill
                  label={
                    activeConversation.unreadCount > 0
                      ? `${activeConversation.unreadCount} unread`
                      : 'Caught up'
                  }
                  tone={activeConversation.unreadCount > 0 ? 'accent' : 'neutral'}
                />
              </View>

              <View className="flex-row gap-2">
                <AppPill
                  label={`${activeConversation.messagesStored}/${LOCAL_MESSAGE_LIMIT} stored`}
                  tone="neutral"
                />
                <AppPill
                  label={activeConversation.kind === 'group' ? 'Group thread' : 'Direct thread'}
                  tone="neutral"
                />
              </View>
            </View>

            {messagesQuery.isLoading ? <AppText tone="muted">Loading recent messages...</AppText> : null}

            <View className="gap-3">
              {messages.map((message) => (
                <View
                  key={message.id}
                  className={
                    message.direction === 'outgoing' ? 'items-end' : 'items-start'
                  }>
                  <View
                    className={
                      message.direction === 'outgoing'
                        ? 'max-w-[88%] rounded-[18px] bg-accent px-4 py-3'
                        : 'max-w-[88%] rounded-[18px] border border-border bg-background px-4 py-3'
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
            </View>

            <View className="gap-3">
              <AppInput
                label="Message"
                multiline
                onChangeText={setDraftMessage}
                placeholder="Write a message"
                value={draftMessage}
              />
              <AppButton
                detail={
                  appendMessageMutation.isPending
                    ? 'Saving message locally'
                    : 'Send into the active thread'
                }
                disabled={!draftMessage.trim() || appendMessageMutation.isPending}
                label={appendMessageMutation.isPending ? 'Saving...' : 'Send Message'}
                onPress={() => {
                  void handleSendMessage();
                }}
              />
            </View>
          </AppCard>
        ) : null}

        {mutationError || resetError ? (
          <AppCard tone="signal">
            <AppText variant="subtitle">Inbox action failed</AppText>
            <AppText tone="muted">{mutationError ?? resetError}</AppText>
          </AppCard>
        ) : null}
      </ScrollView>
    </>
  );
}
