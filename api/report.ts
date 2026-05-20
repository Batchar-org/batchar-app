import { supabase } from '@/lib/supabase';
import { ApiError } from './errors';
import type {
  ReportMessageRequest,
  ReportProductRequest,
  ReportResponse,
  ReportUserRequest,
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

async function insertReport(payload: {
  reporter_id: string;
  reason: string;
  description?: string;
  target_user_id?: string;
  target_product_id?: number;
  target_message_id?: number;
}): Promise<number> {
  const { data, error } = await supabase
    .from('reports')
    .insert(payload as never)
    .select('id')
    .single();

  if (error || !data) {
    const message = error?.message ?? '신고 접수에 실패했습니다.';
    if (message.includes('DUPLICATE_REPORT_WITHIN_24H')) {
      throw new ApiError('이미 신고하셨습니다. 24시간 후에 다시 시도해주세요.', {
        code: 'DUPLICATE_REPORT_WITHIN_24H',
        status: 409,
      });
    }
    if (message.includes('reports_one_target')) {
      throw new ApiError('신고 대상이 올바르지 않습니다.', {
        code: 'INVALID_REPORT_TARGET',
        status: 400,
      });
    }
    if (message.includes('reports_not_self_user')) {
      throw new ApiError('본인을 신고할 수 없습니다.', {
        code: 'SELF_REPORT_NOT_ALLOWED',
        status: 400,
      });
    }
    if (message.includes('reports_description_len')) {
      throw new ApiError('신고 설명은 최대 500자까지 입력할 수 있습니다.', {
        code: 'DESCRIPTION_TOO_LONG',
        status: 400,
      });
    }
    throw new ApiError(message, { code: error?.code, status: 500 });
  }

  return data.id;
}

export async function reportUserApi(req: ReportUserRequest): Promise<ReportResponse> {
  const uid = await getCurrentUserId();
  const id = await insertReport({
    reporter_id: uid,
    target_user_id: req.targetUserId,
    reason: req.reason,
    description: req.description,
  });
  return { data: { report_id: id }, message: '신고가 접수되었습니다.' };
}

export async function reportProductApi(req: ReportProductRequest): Promise<ReportResponse> {
  const uid = await getCurrentUserId();
  const id = await insertReport({
    reporter_id: uid,
    target_product_id: req.targetProductId,
    reason: req.reason,
    description: req.description,
  });
  return { data: { report_id: id }, message: '신고가 접수되었습니다.' };
}

export async function reportMessageApi(req: ReportMessageRequest): Promise<ReportResponse> {
  const uid = await getCurrentUserId();
  const id = await insertReport({
    reporter_id: uid,
    target_message_id: req.targetMessageId,
    reason: req.reason,
    description: req.description,
  });
  return { data: { report_id: id }, message: '신고가 접수되었습니다.' };
}
