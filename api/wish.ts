import { apiFetch } from './client';
import { WishAddResponse, WishListParams, WishListResponse, WishRemoveResponse } from './types';

export async function getWishlistApi(
  params: WishListParams = {},
  accessToken: string
): Promise<WishListResponse> {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.set('page', String(params.page));
  if (params.size !== undefined) query.set('size', String(params.size));

  const queryString = query.toString();
  const path = `/api/wishes${queryString ? `?${queryString}` : ''}`;

  return apiFetch<WishListResponse>(path, { accessToken });
}

export async function addWishApi(productId: number, accessToken: string): Promise<WishAddResponse> {
  return apiFetch<WishAddResponse>(`/api/wishes/${productId}`, {
    method: 'POST',
    accessToken,
  });
}

export async function removeWishApi(
  productId: number,
  accessToken: string
): Promise<WishRemoveResponse> {
  return apiFetch<WishRemoveResponse>(`/api/wishes/${productId}`, {
    method: 'DELETE',
    accessToken,
  });
}
