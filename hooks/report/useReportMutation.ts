import { useMutation } from '@tanstack/react-query';

import { reportMessageApi, reportProductApi, reportUserApi } from '@/api/report';
import type { ReportReasonCode } from '@/api/types';

export type ReportTarget =
  | { kind: 'user'; id: number; chatId?: number }
  | { kind: 'product'; id: number }
  | { kind: 'message'; id: number };

type Variables = {
  target: ReportTarget;
  reason: ReportReasonCode;
  description?: string;
};

export function useReportMutation() {
  return useMutation({
    mutationFn: async ({ target, reason, description }: Variables) => {
      if (target.kind === 'user') {
        return reportUserApi({
          targetUserId: target.id,
          chatId: target.chatId,
          reason,
          description,
        });
      }
      if (target.kind === 'product') {
        return reportProductApi({ targetProductId: target.id, reason, description });
      }
      return reportMessageApi({ targetMessageId: target.id, reason, description });
    },
  });
}
