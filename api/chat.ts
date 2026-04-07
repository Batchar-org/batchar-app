import { apiFetch } from './client';
import {
  ChatListResponse,
  ChatMessageRequest,
  ChatMessageSendResponse,
  ChatMessagesResponse,
} from './types';

export async function getChatListApi(accessToken: string): Promise<ChatListResponse> {
  return apiFetch<ChatListResponse>('/api/chats', { accessToken });
}

export async function getChatMessagesApi(
  chatId: number,
  accessToken: string
): Promise<ChatMessagesResponse> {
  return apiFetch<ChatMessagesResponse>(`/api/chats/${chatId}/messages`, { accessToken });
}

export async function sendMessageApi(
  chatId: number,
  request: ChatMessageRequest,
  accessToken: string
): Promise<ChatMessageSendResponse> {
  return apiFetch<ChatMessageSendResponse>(`/api/chats/${chatId}/messages`, {
    method: 'POST',
    body: JSON.stringify(request),
    accessToken,
  });
}
