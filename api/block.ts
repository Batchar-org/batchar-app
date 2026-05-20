import { supabase } from '@/lib/supabase';
import { ApiError } from './errors';
import type {
  BlockAddResponse,
  BlockListResponse,
  BlockRemoveResponse,
  BlockSummary,
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

export async function blockUserApi(targetUserId: string): Promise<BlockAddResponse> {
  const uid = await getCurrentUserId();

  if (uid === targetUserId) {
    throw new ApiError('본인을 차단할 수 없습니다.', {
      code: 'SELF_BLOCK_NOT_ALLOWED',
      status: 400,
    });
  }

  const { data, error } = await supabase
    .from('blocks')
    .insert({ blocker_id: uid, blocked_id: targetUserId })
    .select('id')
    .single();

  if (error || !data) {
    if (error?.code === '23505') {
      throw new ApiError('이미 차단한 사용자입니다.', {
        code: 'ALREADY_BLOCKED',
        status: 409,
      });
    }
    if (error?.message?.includes('blocks_not_self')) {
      throw new ApiError('본인을 차단할 수 없습니다.', {
        code: 'SELF_BLOCK_NOT_ALLOWED',
        status: 400,
      });
    }
    throw new ApiError(error?.message ?? '차단에 실패했습니다.', {
      code: error?.code,
      status: 500,
    });
  }

  return { data: { block_id: data.id }, message: '차단했습니다.' };
}

export async function unblockUserApi(targetUserId: string): Promise<BlockRemoveResponse> {
  const uid = await getCurrentUserId();

  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('blocker_id', uid)
    .eq('blocked_id', targetUserId);

  if (error) {
    throw new ApiError(error.message, { code: error.code, status: 500 });
  }

  return { data: null, message: '차단을 해제했습니다.' };
}

export async function getBlockListApi(): Promise<BlockListResponse> {
  const uid = await getCurrentUserId();

  const { data, error } = await supabase
    .from('blocks')
    .select(
      'id, blocked_id, created_at, blocked:users!blocks_blocked_id_fkey(name, profile_image_url)'
    )
    .eq('blocker_id', uid)
    .order('created_at', { ascending: false });

  if (error) {
    throw new ApiError(error.message, { code: error.code, status: 500 });
  }

  const rows = (data ?? []) as unknown as {
    id: number;
    blocked_id: string;
    created_at: string;
    blocked: { name: string; profile_image_url: string | null } | null;
  }[];

  const list: BlockSummary[] = rows.map((r) => ({
    block_id: r.id,
    blocked_id: r.blocked_id,
    blocked_name: r.blocked?.name ?? '',
    blocked_profile_image_url: r.blocked?.profile_image_url ?? null,
    created_at: r.created_at,
  }));

  return { data: list, message: '차단 목록 조회 성공' };
}
