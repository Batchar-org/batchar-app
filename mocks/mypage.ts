// 마이페이지 관련 Mock 데이터

// 마일스톤 타입 정의
export interface Milestone {
  id: number;
  label: string;
  value: number;
  completed: boolean;
}

// 보상 타입 정의
export interface Reward {
  id: number;
  title: string;
  description: string;
  color: string;
}

// 마일스톤 데이터
export const MOCK_MILESTONES: Milestone[] = [
  { id: 1, label: '1번', value: 1, completed: true },
  { id: 2, label: '5번', value: 5, completed: true },
  { id: 3, label: '10번', value: 10, completed: false },
  { id: 4, label: '20번', value: 20, completed: false },
];

// 보상 리스트 데이터
export const MOCK_REWARDS: Reward[] = [
  { id: 1, title: '출석할 때마다', description: '매일 1개씩', color: '#4A5568' },
  { id: 2, title: '입찰 할때마다', description: '매일 5개씩', color: '#4A5568' },
  { id: 3, title: '뭐하지', description: '매일 5개씩', color: '#4A5568' },
];

// 밭 비옥도 데이터
export const MOCK_FERTILITY = {
  progress: 40,
  maxValue: 20,
};
