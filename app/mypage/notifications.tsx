import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Swipeable } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS } from '@/constants/theme';
import { useNotificationsQuery } from '@/hooks/notification/useNotificationsQuery';
import { useMarkNotificationReadMutation } from '@/hooks/notification/useMarkNotificationReadMutation';
import { useMarkAllNotificationsReadMutation } from '@/hooks/notification/useMarkAllNotificationsReadMutation';
import { useDeleteNotificationMutation } from '@/hooks/notification/useDeleteNotificationMutation';
import { useDeleteAllNotificationsMutation } from '@/hooks/notification/useDeleteAllNotificationsMutation';
import { buildNotificationRoute } from '@/lib/notificationRoute';
import type { NotificationCategory, NotificationItem } from '@/api/types';

const ICON_BY_CATEGORY: Record<NotificationCategory, keyof typeof MaterialCommunityIcons.glyphMap> =
  {
    chat: 'chat-outline',
    bid: 'gavel',
    outbid: 'gavel',
    auction: 'trophy-outline',
    report: 'flag-outline',
  };

function formatTime(createdAt: string): string {
  const d = new Date(createdAt);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function NotificationsPage() {
  'use memo';
  const router = useRouter();
  const {
    data: notifications,
    isLoading,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNotificationsQuery();
  const { mutate: markRead } = useMarkNotificationReadMutation();
  const { mutate: markAllRead } = useMarkAllNotificationsReadMutation();
  const { mutate: deleteNotification } = useDeleteNotificationMutation();
  const { mutate: deleteAllNotifications } = useDeleteAllNotificationsMutation();

  const handleDeleteAll = () => {
    if (!notifications || notifications.length === 0) return;
    Alert.alert('전체 삭제', '모든 알림을 삭제하시겠어요?', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => deleteAllNotifications() },
    ]);
  };

  const handlePress = (item: NotificationItem) => {
    if (!item.is_read) markRead(item.id);
    // 대상이 있는 알림만 이동한다. report 등은 이미 알림함 화면이므로 이동하지 않는다.
    const route = buildNotificationRoute(item.data);
    if (route) router.push(route);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* 헤더 — 제목 가운데 정렬(좌우 28px 대칭) */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.active} />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-lg font-bold text-gray-900">알림</Text>
        </View>
        <View style={{ width: 28 }} />
      </View>

      {/* 액션 바 — 모두 읽음 / 전체 삭제 (별도 줄) */}
      <View className="flex-row items-center justify-end px-4 pb-2">
        <TouchableOpacity onPress={() => markAllRead()}>
          <Text className="text-sm" style={{ color: COLORS.textSecondary }}>
            모두 읽음
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDeleteAll} className="ml-4">
          <Text className="text-sm" style={{ color: COLORS.error }}>
            전체 삭제
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.active} />
        </View>
      ) : !notifications || notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-sm text-gray-400">받은 알림이 없습니다.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
          }}
          renderItem={({ item }) => (
            <Swipeable
              renderRightActions={() => (
                <TouchableOpacity
                  onPress={() => deleteNotification(item.id)}
                  className="items-center justify-center"
                  style={{ width: 80, backgroundColor: COLORS.error }}>
                  <Text className="text-sm font-semibold text-white">삭제</Text>
                </TouchableOpacity>
              )}>
              <TouchableOpacity
                onPress={() => handlePress(item)}
                className="flex-row items-start px-4 py-4"
                style={{ backgroundColor: item.is_read ? COLORS.background : COLORS.primaryLight }}>
                <View
                  className="mr-3 h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: COLORS.backgroundSecondary }}>
                  <MaterialCommunityIcons
                    name={item.data ? ICON_BY_CATEGORY[item.data.category] : 'bell-outline'}
                    size={22}
                    color={COLORS.active}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">{item.title}</Text>
                  <Text className="mt-0.5 text-sm text-gray-600" numberOfLines={2}>
                    {item.body}
                  </Text>
                  <Text className="mt-1 text-xs text-gray-400">{formatTime(item.created_at)}</Text>
                </View>
                {!item.is_read && (
                  <View
                    className="ml-2 mt-1.5 h-2 w-2 rounded-full"
                    style={{ backgroundColor: COLORS.error }}
                  />
                )}
              </TouchableOpacity>
            </Swipeable>
          )}
        />
      )}
    </SafeAreaView>
  );
}
