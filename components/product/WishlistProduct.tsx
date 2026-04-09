import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '@/constants/theme';
import { formatPrice } from '@/utils/format';

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
  const formatRemainingTime = (endTimeStr: string): string => {
    const end = new Date(endTimeStr);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return '마감됨';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}일 ${hours}시간`;
    if (hours > 0) return `${hours}시간 ${minutes}분`;
    return `${minutes}분`;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="mb-3 rounded-2xl bg-white p-3"
      style={SHADOWS.cardSubtle}>
      <View className="flex-row">
        {/* 상품 이미지 */}
        <View className="mr-3 h-24 w-24 overflow-hidden rounded-xl bg-gray-100">
          <Image source={{ uri: image }} className="h-full w-full" resizeMode="cover" />
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
