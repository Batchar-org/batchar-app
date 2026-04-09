import { View, Text, ActivityIndicator } from 'react-native';
import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import Product from './Product';
import { useProductsQuery } from '@/hooks/product/useProductsQuery';
import { useWishlistQuery } from '@/hooks/wish/useWishlistQuery';
import { useToggleWishMutation } from '@/hooks/wish/useToggleWishMutation';
import { COLORS } from '@/constants/theme';
import { ProductViewType } from '@/api/types';

interface ProductListProps {
  viewType?: ProductViewType;
}

export default function ProductList({ viewType = 'ALL' }: ProductListProps) {
  const router = useRouter();
  const { data, isLoading, isError } = useProductsQuery({ view: viewType });
  const { data: wishlistData } = useWishlistQuery({ size: 100 });
  const { mutate: toggleWish } = useToggleWishMutation();

  // 찜한 상품 ID Set으로 변환하여 O(1) 조회
  const wishedProductIds = useMemo(() => {
    const ids = new Set<number>();
    wishlistData?.content?.forEach((w) => ids.add(w.product_id));
    return ids;
  }, [wishlistData]);

  if (isLoading) {
    return (
      <View className="items-center justify-center py-20">
        <ActivityIndicator size="large" color={COLORS.active} />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="items-center justify-center py-20">
        <Text className="text-sm text-gray-500">상품을 불러올 수 없습니다.</Text>
      </View>
    );
  }

  const products = data?.content ?? [];

  if (products.length === 0) {
    return (
      <View className="items-center justify-center py-20">
        <Text className="text-sm text-gray-500">등록된 상품이 없습니다.</Text>
      </View>
    );
  }

  return (
    <View className="py-2">
      {products.map((product) => {
        const isWished = wishedProductIds.has(product.product_id);
        return (
          <Product
            key={String(product.product_id)}
            id={String(product.product_id)}
            title={product.title}
            originalPrice={product.current_price}
            currentPrice={product.current_price}
            location=""
            participants={product.bid_count}
            image={product.media_url}
            endTime={product.end_time}
            isFavorite={isWished}
            onPress={() => router.push(`/product/${product.product_id}`)}
            onFavoritePress={() => toggleWish({ productId: product.product_id, isWished })}
          />
        );
      })}
    </View>
  );
}
