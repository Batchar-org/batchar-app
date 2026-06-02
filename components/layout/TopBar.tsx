import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/theme';
import { useUnreadNotificationCountQuery } from '@/hooks/notification/useUnreadNotificationCountQuery';
import Logo from '@/components/layout/Logo';

export default function TopBar() {
  const router = useRouter();
  const { data: unreadCount } = useUnreadNotificationCountQuery();
  const hasUnread = unreadCount != null && unreadCount > 0;

  return (
    <View className="w-full flex-row items-center justify-between bg-white px-7 py-6">
      <Logo height={24} />

      <View className="flex-row items-center">
        {/* 알림 페이지로 이동하는 벨 버튼 (미읽음 수 뱃지) */}
        <TouchableOpacity
          onPress={() => router.push('/mypage/notifications')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Image
            source={require('../../assets/public/Notification.png')}
            style={{ width: 28, height: 28 }}
            contentFit="contain"
          />
          {hasUnread && (
            <View
              className="absolute -right-1.5 -top-1.5 h-[18px] min-w-[18px] items-center justify-center rounded-full px-1"
              style={{ backgroundColor: COLORS.error }}>
              <Text className="text-[10px] font-bold text-white">
                {unreadCount != null && unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* 카테고리 탐색 햄버거 메뉴 */}
        <TouchableOpacity
          onPress={() => router.push('/category')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="ml-4">
          <MaterialCommunityIcons name="menu" size={28} color={COLORS.active} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
