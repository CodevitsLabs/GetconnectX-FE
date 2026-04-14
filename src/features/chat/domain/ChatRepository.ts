import type {
  ConversationSummaryHandlers,
  PaginatedMessages,
  PresenceHandlers,
  RoomSubscriptionHandlers,
  SendImageMessageInput,
  SendMessageInput,
  ChatMessage,
  ChatRoom,
} from './models';

export type ChatRepository = {
  getConversationSummaries(): Promise<ChatRoom[]>;
  getMessages(roomId: string, cursor?: string): Promise<PaginatedMessages>;
  markConversationRead(conversationId: string): Promise<void>;
  sendMessage(input: SendMessageInput): Promise<ChatMessage>;
  sendImageMessage(input: SendImageMessageInput): Promise<ChatMessage>;
  subscribeToConversationSummaries(handlers: ConversationSummaryHandlers): () => void;
  subscribeToRoom(roomId: string, handlers: RoomSubscriptionHandlers): () => void;
  setTyping(roomId: string, isTyping: boolean): Promise<void>;
  subscribeToPresence(roomId: string, handlers: PresenceHandlers): () => void;
};
