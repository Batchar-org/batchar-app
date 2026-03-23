import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

interface WishlistProductProps {
  id: string;
  title: string;
  currentPrice: number;
  participants: number;
  image: string;
  badge?: 'HOT' | 'NEW';
  deadline?: string;
  likes?: number;
  comments?: number;
  onPress?: () => void;
  onFavoritePress?: () => void;
}

const formatPrice = (price: number): string => {
  if (price >= 1000000) {
    const man = Math.floor(price / 10000);
    return `${man}만`;
  }
  return `${price.toLocaleString()}`;
};

export default function WishlistProduct({
  title,
  currentPrice,
  participants,
  image,
  badge,
  deadline,
  likes = 0,
  comments = 0,
  onPress,
  onFavoritePress,
}: WishlistProductProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="mb-3 rounded-2xl bg-white p-3"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 2,
      }}>
      <View className="flex-row">
        {/* 상품 이미지 */}
        <View className="relative mr-3 h-24 w-24 overflow-hidden rounded-xl bg-gray-100">
          {badge && (
            <View
              className="absolute left-1.5 top-1.5 z-10 rounded px-1.5 py-0.5"
              style={{ backgroundColor: badge === 'HOT' ? '#F97316' : COLORS.primary }}>
              <Text className="text-xs font-bold text-white">{badge}</Text>
            </View>
          )}
          {deadline && (
            <View className="absolute bottom-1.5 left-1.5 z-10 flex-row items-center rounded bg-black/70 px-1.5 py-0.5">
              <MaterialCommunityIcons name="clock-outline" size={10} color="white" />
              <Text className="ml-1 text-xs font-semibold text-white">{deadline}</Text>
            </View>
          )}
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
            <TouchableOpacity onPress={onFavoritePress} activeOpacity={0.7} className="ml-2">
              <MaterialCommunityIcons name="heart" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* 가격 */}
          <Text className="text-base font-extrabold" style={{ color: COLORS.primary }}>
            {formatPrice(currentPrice)} 원
          </Text>

          {/* 하단: 참여자 + 좋아요/댓글 */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="account-group-outline" size={14} color="#9CA3AF" />
              <Text className="ml-1 text-xs text-gray-400">{participants}명 참여중</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="heart-outline" size={14} color="#9CA3AF" />
                <Text className="ml-0.5 text-xs text-gray-400">{likes}</Text>
              </View>
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="chat-outline" size={14} color="#9CA3AF" />
                <Text className="ml-0.5 text-xs text-gray-400">{comments}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
