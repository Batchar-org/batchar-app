import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TabBar from '../components/layout/TabBar';
import WishlistProduct from '../components/product/WishlistProduct';
import { useWishlistQuery } from '../hooks/wish/useWishlistQuery';
import { useToggleWishMutation } from '../hooks/wish/useToggleWishMutation';
import { COLORS } from '../constants/theme';
import type { WishSummary } from '../api/types';

export default function Wishlist() {
  const router = useRouter();
  const { data, isLoading, isError } = useWishlistQuery({ size: 50 });
  const { mutate: toggleWish } = useToggleWishMutation();

  const handleWishRemove = (productId: number) => {
    toggleWish({ productId, isWished: true });
  };

  const renderItem = ({ item }: { item: WishSummary }) => (
    <WishlistProduct
      productId={item.product_id}
      title={item.title}
      currentPrice={item.current_price}
      category={item.category}
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
        <TouchableOpacity className="absolute right-5">
          <MaterialCommunityIcons name="dots-horizontal" size={24} color={COLORS.text} />
        </TouchableOpacity>
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
      ) : !data?.content?.length ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-sm text-gray-500">찜한 상품이 없습니다.</Text>
        </View>
      ) : (
        <FlatList
          data={data.content}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.wish_id)}
          className="flex-1 bg-gray-50 px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 12 }}
        />
      )}

      {/* 하단 탭바 */}
      <TabBar />
    </SafeAreaView>
  );
}
