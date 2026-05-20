import { supabase } from '@/lib/supabase';
import { ApiError } from './errors';
import type {
  WishAddResponse,
  WishListParams,
  WishListResponse,
  WishRemoveResponse,
  WishSummary,
} from './types';

async function getCurrentUserId(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new ApiError('인증이 필요합니다.', { code: 'UNAUTHORIZED', status: 401 });
  }
  return user.id;
}

export async function getWishlistApi(
  params: WishListParams = {},
  _accessToken?: string
): Promise<WishListResponse> {
  const { data, error } = await supabase.rpc('list_my_wishes', {
    p_page: params.page ?? 0,
    p_size: params.size ?? 20,
  });

  if (error) {
    throw new ApiError(error.message, { code: error.code, status: 500 });
  }

  const payload = data as { items: WishSummary[]; has_next: boolean };
  return {
    data: { content: payload.items, has_next: payload.has_next },
    message: '위시 목록 조회 성공',
  };
}

export async function addWishApi(
  productId: number,
  _accessToken?: string
): Promise<WishAddResponse> {
  const uid = await getCurrentUserId();
  const { data, error } = await supabase
    .from('wishes')
    .insert({ user_id: uid, product_id: productId })
    .select('id')
    .single();

  if (error || !data) {
    if (error?.code === '23505') {
      throw new ApiError('이미 찜한 상품입니다.', {
        code: 'WISH_ALREADY_EXISTS',
        status: 409,
      });
    }
    throw new ApiError(error?.message ?? '찜 등록에 실패했습니다.', {
      code: error?.code,
      status: 500,
    });
  }

  return {
    data: { wish_id: data.id },
    message: '찜에 추가되었습니다.',
  };
}

export async function removeWishApi(
  productId: number,
  _accessToken?: string
): Promise<WishRemoveResponse> {
  const uid = await getCurrentUserId();
  const { error } = await supabase
    .from('wishes')
    .delete()
    .eq('user_id', uid)
    .eq('product_id', productId);

  if (error) {
    throw new ApiError(error.message, { code: error.code, status: 500 });
  }

  return { data: null, message: '찜이 해제되었습니다.' };
}
