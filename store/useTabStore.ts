import { create } from 'zustand';
import { devtools, combine } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { TabId } from '../types/tab';

const initialState = {
  activeTab: 'home' as TabId,
};

const useTabStore = create(
  devtools(
    immer(
      combine(initialState, (set) => ({
        actions: {
          setActiveTab: (tab: TabId) =>
            set((state) => {
              state.activeTab = tab;
            }),

          resetTab: () =>
            set((state) => {
              state.activeTab = 'home';
            }),
        },
      }))
    ),
    { name: 'TabStore' }
  )
);

// 리렌더링 최적화를 위한 선택적 구독 커스텀 훅
export const useActiveTab = () => useTabStore((state) => state.activeTab);

// 액션 훅 - actions 객체로 그룹화된 액션 제공
export const useTabActions = () => useTabStore((state) => state.actions);
