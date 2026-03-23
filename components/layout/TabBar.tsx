import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTabNavigation } from '../../hooks/useTabNavigation';
import type { TabId } from '../../types/tab';
import { COLORS, ICON_SIZES } from '../../constants/theme';

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

  return (
    <View
      style={{ borderTopColor: COLORS.border, backgroundColor: COLORS.background }}
      className="w-full flex-row items-center justify-around border-t px-2 py-3">
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          onPress={() => handleTabPress(tab.id)}
          className="flex-1 items-center justify-center py-1">
          <MaterialCommunityIcons
            name={tab.icon}
            size={ICON_SIZES.lg}
            color={activeTab === tab.id ? COLORS.active : COLORS.inactive}
          />
          <Text
            className="mt-1 text-xs"
            style={{ color: activeTab === tab.id ? COLORS.active : COLORS.inactive }}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
