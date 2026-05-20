import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useMemo } from 'react';
import { COLORS, SHADOWS } from '@/constants/theme';
import { formatPrice, formatRemainingTime } from '@/utils/format';
import { useProductsQuery } from '@/hooks/product/useProductsQuery';
import type { ProductSummary } from '@/api/types';

type TabId = 'bidding' | 'inProgress' | 'completed';

const SUB_HEADERS: Record<TabId, string[]> = {
  bidding: ['현재가', '만료일'],
  inProgress: ['거래 예정일'],
  completed: ['거래일'],
};

function filterByTab(products: ProductSummary[], tab: TabId): ProductSummary[] {
  switch (tab) {
    case 'bidding':
      return products.filter((p) => p.status === 'ON_SALE');
    case 'completed':
      return products.filter(
        (p) => p.status === 'ENDED' || p.status === 'FAILED' || p.status === 'CANCELED'
      );
    case 'inProgress':
      return products.filter(
        (p) =>
          p.status !== 'ON_SALE' &&
          p.status !== 'ENDED' &&
          p.status !== 'FAILED' &&
          p.status !== 'CANCELED'
      );
  }
}

interface ProductHistoryListProps {
  title: string;
  biddingLabel: string;
  view: 'MY_BIDS' | 'MY_PRODUCTS';
}

export default function ProductHistoryList({ title, biddingLabel, view }: ProductHistoryListProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('bidding');

  const TAB_LABELS: Record<TabId, string> = {
    bidding: biddingLabel,
    inProgress: '진행 중',
    completed: '종료',
  };

  const { data, isLoading } = useProductsQuery({ view });

  const grouped = useMemo(() => {
    const products = data?.content ?? [];
    return {
      bidding: filterByTab(products, 'bidding'),
      inProgress: filterByTab(products, 'inProgress'),
      completed: filterByTab(products, 'completed'),
    };
  }, [data]);

  const items = grouped[activeTab];
  const subHeaders = SUB_HEADERS[activeTab];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* 헤더 */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.active} />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-lg font-bold text-gray-900">{title}</Text>
        </View>
        <View style={{ width: 28 }} />
      </View>

      {/* 탭 */}
      <View className="flex-row border-b border-gray-100">
        {(['bidding', 'inProgress', 'completed'] as TabId[]).map((tabId) => {
          const isActive = activeTab === tabId;
          return (
            <TouchableOpacity
              key={tabId}
              onPress={() => setActiveTab(tabId)}
              className="flex-1 items-center pb-3 pt-2"
              style={isActive ? { borderBottomWidth: 2, borderBottomColor: COLORS.primary } : {}}>
              <Text
                className="text-lg font-bold"
                style={{ color: isActive ? COLORS.primary : COLORS.textMuted }}>
                {grouped[tabId].length}
              </Text>
              <Text
                className="text-sm font-medium"
                style={{ color: isActive ? COLORS.primary : COLORS.textMuted }}>
                {TAB_LABELS[tabId]}
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
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.product_id}
              className="mb-4 rounded-2xl bg-white p-3"
              style={SHADOWS.card}
              activeOpacity={0.7}
              onPress={() => router.push(`/product/${item.product_id}`)}>
              <View className="flex-row">
                {/* 상품 이미지 */}
                <View className="relative mr-3 h-24 w-24 overflow-hidden rounded-xl bg-gray-100">
                  {item.media_url ? (
                    <Image
                      source={{ uri: item.media_url }}
                      className="h-full w-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="h-full w-full items-center justify-center bg-gray-200">
                      <MaterialCommunityIcons
                        name="image-outline"
                        size={32}
                        color={COLORS.textMuted}
                      />
                    </View>
                  )}
                </View>

                {/* 상품 정보 */}
                <View className="flex-1">
                  <Text
                    className="mb-1 text-base font-bold text-gray-900"
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {item.title}
                  </Text>

                  {/* 남은 시간 */}
                  <View className="mb-3 flex-row items-center">
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={12}
                      color={COLORS.textMuted}
                    />
                    <Text className="ml-1 text-xs text-gray-500">
                      {formatRemainingTime(item.end_time)}
                    </Text>
                  </View>

                  {/* 가격 정보 */}
                  <View
                    className="items-center self-start rounded-lg px-4 py-1.5"
                    style={{ backgroundColor: COLORS.primary }}>
                    <Text className="text-xs text-white">현재가</Text>
                    <Text className="text-xs font-bold text-white">
                      {formatPrice(item.current_price)}원
                    </Text>
                  </View>
                </View>
              </View>

              {/* 참여자 수 */}
              {item.bid_count > 0 && (
                <View className="mt-2 flex-row items-center pl-1">
                  <MaterialCommunityIcons
                    name="account-outline"
                    size={14}
                    color={COLORS.textMuted}
                  />
                  <Text className="ml-1 text-xs text-gray-500">{item.bid_count}명 참여중</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}

          {items.length === 0 && (
            <View className="items-center pt-20">
              <Text className="text-gray-400">내역이 없습니다</Text>
            </View>
          )}

          <View className="h-8" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
