import { ImagePickerAsset } from 'expo-image-picker';

import { apiFetch } from './client';
import { getMimeType } from '@/utils/mimeTypes';
import { ApiError } from './errors';
import type {
  ApiResponse,
  ProductCloseResponse,
  ProductCreateRequest,
  ProductDetail,
  ProductDetailResponse,
  ProductListParams,
  ProductListResponse,
  ProductSummary,
  ProductUpdateRequest,
} from './types';

// ── NestJS 응답 원형 (snake_case) ──
type ProductSummaryRaw = {
  id: number;
  seller_name: string;
  seller_profile_image_url: string | null;
  title: string;
  start_price: number;
  current_price: number;
  my_bid_price?: number | null;
  status: string;
  end_time: string;
  main_image_url: string | null;
  wish_count: number;
  bid_count: number;
  is_winner?: boolean;
};

type ProductDetailRaw = {
  id: number;
  seller_id: number;
  seller_name: string;
  seller_profile_image_url: string | null;
  seller_fertility: number;
  title: string;
  description: string;
  category: string;
  start_price: number;
  current_price: number;
  status: string;
  start_time: string;
  end_time: string;
  is_top_bidder: boolean;
  is_wished: boolean;
  wish_count: number;
  bid_count: number;
  media_urls: { id: number; media_url: string; media_type: 'IMAGE' | 'VIDEO' }[];
};

function appendFiles(form: FormData, files: ImagePickerAsset[]): void {
  for (const file of files) {
    const name = file.fileName ?? file.uri.split('/').pop() ?? 'upload.jpg';
    // RN FormData 파일 형식: { uri, name, type }
    form.append('files', { uri: file.uri, name, type: getMimeType(name) } as any);
  }
}

function toProductSummary(raw: ProductSummaryRaw): ProductSummary {
  return {
    product_id: Number(raw.id),
    title: raw.title,
    media_url: raw.main_image_url ?? '',
    start_price: raw.start_price,
    current_price: raw.current_price,
    my_bid_price: raw.my_bid_price ?? null,
    wish_count: raw.wish_count,
    bid_count: raw.bid_count,
    status: raw.status,
    end_time: raw.end_time,
    is_winner: Boolean(raw.is_winner),
  };
}

function toProductDetail(raw: ProductDetailRaw): ProductDetail {
  return {
    product_id: Number(raw.id),
    seller_id: Number(raw.seller_id),
    seller_name: raw.seller_name,
    seller_profile_image_url: raw.seller_profile_image_url,
    seller_fertility: Number(raw.seller_fertility),
    title: raw.title,
    description: raw.description,
    category: raw.category,
    start_price: raw.start_price,
    current_price: raw.current_price,
    is_top_bidder: raw.is_top_bidder,
    status: raw.status,
    start_time: raw.start_time,
    end_time: raw.end_time,
    is_wished: raw.is_wished,
    wish_count: raw.wish_count,
    bid_count: raw.bid_count,
    media_urls: (raw.media_urls ?? []).map((m) => ({ id: m.id, url: m.media_url })),
  };
}

export async function createProductApi(
  request: ProductCreateRequest,
  files: ImagePickerAsset[],
  _accessToken?: string
): Promise<void> {
  if (files.length === 0) {
    throw new ApiError('상품 미디어는 최소 1개 이상이어야 합니다.', {
      code: 'PRODUCT_MEDIA_REQUIRED',
      status: 400,
    });
  }

  // multipart: 파일은 'files', 나머지는 flat 텍스트 필드 (camelCase)
  const form = new FormData();
  appendFiles(form, files);
  form.append('title', request.title);
  form.append('description', request.description);
  form.append('category', request.category);
  form.append('startPrice', String(request.startPrice));
  form.append('endTime', request.endTime);

  // 생성 결과는 호출부에서 사용하지 않고, 목록은 invalidate로 갱신한다.
  await apiFetch<ApiResponse<unknown>>('/api/products', { method: 'POST', body: form });
}

export async function getProductsApi(
  params: ProductListParams = {},
  _accessToken?: string | null
): Promise<ProductListResponse> {
  const query = new URLSearchParams();
  if (params.view) query.set('view', params.view);
  if (params.category) query.set('category', params.category);
  if (params.keyword) query.set('keyword', params.keyword);
  if (params.page !== undefined) query.set('page', String(params.page));
  if (params.size !== undefined) query.set('size', String(params.size));
  const qs = query.toString();

  const res = await apiFetch<ApiResponse<{ content: ProductSummaryRaw[]; has_next: boolean }>>(
    `/api/products${qs ? `?${qs}` : ''}`,
    { method: 'GET' }
  );
  return {
    data: {
      content: (res.data.content ?? []).map(toProductSummary),
      has_next: res.data.has_next,
    },
    message: res.message,
  };
}

export async function getProductDetailApi(
  productId: number,
  _accessToken?: string | null
): Promise<ProductDetailResponse> {
  const res = await apiFetch<ApiResponse<ProductDetailRaw>>(`/api/products/${productId}`, {
    method: 'GET',
  });
  return { data: toProductDetail(res.data), message: res.message };
}

export async function updateProductApi(
  productId: number,
  request: ProductUpdateRequest,
  files: ImagePickerAsset[],
  _accessToken?: string
): Promise<void> {
  const form = new FormData();
  if (files.length > 0) appendFiles(form, files);
  if (request.title !== undefined) form.append('title', request.title);
  if (request.description !== undefined) form.append('description', request.description);
  if (request.category !== undefined) form.append('category', request.category);
  if (request.endTime !== undefined) form.append('endTime', request.endTime);
  // NestJS DTO @Transform이 콤마 문자열을 배열로 파싱한다.
  if (request.deleteMediaIds && request.deleteMediaIds.length > 0) {
    form.append('deleteMediaIds', request.deleteMediaIds.join(','));
  }

  // 수정 결과(상세)는 호출부에서 사용하지 않고, ['product', id]/['products'] invalidate로 갱신한다.
  await apiFetch<ApiResponse<unknown>>(`/api/products/${productId}`, {
    method: 'PATCH',
    body: form,
  });
}

export function closeProductApi(
  productId: number,
  _accessToken?: string
): Promise<ProductCloseResponse> {
  return apiFetch<ProductCloseResponse>(`/api/products/${productId}/close`, {
    method: 'POST',
  });
}

export async function deleteProductApi(productId: number, _accessToken?: string): Promise<void> {
  // 삭제 결과는 호출부에서 사용하지 않고, ['products'] invalidate로 갱신한다.
  await apiFetch<ApiResponse<unknown>>(`/api/products/${productId}`, { method: 'DELETE' });
}
