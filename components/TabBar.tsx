import { View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTabNavigation } from '../hooks/useTabNavigation';
import type { TabId } from '../types/tab';
import { COLORS, ICON_SIZES } from '../constants/theme';

interface Tab {
  id: TabId;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

const TABS: Tab[] = [
  { id: 'home', icon: 'home' },
  { id: 'heart', icon: 'heart' },
  { id: 'plus', icon: 'plus-circle' },
  { id: 'message', icon: 'chat-outline' },
  { id: 'profile', icon: 'account' },
];

export default function TabBar() {
  const { activeTab, handleTabPress } = useTabNavigation();

  return (
    <View
      style={{ borderTopColor: COLORS.border, backgroundColor: COLORS.background }}
      className="w-full flex-row items-center justify-around border-t px-2 py-4">
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          onPress={() => handleTabPress(tab.id)}
          className="flex-1 items-center justify-center py-2">
          <MaterialCommunityIcons
            name={tab.icon}
            size={ICON_SIZES.xl}
            color={activeTab === tab.id ? COLORS.active : COLORS.inactive}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}
