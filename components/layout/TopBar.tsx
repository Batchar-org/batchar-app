import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useUnreadCount } from '@/hooks/chat/useUnreadCount';

export default function TopBar() {
  const unreadCount = useUnreadCount();

  return (
    <View className="w-full flex-row items-center justify-between bg-white px-5 py-3">
      {/* 앱 로고 */}
      <Text className="text-2xl font-black" style={{ color: COLORS.primary }}>
        밭-찰!
      </Text>

      <View className="flex-row items-center">
        {/* 알림 버튼 */}
        <TouchableOpacity activeOpacity={0.8}>
          <View
            className="relative h-10 w-10 items-center justify-center rounded-full border-2"
            style={{ borderColor: COLORS.primary }}>
            <Feather name="bell" size={20} color={COLORS.primary} />
            {unreadCount > 0 && (
              <View className="absolute -right-1 -top-1 h-4.5 min-w-4.5 items-center justify-center rounded-full bg-red-500">
                <Text className="text-xs font-semibold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* 위치 버튼 */}
        <TouchableOpacity activeOpacity={0.8} style={{ marginLeft: 12 }}>
          <View
            className="h-10 w-10 items-center justify-center rounded-full border-2"
            style={{ borderColor: COLORS.primary }}>
            <Feather name="map-pin" size={20} color={COLORS.primary} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
