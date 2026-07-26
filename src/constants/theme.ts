import { Platform } from 'react-native';

import palette from './palette.json';

// 앱 전역 테마 색상 상수
// 브랜드 메인 컬러: #0DDA8A — 버튼, 아이콘, 강조 요소 등 모든 주요 색상에 통일 적용
// 색상 값은 palette.json(단일 소스)에서 가져온다. tailwind.config.js도 동일 소스를 참조.

export const COLORS = palette;

// 아이콘 크기
export const ICON_SIZES = {
  sm: 20,
  md: 24,
  lg: 28,
  xl: 36,
} as const;

export const LAYOUT = {
  screenPadding: 20,
  sectionGap: 16,
  inputMinHeight: 48,
  tabBarMinHeight: 64,
  touchTargetMinHeight: 44,
} as const;

export const SHADOWS = {
  card: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    android: {
      elevation: 3,
      shadowColor: '#000',
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
  }),
  cardSubtle: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
    },
    android: {
      elevation: 2,
      shadowColor: '#000',
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
    },
  }),
} as const;

export const INPUT_STYLE = {
  minHeight: LAYOUT.inputMinHeight,
  fontSize: 16,
  lineHeight: 20,
  paddingVertical: Platform.OS === 'android' ? 10 : 12,
} as const;
