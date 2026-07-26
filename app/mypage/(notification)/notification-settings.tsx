import { ActivityIndicator, Alert, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS } from '@/constants/theme';
import { useNotificationSettingsQuery } from '@/hooks/notification/useNotificationSettingsQuery';
import { useUpdateNotificationSettingsMutation } from '@/hooks/notification/useUpdateNotificationSettingsMutation';

export default function NotificationSettingsPage() {
  const router = useRouter();
  const { data: pushEnabled, isLoading, isError } = useNotificationSettingsQuery();
  const { mutate: updateSettings, isPending } = useUpdateNotificationSettingsMutation();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* 헤더 — 마이페이지 스타일과 동일 */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.active} />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-lg font-bold text-gray-900">알림 설정</Text>
        </View>
        <View className="w-7" />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.active} />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-sm text-gray-400">설정을 불러오지 못했습니다.</Text>
        </View>
      ) : (
        <View className="px-4 pt-2">
          <View className="flex-row items-center justify-between py-4">
            <View className="flex-1 pr-4">
              <Text className="text-base font-semibold text-gray-900">푸시 알림</Text>
              <Text className="mt-1 text-sm text-gray-500">
                채팅, 입찰, 낙찰, 신고 처리 알림을 받습니다.
              </Text>
            </View>
            <Switch
              value={pushEnabled ?? true}
              disabled={isPending}
              onValueChange={(value) =>
                updateSettings(value, {
                  onError: (error) => Alert.alert('오류', error.message),
                })
              }
              trackColor={{ true: COLORS.primary, false: COLORS.inactive }}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
