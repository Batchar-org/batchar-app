import { View, Text, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { COLORS, SHADOWS } from '@/constants/theme';
import { formatPrice } from '@/utils/format';

type TabId = 'bidding' | 'inProgress' | 'completed';

const TABS: { id: TabId; label: string; count: number }[] = [
  { id: 'bidding', label: '구매 입찰', count: 2 },
  { id: 'inProgress', label: '진행 중', count: 1 },
  { id: 'completed', label: '종료', count: 1 },
];

const SUB_HEADERS: Record<TabId, string[]> = {
  bidding: ['구매 희망가', '만료일'],
  inProgress: ['거래 예정일'],
  completed: ['거래일'],
};

type PurchaseItem = {
  id: number;
  seller: string;
  name: string;
  originalPrice: number;
  currentPrice: number;
  date: string;
  image: string | null;
  endTime?: string;
  participants?: number;
};

const MOCK_DATA: Record<TabId, PurchaseItem[]> = {
  bidding: [
    {
      id: 1,
      seller: '학생2',
      name: '콜라 5개',
      originalPrice: 5000,
      currentPrice: 5000,
      date: '26/01/01',
      image: null,
      endTime: '2026-01-01T23:59:59',
      participants: 12,
    },
    {
      id: 2,
      seller: '학생1',
      name: '고추참치',
      originalPrice: 4000,
      currentPrice: 4000,
      date: '26/01/01',
      image: null,
      endTime: '2026-01-01T23:59:59',
      participants: 10,
    },
  ],
  inProgress: [
    {
      id: 3,
      seller: '학생a',
      name: '후드티',
      originalPrice: 25000,
      currentPrice: 25000,
      date: '26/01/02',
      image: null,
    },
  ],
  completed: [
    {
      id: 4,
      seller: '학생2',
      name: '모자',
      originalPrice: 10000,
      currentPrice: 10000,
      date: '25/12/24',
      image: null,
    },
  ],
};

function formatRemainingTime(endTimeStr: string): string {
  const end = new Date(endTimeStr);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  if (diff <= 0) return '마감됨';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}일 ${hours}시간`;
  if (hours > 0) return `${hours}시간 ${minutes}분`;
  return `${minutes}분`;
}

export default function PurchaseHistory() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('bidding');

  const items = MOCK_DATA[activeTab];
  const subHeaders = SUB_HEADERS[activeTab];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* 헤더 */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.active} />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-lg font-bold text-gray-900">구매 내역</Text>
        </View>
        <View style={{ width: 28 }} />
      </View>

      {/* 탭 */}
      <View className="flex-row border-b border-gray-100">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              className="flex-1 items-center pb-3 pt-2"
              style={isActive ? { borderBottomWidth: 2, borderBottomColor: COLORS.primary } : {}}>
              <Text
                className="text-lg font-bold"
                style={{ color: isActive ? COLORS.primary : COLORS.textMuted }}>
                {tab.count}
              </Text>
              <Text
                className="text-sm font-medium"
                style={{ color: isActive ? COLORS.primary : COLORS.textMuted }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 서브 헤더 */}
      <View className="flex-row justify-end px-5 py-2">
        {subHeaders.map((header) => (
          <Text key={header} className="ml-4 text-xs text-gray-400">
            {header}
          </Text>
        ))}
      </View>

      {/* 리스트 */}
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {items.map((item) => (
          <View key={item.id} className="mb-4 rounded-2xl bg-white p-3" style={SHADOWS.card}>
            <View className="flex-row">
              {/* 상품 이미지 */}
              <View className="relative mr-3 h-24 w-24 overflow-hidden rounded-xl bg-gray-100">
                {item.image ? (
                  <Image
                    source={{ uri: item.image }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="h-full w-full items-center justify-center bg-gray-200">
                    <MaterialCommunityIcons name="image-outline" size={32} color="#9CA3AF" />
                  </View>
                )}
              </View>

              {/* 상품 정보 */}
              <View className="flex-1">
                <Text
                  className="mb-1 text-base font-bold text-gray-900"
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {item.name}
                </Text>

                {/* 남은 시간 또는 날짜 */}
                {item.endTime ? (
                  <View className="mb-3 flex-row items-center">
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={12}
                      color={COLORS.textMuted}
                    />
                    <Text className="ml-1 text-xs text-gray-500">
                      {formatRemainingTime(item.endTime)}
                    </Text>
                  </View>
                ) : (
                  <View className="mb-3 flex-row items-center">
                    <Text className="text-xs text-gray-500">{item.date}</Text>
                  </View>
                )}

                {/* 가격 정보 */}
                <View className="flex-row items-center">
                  {/* 시작가 */}
                  <View className="mr-2 flex-1 items-center rounded-lg bg-gray-100 px-2.5 py-1.5">
                    <Text className="text-xs text-gray-500">시작가</Text>
                    <Text className="text-xs font-bold text-gray-700">
                      {formatPrice(item.originalPrice)}원
                    </Text>
                  </View>

                  {/* 현재가 */}
                  <View
                    className="flex-1 items-center rounded-lg px-2.5 py-1.5"
                    style={{ backgroundColor: COLORS.primary }}>
                    <Text className="text-xs text-white">현재가</Text>
                    <Text className="text-xs font-bold text-white">
                      {formatPrice(item.currentPrice)}원
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 참여자 수 */}
            {item.participants != null && (
              <View className="mt-2 flex-row items-center pl-1">
                <MaterialCommunityIcons name="account-outline" size={14} color={COLORS.textMuted} />
                <Text className="ml-1 text-xs text-gray-500">{item.participants}명 참여중</Text>
              </View>
            )}
          </View>
        ))}

        {items.length === 0 && (
          <View className="flex-1 items-center justify-center pt-20">
            <Text className="text-gray-400">내역이 없습니다</Text>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
