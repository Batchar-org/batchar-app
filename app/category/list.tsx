import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ProductList from '@/components/product/ProductList';
import { COLORS } from '@/constants/theme';

export default function CategoryList() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* 헤더 */}
      <View className="flex-row items-center justify-center bg-white px-4 py-4">
        <TouchableOpacity
          className="absolute left-4"
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.active} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
          {category ?? '카테고리'}
        </Text>
      </View>

      <ProductList category={category} />
    </SafeAreaView>
  );
}
