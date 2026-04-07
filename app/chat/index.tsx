import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TabBar from '../../components/layout/TabBar';
import { useRouter } from 'expo-router';
import { useChatListQuery } from '../../hooks/chat/useChatListQuery';
import { COLORS } from '../../constants/theme';

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
  const router = useRouter();
  const { data: chatList, isLoading } = useChatListQuery();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* 헤더 */}
      <View className="flex-row items-center justify-between px-4 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.active} />
        </TouchableOpacity>
        <Text className="text-lg font-bold">채팅</Text>
        <View className="w-7" />
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
            <TouchableOpacity
              key={chat.chat_id}
              className="flex-row items-center px-4 py-4"
              activeOpacity={0.7}
              onPress={() => router.push(`/chat/${chat.chat_id}`)}>
              {/* 프로필 아바타 */}
              <View className="h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                <MaterialCommunityIcons name="account" size={28} color="#9CA3AF" />
              </View>

              {/* 채팅 정보 */}
              <View className="ml-3 flex-1">
                <Text className="text-base font-semibold">{chat.partner_name}</Text>
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
                />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* 하단 탭바 */}
      <TabBar />
    </SafeAreaView>
  );
}
