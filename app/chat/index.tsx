import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Image } from 'expo-image';
import { IMAGE_TRANSITION_MS, IMAGE_PLACEHOLDER } from '@/lib/expo-image-setup';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Swipeable } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TabBar from '@/components/layout/TabBar';
import { useRouter } from 'expo-router';
import { useChatListQuery } from '@/hooks/chat/useChatListQuery';
import { useLeaveChatMutation } from '@/hooks/chat/useLeaveChatMutation';
import { COLORS } from '@/constants/theme';
import { displayUserName } from '@/utils/displayUserName';
import type { ChatListItem } from '@/types';

function formatChatDate(updatedAt: string): string {
  const date = new Date(updatedAt);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const dayDiff = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (dayDiff === 0) return '오늘';
  if (dayDiff === 1) return '어제';
  return `${date.getMonth() + 1}월${date.getDate()}일`;
}

export default function Chat() {
  'use memo';
  const router = useRouter();
  const { data: chatList, isLoading } = useChatListQuery();
  const { mutate: leaveChat } = useLeaveChatMutation();

  // 채팅 목록에서 스와이프로 나가기. 거래가 양쪽 완료 전이면 채팅방 안과 동일하게 안내한다.
  const handleLeave = (chat: ChatListItem) => {
    const bothConfirmed = chat.my_confirmed && chat.partner_confirmed;
    if (!bothConfirmed) {
      Alert.alert('알림', '양쪽 모두 거래를 완료해야 채팅방을 나갈 수 있어요.');
      return;
    }
    Alert.alert('채팅방 나가기', '정말 이 채팅방을 나가시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '나가기',
        style: 'destructive',
        onPress: () =>
          leaveChat(chat.chat_id, {
            onError: (error) => Alert.alert('오류', error.message),
          }),
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* 헤더 — 하단 탭으로 접근하므로 뒤로가기 버튼 없음 */}
      <View className="items-center px-4 py-4">
        <Text className="text-lg font-bold">채팅</Text>
      </View>

      {/* 채팅 목록 */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.active} />
        </View>
      ) : !chatList || chatList.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-sm text-gray-400">참여 중인 채팅이 없습니다.</Text>
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {chatList.map((chat) => (
            <Swipeable
              key={chat.chat_id}
              renderRightActions={() => (
                <TouchableOpacity
                  onPress={() => handleLeave(chat)}
                  className="items-center justify-center"
                  style={{ width: 80, backgroundColor: COLORS.error }}>
                  <Text className="text-sm font-semibold text-white">나가기</Text>
                </TouchableOpacity>
              )}>
              <TouchableOpacity
                className="flex-row items-center bg-white px-4 py-4"
                activeOpacity={0.7}
                onPress={() => router.push(`/chat/${chat.chat_id}`)}>
                {/* 프로필 아바타 */}
                <View className="h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                  <MaterialCommunityIcons name="account" size={28} color={COLORS.textMuted} />
                </View>

                {/* 채팅 정보 */}
                <View className="ml-3 flex-1">
                  <Text className="text-base font-semibold">
                    {displayUserName(chat.partner_name)}
                  </Text>
                  <Text className="mt-1 text-sm text-gray-500" numberOfLines={1}>
                    {chat.last_message || '대화를 시작해 보세요.'}
                  </Text>
                </View>

                {/* 날짜 및 뱃지 */}
                <View className="items-end">
                  <Text className="text-xs text-gray-400">{formatChatDate(chat.updated_at)}</Text>
                  {chat.unread_count > 0 && (
                    <View className="mt-1 h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1">
                      <Text className="text-xs font-bold text-white">{chat.unread_count}</Text>
                    </View>
                  )}
                </View>

                {/* 상품 썸네일 */}
                {chat.product_image_url && (
                  <Image
                    source={{ uri: chat.product_image_url }}
                    className="ml-3 h-12 w-12 rounded-lg"
                    transition={IMAGE_TRANSITION_MS}
                    placeholder={IMAGE_PLACEHOLDER}
                  />
                )}
              </TouchableOpacity>
            </Swipeable>
          ))}
        </ScrollView>
      )}

      {/* 하단 탭바 */}
      <TabBar />
    </SafeAreaView>
  );
}
