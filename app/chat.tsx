import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TabBar from '../components/TabBar';
import { useRouter } from 'expo-router';
import { MOCK_CHATS } from '../mocks/chat';
import { COLORS } from '../constants/theme';

// 필터 타입
type FilterType = 'all' | 'ongoing' | 'ended';

// 필터 버튼 데이터
const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'ongoing', label: '진행중' },
  { id: 'ended', label: '대화종료' },
];

export default function Chat() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      {/* 헤더 */}
      <View className="flex-row items-center justify-between px-4 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.active} />
        </TouchableOpacity>
        <Text className="text-lg font-bold">채팅</Text>
        <View className="w-7" />
      </View>

      {/* 필터 탭 */}
      <View className="flex-row gap-2 px-4 pb-4">
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            onPress={() => setActiveFilter(filter.id)}
            className={`rounded-full px-4 py-2 ${
              activeFilter === filter.id ? 'border-2' : 'border border-gray-300'
            }`}
            style={
              activeFilter === filter.id
                ? { borderColor: COLORS.active, backgroundColor: COLORS.primaryLight }
                : {}
            }>
            <Text
              className={`text-sm font-medium ${activeFilter === filter.id ? '' : 'text-gray-500'}`}
              style={activeFilter === filter.id ? { color: COLORS.active } : {}}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 채팅 목록 */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {MOCK_CHATS.map((chat) => (
          <TouchableOpacity
            key={chat.id}
            className="flex-row items-center px-4 py-4"
            activeOpacity={0.7}>
            {/* 프로필 아바타 */}
            <View
              className="h-12 w-12 rounded-full"
              style={{ backgroundColor: chat.avatarColor }}
            />

            {/* 채팅 정보 */}
            <View className="ml-3 flex-1">
              <Text className="text-base font-semibold">{chat.name}</Text>
              <Text className="mt-1 text-sm text-gray-500" numberOfLines={1}>
                {chat.message}
              </Text>
            </View>

            {/* 날짜 및 뱃지 */}
            <View className="items-end">
              <Text className="text-xs text-gray-400">{chat.date}</Text>
              {chat.unreadCount > 0 && (
                <View className="mt-1 h-5 w-5 items-center justify-center rounded-full bg-red-500">
                  <Text className="text-xs font-bold text-white">{chat.unreadCount}</Text>
                </View>
              )}
            </View>

            {/* 상품 썸네일 */}
            {chat.thumbnail && (
              <Image source={{ uri: chat.thumbnail }} className="ml-3 h-12 w-12 rounded-lg" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 하단 탭바 */}
      <TabBar />
    </SafeAreaView>
  );
}
