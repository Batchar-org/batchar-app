import { apiFetch } from './client';
import type { ApiResponse } from './types';

export type FertilityAction = 'water' | 'acid-rain';

// 채팅 상대에게 물 주기(+0.5%) / 산성비(-0.5%)를 적용. 응답은 상대의 갱신된 비옥도.
export async function reactFertilityApi(
  chatId: number,
  action: FertilityAction
): Promise<{ fertility: number }> {
  const res = await apiFetch<ApiResponse<{ fertility: number }>>(`/api/chats/${chatId}/${action}`, {
    method: 'POST',
  });
  return res.data;
}
