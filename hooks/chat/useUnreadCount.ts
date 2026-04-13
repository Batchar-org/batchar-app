import { useChatListQuery } from './useChatListQuery';

export function useUnreadCount(): number {
  const { data: chatList } = useChatListQuery();
  if (!chatList) return 0;
  return chatList.reduce((sum, chat) => sum + chat.unread_count, 0);
}
