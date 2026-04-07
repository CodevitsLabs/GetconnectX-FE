import { ChatConversationScreen } from '@features/chat';
import { useLocalSearchParams } from 'expo-router';

export default function ChatConversationRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ChatConversationScreen conversationId={id} />;
}
