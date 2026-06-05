import { View, Text, ActivityIndicator, FlatList } from 'react-native';
import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import Product from './Product';
import { useInfiniteProductsQuery } from '@/hooks/product/useInfiniteProductsQuery';
import { useWishlistQuery } from '@/hooks/wish/useWishlistQuery';
import { useToggleWishMutation } from '@/hooks/wish/useToggleWishMutation';
import { COLORS } from '@/constants/theme';
import { ProductViewType } from '@/api/types';
import type { ProductSummary } from '@/api/types';

interface ProductListProps {
  viewType?: ProductViewType;
  keyword?: string;
  category?: string;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export default function ProductList({
  viewType = 'ALL',
  keyword,
  category,
  refreshing,
  onRefresh,
}: ProductListProps) {
  const router = useRouter();
  const queryParams = useMemo(
    () => ({ view: viewType, keyword, category }),
    [viewType, keyword, category]
  );
  const {
    data,
    isLoading,
    isError,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteProductsQuery(queryParams);
  const { data: wishlistData } = useWishlistQuery({ size: 100 });
  const { mutate: toggleWish } = useToggleWishMutation();

  // 찜한 상품 ID Set으로 변환하여 O(1) 조회
  const wishedProductIds = useMemo(() => {
    const ids = new Set<number>();
    wishlistData?.content?.forEach((w) => ids.add(w.product_id));
    return ids;
  }, [wishlistData]);

  const products = useMemo(() => {
    const content = data ?? [];
    if (viewType !== 'ALL') return content;
    return [...content].sort((a, b) => getAllProductSortPriority(a) - getAllProductSortPriority(b));
  }, [data, viewType]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 py-20">
        <ActivityIndicator size="large" color={COLORS.active} />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 py-20">
        <Text className="text-sm text-gray-500">상품을 불러올 수 없습니다.</Text>
      </View>
    );
  }

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
      return;
    }
    void refetch();
  };

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  };

  return (
    <FlatList
      data={products}
      keyExtractor={(product) => String(product.product_id)}
      className="flex-1 bg-gray-50 px-5"
      contentContainerStyle={{
        flexGrow: products.length === 0 ? 1 : undefined,
        paddingVertical: 8,
      }}
      showsVerticalScrollIndicator={false}
      refreshing={refreshing ?? isRefetching}
      onRefresh={handleRefresh}
      onEndReachedThreshold={0.5}
      onEndReached={handleEndReached}
      ListEmptyComponent={
        <View className="flex-1 items-center justify-center py-20">
          <Text className="text-sm text-gray-500">등록된 상품이 없습니다.</Text>
        </View>
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <View className="items-center py-4">
            <ActivityIndicator size="small" color={COLORS.active} />
          </View>
        ) : null
      }
      renderItem={({ item: product }) => {
        const isWished = wishedProductIds.has(product.product_id);
        const isMyActiveBid = viewType === 'MY_ACTIVE_BIDS' && product.my_bid_price !== null;
        const displayPrice = isMyActiveBid
          ? (product.my_bid_price ?? product.current_price)
          : product.current_price;
        return (
          <Product
            key={String(product.product_id)}
            id={String(product.product_id)}
            title={product.title}
            originalPrice={product.start_price}
            currentPrice={displayPrice}
            currentPriceLabel={isMyActiveBid ? '입찰가' : undefined}
            location=""
            participants={product.bid_count}
            image={product.media_url}
            status={product.status}
            endTime={product.end_time}
            isFavorite={isWished}
            onPress={() => router.push(`/product/${product.product_id}`)}
            onFavoritePress={() => toggleWish({ productId: product.product_id, isWished })}
          />
        );
      }}
    />
  );
}

function getAllProductSortPriority(product: ProductSummary): number {
  if (product.status === 'ENDED') return 1;
  if (product.status === 'TRADED' || product.status === 'FAILED' || product.status === 'CANCELED') {
    return 2;
  }
  return 0;
}
