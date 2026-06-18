import { apiFetch } from '@/services/client';
import type {
  ApiResponse,
  BidCreateRequest,
  BidListParams,
  BidListResponse,
  BidSummary,
} from '@/types';

// NestJS BidSummary는 { price, bidder_name, created_at }만 반환한다 (id/status 없음).
type BidSummaryRaw = {
  price: number;
  bidder_name: string;
  created_at: string;
};

export async function placeBidApi(
  productId: number,
  request: BidCreateRequest,
  _accessToken?: string
): Promise<void> {
  // 생성된 입찰 응답은 호출부에서 사용하지 않으므로(낙관적 업데이트 + invalidate로 처리) 버린다.
  await apiFetch<ApiResponse<unknown>>(`/api/products/${productId}/bids`, {
    method: 'POST',
    body: JSON.stringify({ price: request.price }),
  });
}

export async function getBidHistoryApi(
  productId: number,
  params: BidListParams = {},
  _accessToken?: string | null
): Promise<BidListResponse> {
  const page = params.page ?? 0;
  const size = params.size ?? 20;
  const query = new URLSearchParams({ page: String(page), size: String(size) });

  const res = await apiFetch<ApiResponse<{ content: BidSummaryRaw[]; has_next: boolean }>>(
    `/api/products/${productId}/bids?${query.toString()}`,
    { method: 'GET' }
  );

  const content: BidSummary[] = (res.data.content ?? []).map((raw) => ({
    bidder_name: raw.bidder_name,
    price: raw.price,
    created_at: raw.created_at,
  }));

  return { data: { content, has_next: res.data.has_next }, message: res.message };
}
