import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { PRODUCT_CATEGORIES } from '@/constants/categories';

export default function CategoryGrid() {
  const router = useRouter();

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
        <Text className="text-lg font-bold text-gray-900">카테고리</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
        <View className="flex-row flex-wrap">
          {PRODUCT_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.label}
              className="mb-6 w-1/4 items-center"
              activeOpacity={0.7}
              onPress={() =>
                router.push({ pathname: '/category/list', params: { category: category.label } })
              }>
              <View className="mb-2 h-16 w-16 items-center justify-center rounded-2xl bg-primary-light">
                <MaterialCommunityIcons name={category.icon} size={30} color={COLORS.active} />
              </View>
              <Text className="px-1 text-center text-[11px] text-gray-700" numberOfLines={2}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
