import { useLocalSearchParams } from 'expo-router';
import { ChatConversationScreen } from '@features/chat';

export default function ConversationRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ChatConversationScreen conversationId={id} />;
}
