import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import TabBar from '@/components/layout/TabBar';
import WishlistProduct from '@/components/product/WishlistProduct';
import { useInfiniteWishlistQuery } from '@/hooks/wish/useInfiniteWishlistQuery';
import { useToggleWishMutation } from '@/hooks/wish/useToggleWishMutation';
import { useTabBarInset } from '@/hooks/useTabBarInset';
import { COLORS } from '@/constants/theme';
import type { WishSummary } from '@/types';

export default function Wishlist() {
  'use memo';
  const router = useRouter();
  const tabBarInset = useTabBarInset();
  const {
    data: wishlistItems,
    isLoading,
    isError,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteWishlistQuery();
  const { mutate: toggleWish } = useToggleWishMutation();

  const handleWishRemove = (productId: number) => {
    toggleWish({ productId, isWished: true });
  };

  const renderItem = ({ item }: { item: WishSummary }) => (
    <WishlistProduct
      productId={item.product_id}
      title={item.title}
      startPrice={item.start_price}
      currentPrice={item.current_price}
      bidCount={item.bid_count}
      status={item.status}
      endTime={item.end_time}
      image={item.media_url}
      onPress={() => router.push(`/product/${item.product_id}`)}
      onWishRemove={() => handleWishRemove(item.product_id)}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* 헤더 */}
      <View className="flex-row items-center justify-center bg-white px-5 py-4">
        <Text className="text-lg font-bold text-gray-900">관심목록</Text>
      </View>

      {/* 관심 상품 목록 */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.active} />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-sm text-gray-500">관심목록을 불러올 수 없습니다.</Text>
        </View>
      ) : !wishlistItems?.length ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-sm text-gray-500">찜한 상품이 없습니다.</Text>
        </View>
      ) : (
        <FlatList
          data={wishlistItems}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.wish_id)}
          className="flex-1 bg-gray-50 px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: tabBarInset }}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
          }}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color={COLORS.active} />
              </View>
            ) : null
          }
        />
      )}

      {/* 하단 탭바 */}
      <TabBar />
    </SafeAreaView>
  );
}
