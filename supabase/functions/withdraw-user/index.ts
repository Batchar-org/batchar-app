import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { errorResponse, handleOptions, jsonResponse } from '../_shared/response.ts';
import { createAdminClient, createUserClient } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return handleOptions(req);
  if (req.method !== 'POST') {
    return errorResponse(req, 'METHOD_NOT_ALLOWED', '지원하지 않는 HTTP 메서드입니다.', 405);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return errorResponse(req, 'UNAUTHORIZED', '인증이 필요합니다.', 401);
  }

  const userClient = createUserClient(authHeader);
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();
  if (userError || !user) {
    return errorResponse(req, 'UNAUTHORIZED', '인증이 필요합니다.', 401);
  }

  const admin = createAdminClient();
  const uid = user.id;

  const { count: activeAuctions, error: auctionError } = await admin
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('seller_id', uid)
    .eq('status', 'ON_SALE');

  if (auctionError) {
    console.error('count auctions failed', auctionError);
    return errorResponse(req, 'INTERNAL_SERVER_ERROR', '서버 내부 오류가 발생했습니다.', 500);
  }
  if ((activeAuctions ?? 0) > 0) {
    return errorResponse(
      req,
      'HAS_ACTIVE_AUCTION',
      '진행 중인 경매가 있어 탈퇴할 수 없습니다.',
      409
    );
  }

  const { data: activeBids, error: bidError } = await admin
    .from('bids')
    .select('product_id, products!inner(status)')
    .eq('bidder_id', uid)
    .eq('products.status', 'ON_SALE')
    .limit(1);

  if (bidError) {
    console.error('active bid query failed', bidError);
    return errorResponse(req, 'INTERNAL_SERVER_ERROR', '서버 내부 오류가 발생했습니다.', 500);
  }
  if (activeBids && activeBids.length > 0) {
    return errorResponse(
      req,
      'HAS_ACTIVE_BID',
      '진행 중인 경매에 입찰 중이어서 탈퇴할 수 없습니다.',
      409
    );
  }

  await admin.from('wishes').delete().eq('user_id', uid);

  const { data: profile } = await admin
    .from('users')
    .select('profile_image_url')
    .eq('id', uid)
    .maybeSingle();

  if (profile?.profile_image_url) {
    try {
      const url = new URL(profile.profile_image_url);
      const idx = url.pathname.indexOf('/profile-images/');
      if (idx >= 0) {
        const path = url.pathname.slice(idx + '/profile-images/'.length);
        await admin.storage.from('profile-images').remove([path]);
      }
    } catch (e) {
      console.warn('profile image cleanup skipped', e);
    }
  }

  const placeholder = `withdrawn_${uid}`;
  const { error: updateError } = await admin
    .from('users')
    .update({
      email: `${placeholder}@withdrawn.local`,
      name: placeholder,
      address: 'withdrawn',
      profile_image_url: null,
      withdrawn_at: new Date().toISOString(),
    })
    .eq('id', uid);

  if (updateError) {
    console.error('withdraw users update failed', updateError);
    return errorResponse(req, 'INTERNAL_SERVER_ERROR', '서버 내부 오류가 발생했습니다.', 500);
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(uid);
  if (deleteError) {
    console.error('auth.admin.deleteUser failed', deleteError);
    return errorResponse(req, 'INTERNAL_SERVER_ERROR', '서버 내부 오류가 발생했습니다.', 500);
  }

  return jsonResponse(req, { id: uid });
});
