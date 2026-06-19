// 밭비옥도(당근 '매너온도' 패러디). 한밭대 + 밭찰 컨셉.
// 0~100%이며 기본 30%에서 시작해, 비옥도가 오를수록 식물이 자란다.

import type { FertilityStage } from '@/types';

export const FERTILITY_BASE = 30;
export const FERTILITY_MAX = 100;

// 구간별 성장 단계 (오름차순). 단일 출처로 카드/뱃지가 공유한다.
export const FERTILITY_STAGES: FertilityStage[] = [
  {
    minPercent: 10,
    image: require('../../assets/public/level/10level.png'),
    label: '씨앗',
    message: '아직 씨앗이에요. 거래로 밭을 일궈보세요!',
  },
  {
    minPercent: 25,
    image: require('../../assets/public/level/25level.png'),
    label: '떡잎',
    message: '작은 싹이 고개를 내밀었어요. 좋은 거래로 키워봐요!',
  },
  {
    minPercent: 35,
    image: require('../../assets/public/level/35level.png'),
    label: '새싹',
    message: '건강하게 자라나고 있어요.',
  },
  {
    minPercent: 50,
    image: require('../../assets/public/level/50level.png'),
    label: '어린 묘목',
    message: '믿음이 쌓이며 튼튼하게 성장하고 있어요.',
  },
  {
    minPercent: 65,
    image: require('../../assets/public/level/65level.png'),
    label: '무럭무럭 묘목',
    message: '정성껏 가꾼 묘목이 풍성하게 자랐어요.',
  },
];

// 비옥도(%) → 성장 단계
export function getFertilityStage(percent: number): FertilityStage {
  const clamped = Math.max(0, Math.min(FERTILITY_MAX, percent));
  for (let i = FERTILITY_STAGES.length - 1; i >= 0; i -= 1) {
    if (clamped >= FERTILITY_STAGES[i].minPercent) return FERTILITY_STAGES[i];
  }
  return FERTILITY_STAGES[0];
}
