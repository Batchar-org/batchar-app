// 앱 전역 테마 색상 상수

export const COLORS = {
  // 브랜드 색상
  primary: '#12B76A',
  primaryLight: '#12B76A10',

  // 상태 색상
  active: '#12B76A',
  inactive: '#D1D5DB',

  // 텍스트 색상
  text: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',

  // 배경 색상
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',

  // 기타 UI 색상
  border: '#E5E7EB',
  error: '#EF4444',
  warning: '#F59E0B',
  success: '#22C55E',
} as const;

// 아이콘 크기
export const ICON_SIZES = {
  sm: 20,
  md: 24,
  lg: 28,
  xl: 36,
} as const;
