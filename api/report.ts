import { apiFetch } from './client';
import type {
  ReportMessageRequest,
  ReportProductRequest,
  ReportResponse,
  ReportUserRequest,
} from './types';

// 신고 주체(reporter)는 서버가 JWT에서 결정하므로 클라가 보내지 않는다.
// 신고 대상별로 엔드포인트가 분리되어 있다 (/user, /product, /message).
export function reportUserApi(req: ReportUserRequest): Promise<ReportResponse> {
  return apiFetch<ReportResponse>('/api/reports/user', {
    method: 'POST',
    body: JSON.stringify({
      targetUserId: Number(req.targetUserId),
      reason: req.reason,
      description: req.description,
    }),
  });
}

export function reportProductApi(req: ReportProductRequest): Promise<ReportResponse> {
  return apiFetch<ReportResponse>('/api/reports/product', {
    method: 'POST',
    body: JSON.stringify({
      targetProductId: Number(req.targetProductId),
      reason: req.reason,
      description: req.description,
    }),
  });
}

export function reportMessageApi(req: ReportMessageRequest): Promise<ReportResponse> {
  return apiFetch<ReportResponse>('/api/reports/message', {
    method: 'POST',
    body: JSON.stringify({
      targetMessageId: Number(req.targetMessageId),
      reason: req.reason,
      description: req.description,
    }),
  });
}
