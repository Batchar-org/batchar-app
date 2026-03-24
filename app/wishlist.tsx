import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TabBar from '../components/layout/TabBar';
import WishlistProduct from '../components/product/WishlistProduct';
import { MOCK_PRODUCTS } from '../mocks/product';
import type { ProductData } from '../mocks/product';
import { COLORS } from '../constants/theme';

export default function Wishlist() {
  const router = useRouter();

  // isFavorite가 true인 상품만 필터링 (메모이제이션)
  const favoriteProducts = useMemo(() => MOCK_PRODUCTS.filter((p) => p.isFavorite), []);

  const renderItem = ({ item }: { item: ProductData }) => (
    <WishlistProduct
      id={item.id}
      title={item.title}
      currentPrice={item.currentPrice}
      participants={item.participants}
      image={item.image}
      badge={item.badge}
      deadline={item.deadline}
      likes={item.likes}
      comments={item.comments}
      onPress={() => router.push(`/product/${item.id}`)}
      onFavoritePress={() => console.log('찜 해제:', item.title)}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* 헤더 */}
      <View className="flex-row items-center justify-center bg-white px-5 py-4">
        <Text className="text-lg font-bold text-gray-900">관심목록</Text>
        <TouchableOpacity className="absolute right-5">
          <MaterialCommunityIcons name="dots-horizontal" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* 관심 상품 목록 */}
      <FlatList
        data={favoriteProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        className="flex-1 bg-gray-50 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 12 }}
      />

      {/* 하단 탭바 */}
      <TabBar />
    </SafeAreaView>
  );
}
