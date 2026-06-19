import { createContext, useContext, useMemo, useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedScrollHandler,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import type { ReactNode } from 'react';

const SCALE_SHRUNK = 0.85;
const TIMING = { duration: 220 };

type TabBarScrollContextType = {
  tabBarScale: SharedValue<number>;
  scrollHandler: ReturnType<typeof useAnimatedScrollHandler>;
  resetTabBar: () => void;
};

const TabBarScrollContext = createContext<TabBarScrollContextType | null>(null);

export function TabBarScrollProvider({ children }: { children: ReactNode }) {
  const tabBarScale = useSharedValue(1);
  const lastScrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      'worklet';
      const y = event.contentOffset.y;
      const diff = y - lastScrollY.value;

      if (y <= 0) {
        if (tabBarScale.value !== 1) tabBarScale.value = withTiming(1, TIMING);
      } else if (diff > 3) {
        if (tabBarScale.value !== SCALE_SHRUNK)
          tabBarScale.value = withTiming(SCALE_SHRUNK, TIMING);
      } else if (diff < -3) {
        if (tabBarScale.value !== 1) tabBarScale.value = withTiming(1, TIMING);
      }

      lastScrollY.value = y;
    },
  });

  const resetTabBar = useCallback(() => {
    'worklet';
    tabBarScale.value = withTiming(1, TIMING);
    lastScrollY.value = 0;
  }, [tabBarScale, lastScrollY]);

  const value = useMemo(
    () => ({ tabBarScale, scrollHandler, resetTabBar }),
    [tabBarScale, scrollHandler, resetTabBar]
  );

  return <TabBarScrollContext.Provider value={value}>{children}</TabBarScrollContext.Provider>;
}

export function useTabBarScroll() {
  const ctx = useContext(TabBarScrollContext);
  if (!ctx) throw new Error('useTabBarScroll must be used within TabBarScrollProvider');
  return ctx;
}
