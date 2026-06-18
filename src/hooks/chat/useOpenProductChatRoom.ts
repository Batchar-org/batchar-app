import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { getChatListApi } from '@/services/chat';
import type { ChatListResponse } from '@/types';

/**
 * 특정 상품의 채팅방을 찾아 이동한다. (예: 낙찰 직후 생성된 채팅방으로 이동)
 * 최신 채팅목록을 받아 product_id로 방을 찾으며, 방이 없으면 false를 반환한다.
 */
export function useOpenProductChatRoom() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return async (productId: number): Promise<boolean> => {
    const chatList = await queryClient.fetchQuery<ChatListResponse>({
      queryKey: ['chatList'],
      queryFn: () => getChatListApi(),
    });
    const room = chatList.data.find((c) => c.product_id === productId);
    if (!room) return false;
    router.push(`/chat/${room.chat_id}`);
    return true;
  };
}
