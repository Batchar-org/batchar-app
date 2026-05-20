import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '@/constants/theme';
import { formatPrice, formatRemainingTime } from '@/utils/format';
import { IMAGE_TRANSITION_MS, IMAGE_PLACEHOLDER } from '@/lib/expo-image-setup';

interface WishlistProductProps {
  productId: number;
  title: string;
  currentPrice: number;
  category: string;
  endTime: string;
  image: string;
  onPress?: () => void;
  onWishRemove?: () => void;
}

export default function WishlistProduct({
  title,
  currentPrice,
  category,
  endTime,
  image,
  onPress,
  onWishRemove,
}: WishlistProductProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="mb-3 rounded-2xl bg-white p-3"
      style={SHADOWS.cardSubtle}>
      <View className="flex-row">
        {/* 상품 이미지 */}
        <View className="mr-3 h-24 w-24 overflow-hidden rounded-xl bg-gray-100">
          <Image
            source={{ uri: image }}
            className="h-full w-full"
            contentFit="cover"
            transition={IMAGE_TRANSITION_MS}
            placeholder={IMAGE_PLACEHOLDER}
          />
        </View>

        {/* 상품 정보 */}
        <View className="flex-1 justify-between">
          {/* 상단: 제목 + 하트 */}
          <View className="flex-row items-start justify-between">
            <Text
              className="flex-1 text-base font-bold text-gray-900"
              numberOfLines={1}
              ellipsizeMode="tail">
              {title}
            </Text>
            <TouchableOpacity onPress={onWishRemove} activeOpacity={0.7} className="ml-2">
              <MaterialCommunityIcons name="heart" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* 카테고리 */}
          <Text className="text-xs text-gray-500">{category}</Text>

          {/* 남은 시간 */}
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="clock-outline" size={12} color={COLORS.textMuted} />
            <Text className="ml-1 text-xs text-gray-500">{formatRemainingTime(endTime)}</Text>
          </View>

          {/* 가격 */}
          <Text className="text-base font-extrabold" style={{ color: COLORS.primary }}>
            {formatPrice(currentPrice)} 원
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
