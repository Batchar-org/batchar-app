import { apiFetch } from './client';
import type { BlockAddResponse, BlockListResponse, BlockRemoveResponse } from './types';

// targetUserId는 URL path로만 쓰이므로 string/number 모두 허용한다.
// (차단 주체는 서버가 JWT에서 결정하므로 클라가 보내지 않는다.)
export function blockUserApi(targetUserId: string | number): Promise<BlockAddResponse> {
  return apiFetch<BlockAddResponse>(`/api/blocks/${targetUserId}`, { method: 'POST' });
}

export function unblockUserApi(targetUserId: string | number): Promise<BlockRemoveResponse> {
  return apiFetch<BlockRemoveResponse>(`/api/blocks/${targetUserId}`, { method: 'DELETE' });
}

export function getBlockListApi(): Promise<BlockListResponse> {
  return apiFetch<BlockListResponse>('/api/blocks', { method: 'GET' });
}
