import { View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Tab {
    id: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

interface TabBarProps {
    activeTab: string;
    onTabPress: (tab: string) => void;
}

const TABS: Tab[] = [
    { id: 'home', icon: 'home' },
    { id: 'heart', icon: 'heart' },
    { id: 'plus', icon: 'plus-circle' },
    { id: 'message', icon: 'chat-outline' },
    { id: 'profile', icon: 'account' },
];

const ACTIVE_COLOR = '#12B76A';
const INACTIVE_COLOR = '#D1D5DB';
const ICON_SIZE = 36;

export default function TabBar({ activeTab, onTabPress }: TabBarProps) {
    return (
        <View className="w-full flex-row items-center justify-around border-t border-gray-200 bg-white px-2 py-4">
            {TABS.map((tab) => (
                <TouchableOpacity
                    key={tab.id}
                    onPress={() => onTabPress(tab.id)}
                    className="flex-1 items-center justify-center py-2"
                >
                    <MaterialCommunityIcons
                        name={tab.icon}
                        size={ICON_SIZE}
                        color={activeTab === tab.id ? ACTIVE_COLOR : INACTIVE_COLOR}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );
}