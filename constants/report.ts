export const REPORT_REASONS = [
  { code: 'SPAM', label: '스팸/광고' },
  { code: 'ABUSE', label: '욕설/비방' },
  { code: 'FRAUD', label: '사기/허위 매물' },
  { code: 'INAPPROPRIATE_CONTENT', label: '부적절한 콘텐츠' },
  { code: 'ETC', label: '기타' },
] as const;

export type ReportReasonCode = (typeof REPORT_REASONS)[number]['code'];

export const REPORT_DESCRIPTION_MAX_LENGTH = 500;
