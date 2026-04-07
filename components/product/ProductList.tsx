import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Product from './Product';
import { useProductsQuery } from '../../hooks/product/useProductsQuery';
import { COLORS } from '../../constants/theme';

export default function ProductList() {
  const router = useRouter();
  const { data, isLoading, isError } = useProductsQuery();

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
      {products.map((product) => (
        <Product
          key={String(product.product_id)}
          id={String(product.product_id)}
          title={product.title}
          originalPrice={product.current_price}
          currentPrice={product.current_price}
          location=""
          participants={product.bid_count}
          image={product.media_url}
          onPress={() => router.push(`/product/${product.product_id}`)}
          onFavoritePress={() => console.log('찜 클릭:', product.title)}
        />
      ))}
    </View>
  );
}
