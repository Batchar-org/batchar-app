// 밭비옥도(당근 '매너온도' 패러디). 한밭대 + 밭찰 컨셉.
// 0~100%이며 기본 30%에서 시작해, 비옥도가 오를수록 식물이 자란다.

export type FertilityStage = {
  minPercent: number;
  emoji: string;
  label: string;
  message: string;
};

export const FERTILITY_BASE = 30;
export const FERTILITY_MAX = 100;

// 구간별 성장 단계 (오름차순). 단일 출처로 카드/뱃지가 공유한다.
export const FERTILITY_STAGES: FertilityStage[] = [
  {
    minPercent: 0,
    emoji: '🌰',
    label: '씨앗',
    message: '아직 씨앗이에요. 거래로 밭을 일궈보세요!',
  },
  {
    minPercent: 30,
    emoji: '🌱',
    label: '새싹',
    message: '새싹이 돋았어요. 좋은 거래로 키워봐요!',
  },
  {
    minPercent: 50,
    emoji: '🌿',
    label: '잎새',
    message: '잎이 무성하게 자라고 있어요!',
  },
  {
    minPercent: 70,
    emoji: '🪴',
    label: '묘목',
    message: '제법 자란 묘목이 됐어요!',
  },
  {
    minPercent: 85,
    emoji: '🌳',
    label: '울창한 나무',
    message: '울창한 나무로 자랐어요! 🎉',
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
