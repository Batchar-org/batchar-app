import type { ApiResponse } from '@/types/common';

export type ReportReasonCode = 'SPAM' | 'ABUSE' | 'FRAUD' | 'INAPPROPRIATE_CONTENT' | 'ETC';

export type ReportRequestBase = {
  reason: ReportReasonCode;
  description?: string;
};

export type ReportUserRequest = ReportRequestBase & { targetUserId: number; chatId?: number };
export type ReportProductRequest = ReportRequestBase & { targetProductId: number };
export type ReportMessageRequest = ReportRequestBase & { targetMessageId: number };

export type ReportResponse = ApiResponse<{ report_id: number }>;
