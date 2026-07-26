import { Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useTabBarScroll } from '@/contexts/TabBarScrollContext';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useRef, useState } from 'react';
import { useTabNavigation } from '@/hooks/useTabNavigation';
import { useUnreadCount } from '@/hooks/chat/useUnreadCount';
import type { TabId } from '@/types/tab';
import { LAYOUT } from '@/constants/theme';

type Tab = {
  id: TabId;
  icon: number;
  activeIcon: number;
};

const ROW_PADDING = 8;

const TABS: Tab[] = [
  {
    id: 'home',
    icon: require('../../../assets/public/bar/home.png'),
    activeIcon: require('../../../assets/public/bar/filedHome.png'),
  },
  {
    id: 'heart',
    icon: require('../../../assets/public/bar/wish.png'),
    activeIcon: require('../../../assets/public/bar/filedVector.png'),
  },
  {
    id: 'plus',
    icon: require('../../../assets/public/bar/product.png'),
    activeIcon: require('../../../assets/public/bar/filedProduct.png'),
  },
  {
    id: 'message',
    icon: require('../../../assets/public/bar/chat.png'),
    activeIcon: require('../../../assets/public/bar/filedChat.png'),
  },
  {
    id: 'profile',
    icon: require('../../../assets/public/bar/user.png'),
    activeIcon: require('../../../assets/public/bar/filedUser.png'),
  },
];

type TabItemProps = {
  tab: Tab;
  isActive: boolean;
  onPress: () => void;
  badge?: number;
};

function TabItem({ tab, isActive, onPress, badge }: TabItemProps) {
  'use memo';
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={1}
      className="flex-1 items-center justify-center"
      style={{ minHeight: LAYOUT.touchTargetMinHeight }}>
      <View className="relative">
        <Image
          source={isActive ? tab.activeIcon : tab.icon}
          style={{ width: 26, height: 26 }}
          contentFit="contain"
          tintColor="#000000"
        />
        {badge != null && badge > 0 && (
          <View
            style={{
              position: 'absolute',
              right: -10,
              top: -6,
              minWidth: 16,
              height: 16,
              paddingHorizontal: 3,
              borderRadius: 8,
              backgroundColor: '#EF4444',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: 'white' }}>
              {badge > 99 ? '99+' : badge}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function TabBar() {
  'use memo';
  const { activeTab, handleTabPress } = useTabNavigation();
  const insets = useSafeAreaInsets();
  const unreadCount = useUnreadCount();

  const { tabBarScale, resetTabBar } = useTabBarScroll();
  const containerHeight = useSharedValue(100);
  const tabRowWidthRef = useRef(0);
  const [tabRowWidth, setTabRowWidth] = useState(0);
  const pillScale = useSharedValue(1);
  const indicatorX = useSharedValue(0);

  const activeIndex = TABS.findIndex((t) => t.id === activeTab);

  const handleLayout = (width: number) => {
    tabRowWidthRef.current = width;
    const tw = (width - ROW_PADDING * 2) / TABS.length;
    indicatorX.value = ROW_PADDING + activeIndex * tw; // 최초: 즉시
    setTabRowWidth(width);
  };

  useEffect(() => {
    const w = tabRowWidthRef.current;
    if (w > 0) {
      const tw = (w - ROW_PADDING * 2) / TABS.length;
      indicatorX.value = withSpring(ROW_PADDING + activeIndex * tw, {
        damping: 22,
        stiffness: 220,
        mass: 0.8,
      });
    }
  }, [activeIndex]);

  const pillAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pillScale.value }],
  }));

  const tabBarAnimStyle = useAnimatedStyle(() => {
    const s = tabBarScale.value;
    const compensation = (containerHeight.value * (1 - s)) / 2;
    return {
      transform: [{ translateY: compensation }, { scale: s }],
    };
  });

  const indicatorAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  const handlePress = (tabId: TabId) => {
    pillScale.value = withSequence(
      withTiming(0.972, { duration: 90, easing: Easing.out(Easing.ease) }),
      withSpring(1, { damping: 14, stiffness: 320, mass: 0.9 })
    );
    resetTabBar();
    handleTabPress(tabId);
  };

  const bottomPadding = Math.max(insets.bottom, 8);

  const tabWidth = tabRowWidth > 0 ? (tabRowWidth - ROW_PADDING * 2) / TABS.length : 0;

  return (
    <Animated.View
      pointerEvents="box-none"
      onLayout={(e) => {
        containerHeight.value = e.nativeEvent.layout.height;
      }}
      style={[
        {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: bottomPadding,
        },
        tabBarAnimStyle,
      ]}>
      <View
        style={{
          borderRadius: 40,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.14,
          shadowRadius: 14,
          elevation: 12,
        }}>
        <View style={{ borderRadius: 40, overflow: 'hidden', minHeight: 58 }}>
          {Platform.OS === 'ios' ? (
            <BlurView
              intensity={10}
              tint="systemUltraThinMaterialLight"
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View
              style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: 'rgba(255,255,255,0.55)',
              }}
            />
          )}
          {/* 탭 행 */}
          <Animated.View style={pillAnimStyle}>
            <View
              style={{ flexDirection: 'row', paddingVertical: 8, paddingHorizontal: ROW_PADDING }}
              onLayout={(e) => handleLayout(e.nativeEvent.layout.width)}>
              {/* 슬라이딩 인디케이터 */}
              {tabWidth > 0 && (
                <Animated.View
                  style={[
                    {
                      position: 'absolute',
                      top: 6,
                      bottom: 6,
                      width: tabWidth,
                      borderRadius: 24,
                      backgroundColor: 'rgba(0,0,0,0.18)',
                    },
                    indicatorAnimStyle,
                  ]}
                />
              )}
              {TABS.map((tab) => (
                <TabItem
                  key={tab.id}
                  tab={tab}
                  isActive={activeTab === tab.id}
                  onPress={() => handlePress(tab.id)}
                  badge={tab.id === 'message' ? unreadCount : undefined}
                />
              ))}
            </View>
          </Animated.View>
        </View>
      </View>
    </Animated.View>
  );
}
