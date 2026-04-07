import { apiFetch } from './client';
import { BidCreateRequest, BidCreateResponse, BidListParams, BidListResponse } from './types';

export async function placeBidApi(
  productId: number,
  request: BidCreateRequest,
  accessToken: string
): Promise<BidCreateResponse> {
  return apiFetch<BidCreateResponse>(`/api/products/${productId}/bids`, {
    method: 'POST',
    body: JSON.stringify(request),
    accessToken,
  });
}

export async function getBidHistoryApi(
  productId: number,
  params: BidListParams = {},
  accessToken?: string | null
): Promise<BidListResponse> {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.set('page', String(params.page));
  if (params.size !== undefined) query.set('size', String(params.size));

  const queryString = query.toString();
  const path = `/api/products/${productId}/bids${queryString ? `?${queryString}` : ''}`;

  return apiFetch<BidListResponse>(path, { accessToken });
}
