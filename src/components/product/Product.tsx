import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '@/constants/theme';
import { formatPrice, formatRemainingTime } from '@/utils/format';
import { getProductDisplayStatus, isProductClosedForDisplay } from '@/utils/productStatus';
import { IMAGE_TRANSITION_MS, IMAGE_PLACEHOLDER } from '@/lib/expo-image-setup';
import ProductStatusOverlay from './ProductStatusOverlay';

interface ProductProps {
  id: string;
  title: string;
  originalPrice?: number;
  currentPrice: number;
  currentPriceLabel?: string;
  location: string;
  participants: number;
  image: string;
  badge?: 'HOT' | 'NEW';
  status?: string;
  endTime?: string;
  deadline?: string;
  isFavorite?: boolean;
  showFavorite?: boolean;
  onPress?: () => void;
  onFavoritePress?: () => void;
}

export default function Product({
  title,
  originalPrice,
  currentPrice,
  currentPriceLabel,
  location,
  participants,
  image,
  badge,
  status,
  endTime,
  deadline,
  isFavorite = false,
  showFavorite = true,
  onPress,
  onFavoritePress,
}: ProductProps) {
  const isEnded = isProductClosedForDisplay(status, endTime);
  const displayStatus = getProductDisplayStatus(status);
  const overlayStatus = displayStatus;
  const priceLabel = currentPriceLabel ?? (isEnded ? '최종가' : '현재가');

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="mb-4 rounded-2xl bg-white p-3"
      style={SHADOWS.card}>
      <View className="flex-row">
        {/* 상품 이미지 */}
        <View className="relative mr-3 h-28 w-28 overflow-hidden rounded-xl bg-gray-100">
          {badge && (
            <View
              pointerEvents="none"
              className={`absolute left-2 top-2 z-10 rounded px-1.5 py-1`}
              style={{ backgroundColor: badge === 'HOT' ? '#F97316' : COLORS.primary }}>
              <Text className="text-xs font-bold text-white">{badge}</Text>
            </View>
          )}
          {deadline && (
            <View
              pointerEvents="none"
              className="absolute bottom-2 left-2 z-10 flex-row items-center rounded bg-black/70 px-1.5 py-0.5">
              <MaterialCommunityIcons name="clock-outline" size={10} color="white" />
              <Text className="ml-1 text-xs font-semibold text-white">{deadline}</Text>
            </View>
          )}
          <Image
            source={{ uri: image }}
            className="h-full w-full"
            contentFit="cover"
            transition={IMAGE_TRANSITION_MS}
            placeholder={IMAGE_PLACEHOLDER}
          />
          <ProductStatusOverlay status={overlayStatus} />
        </View>

        {/* 상품 정보 */}
        <View className="flex-1">
          <Text
            className="mb-1 text-base font-bold text-gray-900"
            numberOfLines={1}
            ellipsizeMode="tail">
            {title.length > 10 ? `${title.substring(0, 10)}...` : title}
          </Text>
          {/* 참여자 수 + 남은 시간 */}
          <View className="mb-3 flex-row items-center">
            <MaterialCommunityIcons name="account-outline" size={12} color={COLORS.textMuted} />
            <Text className="ml-1 text-xs text-gray-500">{participants}명 참여</Text>
            {endTime && (
              <View className="ml-3 flex-row items-center">
                <MaterialCommunityIcons name="clock-outline" size={12} color={COLORS.textMuted} />
                <Text className="ml-1 text-xs text-gray-500">
                  {isEnded ? '입찰 종료' : `${formatRemainingTime(endTime)} 남음`}
                </Text>
              </View>
            )}
          </View>

          {/* 가격 정보 */}
          <View className="flex-row items-center">
            {/* 시작가 */}
            <TouchableOpacity
              activeOpacity={0.7}
              className="flex-1 items-center rounded-lg bg-gray-100 px-2.5 py-2"
              style={{
                marginRight: 8,
                ...(Platform.OS === 'web' && {
                  cursor: 'pointer',
                }),
              }}>
              <Text className="text-sm text-gray-500">시작가</Text>
              <Text className="text-sm font-bold text-gray-700">
                {formatPrice(originalPrice ?? currentPrice)}원
              </Text>
            </TouchableOpacity>

            {/* 현재가 */}
            <TouchableOpacity
              activeOpacity={0.7}
              className="flex-1 items-center rounded-lg px-2.5 py-2"
              style={{
                backgroundColor: isEnded ? '#6B7280' : COLORS.primary,
                ...(Platform.OS === 'web' && {
                  cursor: 'pointer',
                }),
              }}>
              <Text className="text-sm text-white">{priceLabel}</Text>
              <Text className="text-sm font-bold text-white">{formatPrice(currentPrice)}원</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 찜 버튼 */}
        {showFavorite && (
          <TouchableOpacity onPress={onFavoritePress} activeOpacity={0.7} className="ml-2">
            <MaterialCommunityIcons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? COLORS.primary : COLORS.inactive}
            />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}
