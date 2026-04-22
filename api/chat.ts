import * as FileSystem from 'expo-file-system/legacy';
import { ImagePickerAsset } from 'expo-image-picker';

import { apiFetch } from './client';
import {
  ChatCompleteDealResponse,
  ChatLeaveResponse,
  ChatListResponse,
  ChatMediaSendResponse,
  ChatMessageRequest,
  ChatMessageSendResponse,
  ChatMessagesResponse,
} from './types';

declare const process: {
  env: Record<string, string | undefined>;
};

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, '') ?? '';

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

export async function leaveChatApi(
  chatId: number,
  accessToken: string
): Promise<ChatLeaveResponse> {
  return apiFetch<ChatLeaveResponse>(`/api/chats/${chatId}`, {
    method: 'DELETE',
    accessToken,
  });
}

export async function completeDealApi(
  chatId: number,
  accessToken: string
): Promise<ChatCompleteDealResponse> {
  return apiFetch<ChatCompleteDealResponse>(`/api/chats/${chatId}/complete`, {
    method: 'POST',
    accessToken,
  });
}

export async function sendChatMediaApi(
  chatId: number,
  file: ImagePickerAsset,
  accessToken: string
): Promise<ChatMediaSendResponse> {
  if (!BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL이 없습니다. Metro 서버를 재시작해 주세요.');
  }

  const formData = new FormData();

  const uri = file.uri;
  const name = uri.split('/').pop() ?? 'file';
  const ext = name.split('.').pop()?.toLowerCase() ?? 'jpg';

  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    webm: 'video/webm',
  };

  formData.append('file', {
    uri,
    name,
    type: mimeMap[ext] ?? 'image/jpeg',
  } as unknown as Blob);

  const response = await fetch(`${BASE_URL}/api/chats/${chatId}/media`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = data?.message ?? `미디어 전송에 실패했습니다. status=${response.status}`;
    throw new Error(message);
  }

  return data as ChatMediaSendResponse;
}
