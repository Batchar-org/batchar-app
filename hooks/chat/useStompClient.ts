import { useEffect, useRef, useCallback, useState } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import 'text-encoding';
import { useQueryClient } from '@tanstack/react-query';

import { ChatMessage } from '@/api/types';
import { useAccessToken } from '@/store/useAuthStore';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim() ?? '';

function getWebSocketUrl(): string {
  const base = BASE_URL.replace(/\/+$/, '');
  const wsBase = base.replace(/^https/, 'wss').replace(/^http/, 'ws');
  return `${wsBase}/ws`;
}

type UseStompClientOptions = {
  chatId: number;
  onMessageReceived?: (message: ChatMessage) => void;
};

export function useStompClient({ chatId, onMessageReceived }: UseStompClientOptions) {
  const clientRef = useRef<Client | null>(null);
  const onMessageReceivedRef = useRef(onMessageReceived);
  const [connected, setConnected] = useState(false);
  const queryClient = useQueryClient();
  const accessToken = useAccessToken();

  // 콜백 ref 최신화 (STOMP 재연결 방지)
  useEffect(() => {
    onMessageReceivedRef.current = onMessageReceived;
  }, [onMessageReceived]);

  // WebSocket STOMP 연결 시도
  useEffect(() => {
    if (!accessToken || chatId <= 0) return;

    const wsUrl = getWebSocketUrl();

    const client = new Client({
      webSocketFactory: () =>
        new WebSocket(wsUrl, [], {
          headers: { 'User-Agent': 'BatcharApp/1.0' },
        }) as any,
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      forceBinaryWSFrames: false,
      appendMissingNULLonIncoming: true,
    });

    client.onConnect = () => {
      console.log('[STOMP] 연결 성공');
      setConnected(true);

      client.subscribe(`/topic/chat/${chatId}`, (frame: IMessage) => {
        try {
          const serverMsg = JSON.parse(frame.body);
          const newMessage: ChatMessage = {
            message_id: serverMsg.messageId,
            sender_id: serverMsg.senderId,
            content: serverMsg.content,
            is_read: serverMsg.isRead ?? serverMsg.read ?? false,
            created_at: serverMsg.createdAt,
          };

          queryClient.setQueryData(['chatMessages', chatId], (old: any) => {
            if (!old) return old;
            const existingData: ChatMessage[] = old.data ?? old;
            if (existingData.some((m) => m.message_id === newMessage.message_id)) return old;
            if (old.data) return { ...old, data: [...old.data, newMessage] };
            return [...existingData, newMessage];
          });

          queryClient.invalidateQueries({ queryKey: ['chatList'] });
          onMessageReceivedRef.current?.(newMessage);
        } catch (e) {
          console.warn('[STOMP] 메시지 파싱 실패:', e);
        }
      });
    };

    client.onDisconnect = () => setConnected(false);
    client.onWebSocketClose = () => setConnected(false);
    client.onWebSocketError = () => {};
    client.onStompError = () => {};

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
      setConnected(false);
    };
  }, [chatId, queryClient, accessToken]);

  // 폴링 폴백: WebSocket 미연결 시 2초 간격으로 메시지 갱신
  useEffect(() => {
    if (connected || chatId <= 0) return;

    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', chatId] });
      queryClient.invalidateQueries({ queryKey: ['chatList'] });
    }, 2000);

    return () => clearInterval(interval);
  }, [connected, chatId, queryClient]);

  const sendMessage = useCallback(
    (message: string) => {
      const client = clientRef.current;
      if (client?.connected) {
        client.publish({
          destination: `/app/chat/${chatId}`,
          body: JSON.stringify({ message }),
        });
        return true;
      }
      return false;
    },
    [chatId]
  );

  return { sendMessage, connected };
}
