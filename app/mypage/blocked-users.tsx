import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { IMAGE_TRANSITION_MS, IMAGE_PLACEHOLDER } from '@/lib/expo-image-setup';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS } from '@/constants/theme';
import { useBlockListQuery } from '@/hooks/block/useBlockListQuery';
import { useUnblockUserMutation } from '@/hooks/block/useUnblockUserMutation';
import { displayUserName } from '@/utils/displayUserName';
import type { BlockSummary } from '@/api/types';

function formatBlockedDate(createdAt: string): string {
  const d = new Date(createdAt);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

export default function BlockedUsersPage() {
  const router = useRouter();
  const { data: blockList, isLoading } = useBlockListQuery();
  const { mutate: unblockUser, isPending: isUnblocking } = useUnblockUserMutation();

  const handleUnblock = (item: BlockSummary) => {
    const partnerName = displayUserName(item.blocked_name);
    Alert.alert('차단 해제', `${partnerName}님의 차단을 해제하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '해제',
        onPress: () => {
          unblockUser(item.blocked_id, {
            onError: (error) => Alert.alert('오류', error.message),
          });
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* 헤더 — 구매 내역 스타일과 동일 */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.active} />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-lg font-bold text-gray-900">차단 목록</Text>
        </View>
        <View style={{ width: 28 }} />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.active} />
        </View>
      ) : !blockList || blockList.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-sm text-gray-400">차단한 사용자가 없습니다.</Text>
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {blockList.map((item) => (
            <View key={item.block_id} className="flex-row items-center px-4 py-4">
              {/* 프로필 아바타 */}
              {item.blocked_profile_image_url ? (
                <Image
                  source={{ uri: item.blocked_profile_image_url }}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: COLORS.border,
                  }}
                  transition={IMAGE_TRANSITION_MS}
                  placeholder={IMAGE_PLACEHOLDER}
                />
              ) : (
                <View className="h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                  <MaterialCommunityIcons name="account" size={28} color={COLORS.textMuted} />
                </View>
              )}

              {/* 정보 */}
              <View className="ml-3 flex-1">
                <Text className="text-base font-semibold">
                  {displayUserName(item.blocked_name)}
                </Text>
                <Text className="mt-1 text-sm text-gray-500">
                  {formatBlockedDate(item.created_at)} 차단
                </Text>
              </View>

              {/* 차단 해제 버튼 */}
              <TouchableOpacity
                onPress={() => handleUnblock(item)}
                disabled={isUnblocking}
                className="rounded-full border px-3 py-1.5"
                style={{ borderColor: COLORS.primary }}>
                <Text className="text-sm font-medium" style={{ color: COLORS.primary }}>
                  {isUnblocking ? '해제 중' : '차단 해제'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
