import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TabBar from '../components/layout/TabBar';
import WishlistProduct from '../components/product/WishlistProduct';
import { MOCK_PRODUCTS } from '../mocks/product';
import { COLORS } from '../constants/theme';

export default function Wishlist() {
  const router = useRouter();

  // isFavorite가 true인 상품만 필터링
  const favoriteProducts = MOCK_PRODUCTS.filter((p) => p.isFavorite);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'bottom']}>
      {/* 헤더 */}
      <View className="flex-row items-center justify-center bg-white px-5 py-4">
        <Text className="text-lg font-bold text-gray-900">관심목록</Text>
        <TouchableOpacity className="absolute right-5">
          <MaterialCommunityIcons name="dots-horizontal" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* 관심 상품 목록 */}
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 12 }}>
        {favoriteProducts.map((product) => (
          <WishlistProduct
            key={product.id}
            id={product.id}
            title={product.title}
            currentPrice={product.currentPrice}
            participants={product.participants}
            image={product.image}
            badge={product.badge}
            deadline={product.deadline}
            likes={product.likes}
            comments={product.comments}
            onPress={() => router.push(`/product/${product.id}`)}
            onFavoritePress={() => console.log('찜 해제:', product.title)}
          />
        ))}
      </ScrollView>

      {/* 하단 탭바 */}
      <TabBar />
    </SafeAreaView>
  );
}
