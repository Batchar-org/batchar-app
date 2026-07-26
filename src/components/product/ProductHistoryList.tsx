import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState, useMemo } from 'react';
import { COLORS } from '@/constants/theme';
import { useInfiniteProductsQuery } from '@/hooks/product/useInfiniteProductsQuery';
import Product from './Product';
import type { ProductSummary } from '@/types';

type TabId = 'all' | 'bidding' | 'inProgress' | 'completed';

const HISTORY_PAGE_SIZE = 10;

function filterByTab(
  products: ProductSummary[],
  tab: TabId,
  view: ProductHistoryListProps['view']
): ProductSummary[] {
  switch (tab) {
    case 'all':
      return products;
    case 'bidding':
      return products.filter((p) => {
        if (p.status !== 'ON_SALE') return false;
        return view === 'MY_BIDS' || p.bid_count > 0;
      });
    case 'completed':
      return products.filter((p) => {
        if (p.status === 'TRADED' || p.status === 'FAILED' || p.status === 'CANCELED') return true;
        return false;
      });
    case 'inProgress':
      return products.filter((p) => {
        if (p.status !== 'ENDED') return false;
        return view === 'MY_PRODUCTS' || p.is_winner;
      });
  }
}

interface ProductHistoryListProps {
  title: string;
  biddingLabel: string;
  view: 'MY_BIDS' | 'MY_PRODUCTS';
}

export default function ProductHistoryList({ title, biddingLabel, view }: ProductHistoryListProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('all');

  const TAB_LABELS: Record<TabId, string> = {
    all: '전체',
    bidding: biddingLabel,
    inProgress: '진행 중',
    completed: '종료',
  };

  const { data, isLoading, isRefetching, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteProductsQuery({ view });

  const grouped = useMemo(() => {
    const products =
      view === 'MY_BIDS'
        ? (data ?? []).filter((p) => p.status === 'ON_SALE' || p.is_winner)
        : (data ?? []);
    return {
      bidding: filterByTab(products, 'bidding', view),
      inProgress: filterByTab(products, 'inProgress', view),
      completed: filterByTab(products, 'completed', view),
      all: filterByTab(products, 'all', view),
    };
  }, [data, view]);

  const items = grouped[activeTab];

  useEffect(() => {
    if (!isLoading && items.length < HISTORY_PAGE_SIZE && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [activeTab, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, items.length]);

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
        <View className="w-7" />
      </View>

      {/* 탭 */}
      <View className="flex-row border-b border-gray-100">
        {(['all', 'bidding', 'inProgress', 'completed'] as TabId[]).map((tabId) => {
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

      {/* 리스트 */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.product_id)}
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: items.length === 0 ? 1 : undefined,
            paddingTop: 12,
            paddingBottom: 32,
          }}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
          }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center pt-20">
              <Text className="text-gray-400">내역이 없습니다</Text>
            </View>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const shouldShowMyBidPrice = view === 'MY_BIDS' && item.my_bid_price !== null;
            const displayPrice = shouldShowMyBidPrice
              ? (item.my_bid_price ?? item.current_price)
              : item.current_price;

            return (
              <Product
                key={item.product_id}
                id={String(item.product_id)}
                title={item.title}
                originalPrice={item.start_price}
                currentPrice={displayPrice}
                currentPriceLabel={shouldShowMyBidPrice ? '입찰가' : undefined}
                location=""
                participants={item.bid_count}
                image={item.media_url}
                status={item.status}
                endTime={item.end_time}
                showFavorite={false}
                onPress={() => router.push(`/product/${item.product_id}`)}
              />
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
