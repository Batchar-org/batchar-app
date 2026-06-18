import { apiFetch } from '@/services/client';
import type {
  ApiResponse,
  WishAddResponse,
  WishListParams,
  WishListResponse,
  WishRemoveResponse,
  WishSummary,
} from '@/types';

type WishSummaryRaw = {
  id: number;
  product_id: number;
  title: string;
  start_price: number;
  current_price: number;
  bid_count: number;
  status: string;
  end_time: string;
  main_image_url: string | null;
};

export async function getWishlistApi(
  params: WishListParams = {},
  _accessToken?: string
): Promise<WishListResponse> {
  const query = new URLSearchParams({
    page: String(params.page ?? 0),
    size: String(params.size ?? 20),
  });

  const res = await apiFetch<ApiResponse<{ content: WishSummaryRaw[]; has_next: boolean }>>(
    `/api/wishes?${query.toString()}`,
    { method: 'GET' }
  );

  const content: WishSummary[] = (res.data.content ?? []).map((raw) => ({
    wish_id: Number(raw.id),
    product_id: Number(raw.product_id),
    title: raw.title,
    start_price: raw.start_price,
    current_price: raw.current_price,
    bid_count: raw.bid_count,
    status: raw.status,
    end_time: raw.end_time,
    media_url: raw.main_image_url ?? '',
  }));

  return { data: { content, has_next: res.data.has_next }, message: res.message };
}

export function addWishApi(productId: number, _accessToken?: string): Promise<WishAddResponse> {
  return apiFetch<WishAddResponse>(`/api/wishes/${productId}`, { method: 'POST' });
}

export function removeWishApi(
  productId: number,
  _accessToken?: string
): Promise<WishRemoveResponse> {
  return apiFetch<WishRemoveResponse>(`/api/wishes/${productId}`, { method: 'DELETE' });
}
