import { View, Text, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getProductById } from '../../mocks/product';
import { COLORS } from '../../constants/theme';
import { formatPrice } from '../../utils/format';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 가격 추이 mock 데이터
const PRICE_HISTORY = [
  { day: 'DAY1', height: 50 },
  { day: 'DAY2', height: 60 },
  { day: 'DAY3', height: 70 },
  { day: 'DAY4', height: 85 },
  { day: 'DAY5', height: 100 },
];

// 입찰 기록 mock 데이터
const PRICE_OFFER_HISTORY = [
  { id: '1', name: '박**', amount: 80000, time: '24/11/11 14:27' },
  { id: '2', name: '이**', amount: 78000, time: '24/11/11 16:35' },
  { id: '3', name: '김**', amount: 76000, time: '24/11/11 14:27' },
];

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasPriceOffer, setHasPriceOffer] = useState(false);
  const [isHighestOfferer, setIsHighestOfferer] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const product = getProductById(id || '');

  if (!product) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text>상품을 찾을 수 없습니다.</Text>
      </SafeAreaView>
    );
  }

  const images = product.images || [product.image];

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentImageIndex(index);
  };

  const handlePriceOffer = () => {
    setHasPriceOffer(true);
    setIsHighestOfferer(true);
  };

  const handleCancelPriceOffer = () => {
    setHasPriceOffer(false);
    setIsHighestOfferer(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'bottom']}>
      {/* 헤더 */}
      <View className="flex-row items-center justify-between bg-white px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.active} />
        </TouchableOpacity>
        <View className="flex-row items-center gap-5">
          <TouchableOpacity onPress={() => router.push('/')}>
            <MaterialCommunityIcons name="home-outline" size={22} color={COLORS.active} />
          </TouchableOpacity>
          <TouchableOpacity>
            <MaterialCommunityIcons name="share-variant-outline" size={22} color={COLORS.active} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 이미지 슬라이더 */}
        <View className="relative bg-gray-200">
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}>
            {images.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img }}
                style={{ width: SCREEN_WIDTH, height: 280 }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          {/* 페이지 인디케이터 */}
          <View className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1">
            <Text className="text-sm font-medium text-white">
              {currentImageIndex + 1} / {images.length}
            </Text>
          </View>
        </View>

        {/* 판매자 정보 */}
        <View className="bg-white px-4 pb-2 pt-4">
          <View className="flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100">
              <MaterialCommunityIcons name="account" size={24} color="#9CA3AF" />
            </View>
            <View>
              <Text className="text-base font-medium text-gray-900">
                {product.sellerName || '판매자'}
              </Text>
              {product.isTrustedSeller && (
                <Text className="text-sm font-medium" style={{ color: COLORS.active }}>
                  VIP
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* 상품 제목 */}
        <View className="flex-row items-start justify-between bg-white px-4 pb-4 pt-2">
          <Text className="flex-1 text-xl font-bold text-gray-900">{product.title}</Text>
          <TouchableOpacity className="ml-2 pt-1">
            <MaterialCommunityIcons
              name={product.isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={product.isFavorite ? COLORS.active : '#D1D5DB'}
            />
          </TouchableOpacity>
        </View>

        {/* 가격 정보 */}
        <View className="flex-row gap-2 bg-white px-4 pb-4">
          <View className="flex-1 items-center rounded-xl bg-gray-100 py-3">
            <Text className="text-xs text-gray-500">시작가</Text>
            <Text className="mt-1 text-lg font-bold text-gray-900">
              {formatPrice(product.originalPrice)}원
            </Text>
          </View>
          <View
            className="flex-1 items-center rounded-xl py-3"
            style={{ backgroundColor: COLORS.active }}>
            <Text className="text-xs text-white/80">현재가</Text>
            <Text className="mt-1 text-lg font-bold text-white">
              {formatPrice(product.currentPrice)}원
            </Text>
          </View>
        </View>

        {/* 입찰 상태 알림 */}
        {hasPriceOffer && (
          <View
            className="mx-4 mb-2 flex-row items-center rounded-xl px-4 py-3"
            style={{ backgroundColor: isHighestOfferer ? '#E8F5E9' : '#FFF8E1' }}>
            <MaterialCommunityIcons
              name={isHighestOfferer ? 'check-circle' : 'alert-circle-outline'}
              size={20}
              color={isHighestOfferer ? COLORS.active : '#FFA000'}
            />
            <Text
              className="ml-2 flex-1 text-sm font-medium"
              style={{ color: isHighestOfferer ? COLORS.active : '#F57C00' }}>
              {isHighestOfferer
                ? '안심하세요, 1등을 유지하고 있어요'
                : '다른 사람이 더 높은 금액을 제시했어요'}
            </Text>
          </View>
        )}

        {/* 남은 시간 */}
        <View className="flex-row items-center justify-between bg-white px-4 pb-4">
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="clock-outline" size={16} color="#6B7280" />
            <Text className="ml-1 text-sm text-gray-500">남은 시간:</Text>
            <Text className="ml-1 text-sm font-bold text-gray-900">
              {product.remainingTime || '2일 8시간'}
            </Text>
          </View>
          <Text className="text-sm text-gray-500">
            마감일: {product.endDate || '11/14 02:30 오후'}
          </Text>
        </View>

        {/* 구분선 */}
        <View className="h-2 bg-gray-100" />

        {/* 상품 설명 */}
        <View className="bg-white px-4 py-4">
          <Text className="mb-3 text-base font-bold text-gray-900">상품 설명</Text>
          <Text className="text-sm leading-6 text-gray-600">
            {product.description || '상품 설명이 없습니다.'}
          </Text>
        </View>

        {/* 상품 정보 테이블 */}
        <View className="bg-white px-4 pb-4">
          <View className="flex-row border-b border-gray-100 py-3">
            <Text className="w-20 text-sm text-gray-500">참여자</Text>
            <Text className="flex-1 text-right text-sm font-medium text-gray-900">
              {product.participants}명
            </Text>
          </View>
          <View className="flex-row py-3">
            <Text className="w-20 text-sm text-gray-500">조회수</Text>
            <Text className="flex-1 text-right text-sm font-medium text-gray-900">
              {product.views || 234}회
            </Text>
          </View>
        </View>

        {/* 구분선 */}
        <View className="h-2 bg-gray-100" />

        {/* 가격 추이 */}
        <View className="bg-white px-4 py-4">
          <Text className="mb-4 text-base font-bold text-gray-900">📈 가격 추이</Text>
          <View className="flex-row items-end justify-between px-2">
            {PRICE_HISTORY.map((item, index) => (
              <View key={index} className="items-center">
                <View
                  className="w-12 rounded-t-md"
                  style={{
                    height: item.height,
                    backgroundColor: COLORS.active,
                    opacity: 0.5 + index * 0.12,
                  }}
                />
                <Text className="mt-2 text-xs text-gray-500">{item.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 구분선 */}
        <View className="h-2 bg-gray-100" />

        {/* 입찰 기록 */}
        <View className="bg-white px-4 py-4">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-base font-bold text-gray-900">입찰 기록</Text>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-sm text-gray-500">전체보기</Text>
              <MaterialCommunityIcons name="chevron-right" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          <View>
            {PRICE_OFFER_HISTORY.map((offer, index) => (
              <View
                key={offer.id}
                className={`flex-row items-center justify-between py-4 ${
                  index !== PRICE_OFFER_HISTORY.length - 1 ? 'border-b border-gray-100' : ''
                }`}>
                <View>
                  <Text className="text-base font-medium text-gray-900">{offer.name}</Text>
                  <Text className="mt-1 text-xs text-gray-400">{offer.time}</Text>
                </View>
                <Text className="text-base font-bold" style={{ color: COLORS.active }}>
                  {formatPrice(offer.amount)}원
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 하단 여백 */}
        <View className="h-4" />
      </ScrollView>

      {/* 하단 버튼 */}
      <View className="flex-row items-center border-t border-gray-100 bg-white px-4 py-3">
        <TouchableOpacity className="mr-4 p-1">
          <MaterialCommunityIcons
            name={product.isFavorite ? 'heart' : 'heart-outline'}
            size={28}
            color={product.isFavorite ? COLORS.active : '#D1D5DB'}
          />
        </TouchableOpacity>

        {hasPriceOffer ? (
          <>
            <TouchableOpacity
              className="flex-1 items-center rounded-full border border-gray-300 py-4"
              onPress={handleCancelPriceOffer}>
              <Text className="text-base font-semibold text-gray-600">입찰 취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="ml-3 flex-1 items-center rounded-full py-4"
              style={{ backgroundColor: COLORS.active }}>
              <Text className="text-base font-semibold text-white">추가 입찰하기</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            className="flex-1 items-center rounded-full py-4"
            style={{ backgroundColor: COLORS.active }}
            onPress={handlePriceOffer}>
            <Text className="text-base font-semibold text-white">입찰하기</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
