import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '@/constants/theme';
import { ProductViewType } from '@/api/types';

interface CategoryBarProps {
  activeCategory: ProductViewType;
  onCategoryPress: (category: ProductViewType) => void;
}

const CATEGORIES: { id: ProductViewType; label: string }[] = [
  { id: 'ALL', label: '전체' },
  { id: 'MY_ACTIVE_BIDS', label: '참여중' },
  { id: 'POPULAR', label: '인기' },
  { id: 'ENDING_SOON', label: '마감임박' },
  { id: 'LATEST', label: '최신' },
];

export default function CategoryBar({ activeCategory, onCategoryPress }: CategoryBarProps) {
  const isActive = (id: string) => activeCategory === id;

  return (
    <View className="w-full bg-white px-5 py-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20 }}>
        {CATEGORIES.map(({ id, label }, index) => (
          <TouchableOpacity
            key={id}
            onPress={() => onCategoryPress(id)}
            className="rounded-full px-4 py-2"
            style={{
              marginRight: index === CATEGORIES.length - 1 ? 0 : 6,
              backgroundColor: isActive(id) ? COLORS.primary : 'white',
              borderWidth: isActive(id) ? 0 : 1,
              borderColor: COLORS.inactive,
            }}>
            <Text
              className="text-sm font-semibold"
              style={{ color: isActive(id) ? 'white' : '#4B5563' }}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
