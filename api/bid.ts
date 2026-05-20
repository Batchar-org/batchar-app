import { supabase } from '@/lib/supabase';
import { ApiError } from './errors';
import type {
  BidCreateRequest,
  BidCreateResponse,
  BidListParams,
  BidListResponse,
  BidSummary,
} from './types';

export async function placeBidApi(
  productId: number,
  request: BidCreateRequest,
  _accessToken?: string
): Promise<BidCreateResponse> {
  const { data, error } = await supabase.rpc('place_bid', {
    p_product_id: productId,
    p_price: request.price,
  });

  if (error || !data) {
    const message = error?.message ?? '입찰에 실패했습니다.';
    if (message.includes('PRODUCT_NOT_FOUND')) {
      throw new ApiError('상품을 찾을 수 없습니다.', { code: 'PRODUCT_NOT_FOUND', status: 404 });
    }
    if (message.includes('SELF_BID_NOT_ALLOWED')) {
      throw new ApiError('본인 상품에는 입찰할 수 없습니다.', {
        code: 'SELF_BID_NOT_ALLOWED',
        status: 403,
      });
    }
    if (message.includes('AUCTION_CLOSED')) {
      throw new ApiError('종료된 경매에는 입찰할 수 없습니다.', {
        code: 'AUCTION_CLOSED',
        status: 400,
      });
    }
    if (message.includes('INVALID_BID_PRICE')) {
      throw new ApiError('입찰 금액은 현재 최고가보다 높아야 합니다.', {
        code: 'INVALID_BID_PRICE',
        status: 400,
      });
    }
    throw new ApiError(message, { code: error?.code, status: 500 });
  }

  return {
    data: {
      bid_id: data.id,
      product_id: data.product_id,
      bidder_id: data.bidder_id,
      price: data.price,
      created_at: data.created_at,
    },
    message: '입찰이 등록되었습니다.',
  };
}

export async function getBidHistoryApi(
  productId: number,
  params: BidListParams = {},
  _accessToken?: string | null
): Promise<BidListResponse> {
  const size = Math.max(1, Math.min(params.size ?? 20, 100));
  const page = Math.max(0, params.page ?? 0);
  const from = page * size;
  const to = from + size; // size+1 rows to detect has_next

  const { data, error } = await supabase
    .from('bids')
    .select('id, price, status, created_at, bidder:users!bids_bidder_id_fkey(name)')
    .eq('product_id', productId)
    .order('price', { ascending: false })
    .order('id', { ascending: false })
    .range(from, to);

  if (error) {
    throw new ApiError(error.message, { code: error.code, status: 500 });
  }

  const rows = (data ?? []) as unknown as {
    id: number;
    price: number;
    status: 'ACTIVE' | 'WON';
    created_at: string;
    bidder: { name: string } | null;
  }[];

  const hasNext = rows.length > size;
  const visible = hasNext ? rows.slice(0, size) : rows;

  const content: BidSummary[] = visible.map((r) => ({
    bid_id: r.id,
    bidder_name: r.bidder?.name ?? '',
    price: r.price,
    status: r.status,
    created_at: r.created_at,
  }));

  return {
    data: { content, has_next: hasNext },
    message: '입찰 내역 조회 성공',
  };
}
