import { ImagePickerAsset } from 'expo-image-picker';

import { apiFetch } from '@/services/client';
import { getMimeType } from '@/utils/mimeTypes';
import type {
  ChatCompleteDealResponse,
  ChatLeaveResponse,
  ChatListResponse,
  ChatMessageRequest,
  ChatMessageSendResponse,
  ChatMessagesResponse,
} from '@/types';

export function getChatListApi(_accessToken?: string): Promise<ChatListResponse> {
  return apiFetch<ChatListResponse>('/api/chats', { method: 'GET' });
}

export function getChatMessagesApi(
  chatId: number,
  _accessToken?: string
): Promise<ChatMessagesResponse> {
  // 서버가 입장 시 읽음 처리를 수행한다.
  return apiFetch<ChatMessagesResponse>(`/api/chats/${chatId}/messages`, { method: 'GET' });
}

export function sendMessageApi(
  chatId: number,
  request: ChatMessageRequest,
  _accessToken?: string
): Promise<ChatMessageSendResponse> {
  return apiFetch<ChatMessageSendResponse>(`/api/chats/${chatId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message: request.message }),
  });
}

export function leaveChatApi(chatId: number, _accessToken?: string): Promise<ChatLeaveResponse> {
  return apiFetch<ChatLeaveResponse>(`/api/chats/${chatId}`, { method: 'DELETE' });
}

export function completeDealApi(
  chatId: number,
  _accessToken?: string
): Promise<ChatCompleteDealResponse> {
  return apiFetch<ChatCompleteDealResponse>(`/api/chats/${chatId}/complete`, { method: 'POST' });
}

export function sendChatMediaApi(
  chatId: number,
  file: ImagePickerAsset,
  _accessToken?: string
): Promise<ChatMessageSendResponse> {
  const filename = file.fileName ?? file.uri.split('/').pop() ?? 'upload.jpg';
  const form = new FormData();
  form.append('file', { uri: file.uri, name: filename, type: getMimeType(filename) } as any);

  // 서버는 일반 메시지와 동일한 shape으로 응답하며 content가 미디어 URL이다.
  // 채팅 화면은 content(URL)를 정규식으로 판별해 렌더하므로 별도 media 메타데이터는 두지 않는다.
  return apiFetch<ChatMessageSendResponse>(`/api/chats/${chatId}/media`, {
    method: 'POST',
    body: form,
  });
}
