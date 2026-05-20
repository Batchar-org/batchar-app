import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { ChatListResponse } from '@/api/types';
import { useChatListQuery } from '@/hooks/chat/useChatListQuery';

/**
 * 거래 완료 상태를 서버 응답 기반으로 관리하는 훅
 *
 * - my_confirmed: 내가 거래 완료를 눌렀는지 (서버 상태)
 * - partner_confirmed: 상대방이 거래 완료를 눌렀는지 (서버 상태)
 * - dealCompleted: 내가 확인 완료
 */
export function useDealStatus(chatId: number) {
  const queryClient = useQueryClient();
  const { data: chatList } = useChatListQuery();
  const chatInfo = chatList?.find((c) => c.chat_id === chatId);

  const myConfirmed = chatInfo?.my_confirmed ?? false;
  const partnerConfirmed = chatInfo?.partner_confirmed ?? false;
  const dealCompleted = myConfirmed;

  // 거래 완료 API 성공 후 캐시 낙관적 업데이트
  const markMyConfirmed = useCallback(() => {
    queryClient.setQueryData<ChatListResponse>(['chatList'], (old) => {
      if (!old) return old;
      return {
        ...old,
        data: old.data.map((item) =>
          item.chat_id === chatId ? { ...item, my_confirmed: true } : item
        ),
      };
    });
  }, [queryClient, chatId]);

  return { dealCompleted, myConfirmed, partnerConfirmed, markMyConfirmed };
}
