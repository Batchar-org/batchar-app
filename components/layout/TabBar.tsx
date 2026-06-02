import { Platform, View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabNavigation } from '@/hooks/useTabNavigation';
import { useUnreadCount } from '@/hooks/chat/useUnreadCount';
import type { TabId } from '@/types/tab';
import { COLORS, LAYOUT } from '@/constants/theme';

type Tab = {
  id: TabId;
  icon: number;
  label: string;
};

const TABS: Tab[] = [
  { id: 'home', icon: require('../../assets/public/home.png'), label: '홈' },
  { id: 'heart', icon: require('../../assets/public/wish.png'), label: '관심' },
  { id: 'plus', icon: require('../../assets/public/product.png'), label: '등록' },
  { id: 'message', icon: require('../../assets/public/chat.png'), label: '채팅' },
  { id: 'profile', icon: require('../../assets/public/user.png'), label: 'MY' },
];

export default function TabBar() {
  const { activeTab, handleTabPress } = useTabNavigation();
  const insets = useSafeAreaInsets();
  const unreadCount = useUnreadCount();

  return (
    <View
      style={{
        backgroundColor: COLORS.background,
        paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 8) : 8,
        paddingTop: 10,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        // 떠 있는 카드 느낌의 은은한 상단 그림자
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 12,
        minHeight:
          LAYOUT.tabBarMinHeight + (Platform.OS === 'ios' ? Math.max(insets.bottom, 0) : 0),
      }}
      className="w-full flex-row items-center justify-around px-2">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => handleTabPress(tab.id)}
            activeOpacity={0.8}
            style={{ minHeight: LAYOUT.touchTargetMinHeight }}
            className="flex-1 items-center justify-center py-1">
            <View className="relative">
              <Image
                source={tab.icon}
                style={{ width: 26, height: 26 }}
                contentFit="contain"
                tintColor={isActive ? COLORS.active : COLORS.inactive}
              />
              {tab.id === 'message' && unreadCount > 0 && (
                <View
                  className="absolute -right-2.5 -top-1.5 items-center justify-center rounded-full bg-red-500"
                  style={{ minWidth: 16, height: 16, paddingHorizontal: 3 }}>
                  <Text className="text-[10px] font-bold text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
            <Text
              className="mt-1 text-xs"
              style={{
                lineHeight: 16,
                color: isActive ? COLORS.active : COLORS.inactive,
              }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
