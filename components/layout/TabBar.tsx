import { Platform, View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabNavigation } from '@/hooks/useTabNavigation';
import { useUnreadCount } from '@/hooks/chat/useUnreadCount';
import type { TabId } from '@/types/tab';
import { COLORS, ICON_SIZES, LAYOUT } from '@/constants/theme';

interface Tab {
  id: TabId;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
}

const TABS: Tab[] = [
  { id: 'home', icon: 'home', label: '홈' },
  { id: 'heart', icon: 'heart', label: '관심' },
  { id: 'plus', icon: 'plus-circle', label: '등록' },
  { id: 'message', icon: 'chat-outline', label: '채팅' },
  { id: 'profile', icon: 'account', label: 'MY' },
];

export default function TabBar() {
  const { activeTab, handleTabPress } = useTabNavigation();
  const insets = useSafeAreaInsets();
  const unreadCount = useUnreadCount();

  return (
    <View
      style={{
        borderTopColor: COLORS.border,
        backgroundColor: COLORS.background,
        paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 8) : 8,
        paddingTop: 10,
        minHeight:
          LAYOUT.tabBarMinHeight + (Platform.OS === 'ios' ? Math.max(insets.bottom, 0) : 0),
      }}
      className="w-full flex-row items-center justify-around border-t px-2">
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          onPress={() => handleTabPress(tab.id)}
          activeOpacity={0.8}
          style={{ minHeight: LAYOUT.touchTargetMinHeight }}
          className="flex-1 items-center justify-center py-1">
          <View className="relative">
            <MaterialCommunityIcons
              name={tab.icon}
              size={ICON_SIZES.lg}
              color={activeTab === tab.id ? COLORS.active : COLORS.inactive}
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
              color: activeTab === tab.id ? COLORS.active : COLORS.inactive,
            }}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
