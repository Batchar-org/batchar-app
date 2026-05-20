import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { ChatMessage } from '@/api/types';
import { supabase } from '@/lib/supabase';

type UseChatRealtimeOptions = {
  chatId: number;
  onMessageReceived?: (message: ChatMessage) => void;
};

type ChatMessageRow = {
  id: number;
  chat_id: number;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

function toChatMessage(row: ChatMessageRow): ChatMessage {
  return {
    message_id: row.id,
    sender_id: row.sender_id,
    content: row.message,
    is_read: row.is_read,
    created_at: row.created_at,
  };
}

// Supabase Realtime 기반 채팅 메시지 구독 훅.
// sendMessage는 Realtime 채널이 클라→서버 publish를 사용하지 않으므로 항상 false를 반환하고,
// 호출부는 HTTP `sendMessageApi` 폴백으로 처리합니다. 자기 INSERT도 Realtime broadcast로 다시 수신됩니다.
export function useChatRealtime({ chatId, onMessageReceived }: UseChatRealtimeOptions) {
  const onMessageReceivedRef = useRef(onMessageReceived);
  const [connected, setConnected] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    onMessageReceivedRef.current = onMessageReceived;
  }, [onMessageReceived]);

  useEffect(() => {
    if (chatId <= 0) return;

    // Fast Refresh/StrictMode 더블 마운트 시 같은 토픽에 두 번 attach 되는 것을 피하기 위해
    // 매 마운트마다 고유한 채널 이름을 사용합니다.
    const channelName = `chat:${chatId}:${Date.now()}:${Math.random().toString(36).slice(2)}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const row = payload.new as ChatMessageRow;
          const newMessage = toChatMessage(row);

          queryClient.setQueryData(['chatMessages', chatId], (old: any) => {
            if (!old) return old;
            const existingData: ChatMessage[] = old.data ?? old;
            if (existingData.some((m) => m.message_id === newMessage.message_id)) {
              return old;
            }
            if (old.data) return { ...old, data: [...old.data, newMessage] };
            return [...existingData, newMessage];
          });

          queryClient.invalidateQueries({ queryKey: ['chatList'] });
          onMessageReceivedRef.current?.(newMessage);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setConnected(true);
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') setConnected(false);
      });

    return () => {
      supabase.removeChannel(channel);
      setConnected(false);
    };
  }, [chatId, queryClient]);

  // Realtime 채널은 클라→서버 publish를 사용하지 않습니다.
  // 호출부의 HTTP 폴백이 동작하도록 항상 false를 반환합니다.
  const sendMessage = useCallback((_message: string) => {
    return false;
  }, []);

  return { sendMessage, connected };
}
