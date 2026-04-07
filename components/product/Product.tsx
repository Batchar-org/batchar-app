import { View, Text, Image, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';
import { formatPrice } from '../../utils/format';

interface ProductProps {
  id: string;
  title: string;
  originalPrice: number;
  currentPrice: number;
  location: string;
  participants: number;
  image: string;
  badge?: 'HOT' | 'NEW';
  endTime?: string;
  deadline?: string;
  isFavorite?: boolean;
  onPress?: () => void;
  onFavoritePress?: () => void;
}

function formatRemainingTime(endTimeStr: string): string {
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
}

export default function Product({
  title,
  originalPrice,
  currentPrice,
  location,
  participants,
  image,
  badge,
  endTime,
  deadline,
  isFavorite = false,
  onPress,
  onFavoritePress,
}: ProductProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="mb-4 rounded-2xl bg-white p-3"
      style={SHADOWS.card}>
      <View className="flex-row">
        {/* 상품 이미지 */}
        <View className="relative mr-3 h-24 w-24 overflow-hidden rounded-xl bg-gray-100">
          {badge && (
            <View
              className={`absolute left-2 top-2 z-10 rounded px-1.5 py-1`}
              style={{ backgroundColor: badge === 'HOT' ? '#F97316' : COLORS.primary }}>
              <Text className="text-xs font-bold text-white">{badge}</Text>
            </View>
          )}
          {deadline && (
            <View className="absolute bottom-2 left-2 z-10 flex-row items-center rounded bg-black/70 px-1.5 py-0.5">
              <MaterialCommunityIcons name="clock-outline" size={10} color="white" />
              <Text className="ml-1 text-xs font-semibold text-white">{deadline}</Text>
            </View>
          )}
          <Image source={{ uri: image }} className="h-full w-full" resizeMode="cover" />
        </View>

        {/* 상품 정보 */}
        <View className="flex-1">
          <Text
            className="mb-1 text-base font-bold text-gray-900"
            numberOfLines={1}
            ellipsizeMode="tail">
            {title.length > 10 ? `${title.substring(0, 10)}...` : title}
          </Text>
          {endTime ? (
            <View className="mb-3 flex-row items-center">
              <MaterialCommunityIcons name="clock-outline" size={12} color={COLORS.textMuted} />
              <Text className="ml-1 text-xs text-gray-500">{formatRemainingTime(endTime)}</Text>
            </View>
          ) : (
            <View className="mb-3" style={{ height: 16 }} />
          )}

          {/* 가격 정보 */}
          <View className="flex-row items-center">
            {/* 시작가 */}
            <TouchableOpacity
              activeOpacity={0.7}
              className="flex-1 items-center rounded-lg bg-gray-100 px-2.5 py-1.5"
              style={{
                marginRight: 8,
                ...(Platform.OS === 'web' && {
                  cursor: 'pointer',
                }),
              }}>
              <Text className="text-xs text-gray-500">시작가</Text>
              <Text className="text-xs font-bold text-gray-700">
                {formatPrice(originalPrice)}원
              </Text>
            </TouchableOpacity>

            {/* 현재가 */}
            <TouchableOpacity
              activeOpacity={0.7}
              className="flex-1 items-center rounded-lg px-2.5 py-1.5"
              style={{
                backgroundColor: COLORS.primary,
                ...(Platform.OS === 'web' && {
                  cursor: 'pointer',
                }),
              }}>
              <Text className="text-xs text-white">현재가</Text>
              <Text className="text-xs font-bold text-white">{formatPrice(currentPrice)}원</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 찜 버튼 */}
        <TouchableOpacity onPress={onFavoritePress} activeOpacity={0.7} className="ml-2">
          <MaterialCommunityIcons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? COLORS.primary : '#D1D5DB'}
          />
        </TouchableOpacity>
      </View>

      {/* 참여자 수 */}
      {participants > 0 && (
        <View className="mt-2 flex-row items-center pl-1">
          <MaterialCommunityIcons name="account-outline" size={14} color={COLORS.textMuted} />
          <Text className="ml-1 text-xs text-gray-500">{participants}명 참여중</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
