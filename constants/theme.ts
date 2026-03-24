// 앱 전역 테마 색상 상수
// 브랜드 메인 컬러: #0DDA8A — 버튼, 아이콘, 강조 요소 등 모든 주요 색상에 통일 적용

export const COLORS = {
  // 브랜드 색상
  primary: '#0DDA8A',
  primaryLight: '#0DDA8A18',

  // 상태 색상
  active: '#0DDA8A',
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
  disabled: '#A3A3A3',
  error: '#EF4444',
  warning: '#F59E0B',
  success: '#22C55E',

  // 모달/오버레이
  overlay: 'rgba(0,0,0,0.45)',
  cardTitle: '#111827',

  // 상태 알림 배경
  successLight: '#E8F5E9',
  warningLight: '#FFF8E1',
  warningText: '#F57C00',
  warningIcon: '#FFA000',
} as const;

// 아이콘 크기
export const ICON_SIZES = {
  sm: 20,
  md: 24,
  lg: 28,
  xl: 36,
} as const;
