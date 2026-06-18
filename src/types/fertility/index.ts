// 채팅 상대에게 적용하는 비옥도 액션. 서비스(services/fertility)에서 사용.
export type FertilityAction = 'water' | 'acid-rain';

// 밭비옥도 성장 단계의 형태. 상수는 constants/fertility.ts에 있다.
export type FertilityStage = {
  minPercent: number;
  emoji: string;
  label: string;
  message: string;
};
