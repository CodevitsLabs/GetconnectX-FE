import type { ChatRepository } from '../ChatRepository';
import type {
  ConversationSummaryHandlers,
  PresenceHandlers,
  RoomSubscriptionHandlers,
  SendImageMessageInput,
  SendMessageInput,
} from '../models';

export function getConversationSummaries(repository: ChatRepository) {
  return repository.getConversationSummaries();
}

export function getChatMessages(
  repository: ChatRepository,
  roomId: string,
  cursor?: string
) {
  return repository.getMessages(roomId, cursor);
}

export function sendChatMessage(
  repository: ChatRepository,
  input: SendMessageInput
) {
  return repository.sendMessage(input);
}

export function sendChatImageMessage(
  repository: ChatRepository,
  input: SendImageMessageInput
) {
  return repository.sendImageMessage(input);
}

export function markConversationRead(
  repository: ChatRepository,
  conversationId: string
) {
  return repository.markConversationRead(conversationId);
}

export function subscribeToConversationSummaries(
  repository: ChatRepository,
  handlers: ConversationSummaryHandlers
) {
  return repository.subscribeToConversationSummaries(handlers);
}

export function subscribeToChatRoom(
  repository: ChatRepository,
  roomId: string,
  handlers: RoomSubscriptionHandlers
) {
  return repository.subscribeToRoom(roomId, handlers);
}

export function setRoomTyping(
  repository: ChatRepository,
  roomId: string,
  isTyping: boolean
) {
  return repository.setTyping(roomId, isTyping);
}

export function subscribeToRoomPresence(
  repository: ChatRepository,
  roomId: string,
  handlers: PresenceHandlers
) {
  return repository.subscribeToPresence(roomId, handlers);
}
