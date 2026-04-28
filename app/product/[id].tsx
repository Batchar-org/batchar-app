import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
  Pressable,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useProductDetailQuery } from '@/hooks/product/useProductDetailQuery';
import { useBidHistoryQuery } from '@/hooks/bid/useBidHistoryQuery';
import { usePlaceBidMutation } from '@/hooks/bid/usePlaceBidMutation';
import { COLORS, LAYOUT } from '@/constants/theme';
import { formatPrice } from '@/utils/format';
import useAuthStore from '@/store/useAuthStore';
import { useToggleWishMutation } from '@/hooks/wish/useToggleWishMutation';
import { useCloseProductMutation } from '@/hooks/product/useCloseProductMutation';
import { useProductSSE } from '@/hooks/product/useProductSSE';

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

function formatEndDate(endTimeStr: string): string {
  const date = new Date(endTimeStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const period = hours >= 12 ? '오후' : '오전';
  const displayHours = hours > 12 ? hours - 12 : hours || 12;
  return `${month}/${day} ${displayHours}:${minutes} ${period}`;
}

const MAX_BAR_HEIGHT = 120;

function formatBidTime(createdAt: string): string {
  const date = new Date(createdAt);
  const y = String(date.getFullYear()).slice(2);
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}/${m}/${d} ${h}:${min}`;
}

export default function ProductDetail() {
  const { width: screenWidth } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bidModalVisible, setBidModalVisible] = useState(false);
  const [bidPrice, setBidPrice] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const productId = Number(id) || 0;
  const userId = useAuthStore((state) => state.userId);
  const { data: product, isLoading, isError } = useProductDetailQuery(productId);
  const { data: bidHistory } = useBidHistoryQuery(productId, { size: 3 });
  const { data: bidTrend } = useBidHistoryQuery(productId, { size: 10 });
  const { mutate: toggleWish } = useToggleWishMutation();
  const { mutate: placeBid, isPending: isBidding } = usePlaceBidMutation();
  const { mutate: closeProduct, isPending: isClosing } = useCloseProductMutation();

  // SSE 실시간 입찰 업데이트 (경매 진행 중일 때만)
  useProductSSE({
    productId,
    enabled: product?.status === 'ON_SALE',
  });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.active} />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.active} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !product) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.active} />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-sm text-gray-500">상품을 찾을 수 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isOwner = userId !== null && product.seller_id === userId;
  const images = product.media_urls.map((m) => m.url);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / screenWidth);
    setCurrentImageIndex(index);
  };

  const handleOpenBidModal = () => {
    setBidPrice('');
    setBidModalVisible(true);
  };

  const handlePlaceBid = () => {
    const price = Number(bidPrice);
    if (!price || price <= product.current_price) {
      Alert.alert('입찰 실패', '현재가보다 높은 금액을 입력해주세요.');
      return;
    }
    Alert.alert('입찰 확인', '입찰 후에는 취소가 불가능합니다. 입찰하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '입찰하기',
        onPress: () => {
          placeBid(
            { productId, price },
            {
              onSuccess: () => {
                setBidModalVisible(false);
                Alert.alert('입찰 완료', '입찰이 성공적으로 등록되었습니다.');
              },
              onError: (error) => {
                Alert.alert('입찰 실패', error.message);
              },
            }
          );
        },
      },
    ]);
  };

  const isAuctionActive = product.status === 'ON_SALE';
  const bidRecords = bidHistory?.content ?? [];

  const handleAwardAuction = () => {
    Alert.alert(
      '낙찰 확인',
      `최고가 입찰자(${bidRecords[0]?.bidder_name})에게 낙찰됩니다. 진행하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '낙찰하기',
          onPress: () => {
            closeProduct(productId, {
              onSuccess: () => {
                Alert.alert('낙찰 완료', '낙찰이 완료되었습니다.');
              },
              onError: (error) => {
                Alert.alert('낙찰 실패', error.message);
              },
            });
          },
        },
      ]
    );
  };

  // 가격 추이: 입찰 기록을 시간순(오래된 순)으로 정렬하여 바 차트 생성
  const trendBids = [...(bidTrend?.content ?? [])].reverse();
  const maxPrice = trendBids.length > 0 ? Math.max(...trendBids.map((b) => b.price)) : 0;
  const minPrice = trendBids.length > 0 ? Math.min(...trendBids.map((b) => b.price)) : 0;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'bottom']}>
      {/* 헤더 */}
      <View className="flex-row items-center justify-between bg-white px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.active} />
        </TouchableOpacity>
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.push('/')}>
            <MaterialCommunityIcons name="home-outline" size={22} color={COLORS.active} />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: LAYOUT.screenPadding }}>
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
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}>
            {images.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img }}
                style={{ width: screenWidth, height: 280 }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          {/* 페이지 인디케이터 */}
          <View
            pointerEvents="none"
            className="absolute bottom-4 right-4 rounded-full px-3 py-1"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
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
                {product.seller_name || '판매자'}
              </Text>
            </View>
          </View>
        </View>

        {/* 상품 제목 */}
        <View className="flex-row items-start justify-between bg-white px-4 pb-4 pt-2">
          <Text className="flex-1 text-xl font-bold text-gray-900">{product.title}</Text>
          <TouchableOpacity
            className="ml-2 pt-1"
            onPress={() => toggleWish({ productId, isWished: !!product.is_wished })}>
            <MaterialCommunityIcons
              name={product.is_wished ? 'heart' : 'heart-outline'}
              size={24}
              color={product.is_wished ? COLORS.active : '#D1D5DB'}
            />
          </TouchableOpacity>
        </View>

        {/* 가격 정보 */}
        <View className="flex-row bg-white px-4 pb-4">
          <View className="mr-2 flex-1 items-center rounded-xl bg-gray-100 py-3">
            <Text className="text-xs text-gray-500">시작가</Text>
            <Text className="mt-1 text-lg font-bold text-gray-900">
              {formatPrice(product.start_price)}원
            </Text>
          </View>
          <View
            className="flex-1 items-center rounded-xl py-3"
            style={{ backgroundColor: COLORS.active }}>
            <Text className="text-xs text-white/80">현재가</Text>
            <Text className="mt-1 text-lg font-bold text-white">
              {formatPrice(product.current_price)}원
            </Text>
          </View>
        </View>

        {/* 입찰 상태 알림 */}
        {bidRecords.length > 0 && !isOwner && (
          <View
            className="mx-4 mb-2 flex-row items-center rounded-xl px-4 py-3"
            style={{ backgroundColor: product.is_top_bidder ? '#E8F5E9' : '#FFF8E1' }}>
            <MaterialCommunityIcons
              name={product.is_top_bidder ? 'check-circle' : 'alert-circle-outline'}
              size={20}
              color={product.is_top_bidder ? COLORS.active : '#FFA000'}
            />
            <Text
              className="ml-2 flex-1 text-sm font-medium"
              style={{ color: product.is_top_bidder ? COLORS.active : '#F57C00' }}>
              {product.is_top_bidder
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
              {product.end_time ? formatRemainingTime(product.end_time) : '-'}
            </Text>
          </View>
          <Text className="text-sm text-gray-500">
            마감일: {product.end_time ? formatEndDate(product.end_time) : '-'}
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
            <Text className="w-20 text-sm text-gray-500">입찰자</Text>
            <Text className="flex-1 text-right text-sm font-medium text-gray-900">
              {product.bid_count}명
            </Text>
          </View>
          <View className="flex-row py-3">
            <Text className="w-20 text-sm text-gray-500">찜</Text>
            <Text className="flex-1 text-right text-sm font-medium text-gray-900">
              {product.wish_count}개
            </Text>
          </View>
        </View>

        {/* 구분선 */}
        <View className="h-2 bg-gray-100" />

        {/* 가격 추이 */}
        <View className="bg-white px-4 py-4">
          <Text className="mb-4 text-base font-bold text-gray-900">가격 추이</Text>
          {trendBids.length === 0 ? (
            <Text className="py-4 text-center text-sm text-gray-400">
              아직 입찰 기록이 없습니다.
            </Text>
          ) : (
            <View className="flex-row items-end justify-around px-2">
              {trendBids.map((bid, index) => {
                const ratio =
                  maxPrice === minPrice ? 1 : (bid.price - minPrice) / (maxPrice - minPrice);
                const barHeight = Math.max(30, ratio * MAX_BAR_HEIGHT);
                const date = new Date(bid.created_at);
                const label = `${date.getMonth() + 1}/${date.getDate()}`;
                return (
                  <View key={bid.bid_id} className="items-center" style={{ flex: 1 }}>
                    <Text className="mb-1 text-xs text-gray-500">{formatPrice(bid.price)}</Text>
                    <View
                      className="w-10 rounded-t-md"
                      style={{
                        height: barHeight,
                        backgroundColor: COLORS.active,
                        opacity: 0.5 + (index / Math.max(trendBids.length - 1, 1)) * 0.5,
                      }}
                    />
                    <Text className="mt-2 text-xs text-gray-500">{label}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* 구분선 */}
        <View className="h-2 bg-gray-100" />

        {/* 입찰 기록 */}
        <View className="bg-white px-4 py-4">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-base font-bold text-gray-900">입찰 기록</Text>
          </View>
          {bidRecords.length === 0 ? (
            <Text className="py-4 text-center text-sm text-gray-400">
              아직 입찰 기록이 없습니다.
            </Text>
          ) : (
            <View>
              {bidRecords.map((bid, index) => {
                const isHighest = index === 0;
                return (
                  <View
                    key={bid.bid_id}
                    className={`py-4 ${
                      index !== bidRecords.length - 1 ? 'border-b border-gray-100' : ''
                    }`}>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        {isHighest && (
                          <View
                            className="mr-2 rounded-md px-1.5 py-0.5"
                            style={{ backgroundColor: COLORS.primaryLight }}>
                            <Text className="text-xs font-bold" style={{ color: COLORS.active }}>
                              최고가
                            </Text>
                          </View>
                        )}
                        <Text className="text-base font-medium text-gray-900">
                          {bid.bidder_name}
                        </Text>
                      </View>
                      <Text className="text-base font-bold" style={{ color: COLORS.active }}>
                        {formatPrice(bid.price)}원
                      </Text>
                    </View>
                    <Text className="mt-1 text-xs text-gray-400">
                      {formatBidTime(bid.created_at)}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* 하단 여백 */}
        <View className="h-4" />
      </ScrollView>

      {/* 하단 버튼 */}
      <View className="flex-row items-center border-t border-gray-100 bg-white px-4 py-3">
        <TouchableOpacity
          className="mr-4 p-1"
          onPress={() => toggleWish({ productId, isWished: !!product.is_wished })}>
          <MaterialCommunityIcons
            name={product.is_wished ? 'heart' : 'heart-outline'}
            size={28}
            color={product.is_wished ? COLORS.active : '#D1D5DB'}
          />
        </TouchableOpacity>

        {isOwner ? (
          <View className="flex-1 flex-row">
            {isAuctionActive && bidRecords.length > 0 && (
              <TouchableOpacity
                className="mr-2 flex-1 items-center rounded-full py-4"
                style={{
                  backgroundColor: '#EF4444',
                  opacity: isClosing ? 0.6 : 1,
                }}
                onPress={handleAwardAuction}
                disabled={isClosing}>
                <Text className="text-base font-semibold text-white">
                  {isClosing ? '처리 중...' : '낙찰하기'}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              className="flex-1 items-center rounded-full py-4"
              style={{ backgroundColor: COLORS.active }}
              onPress={() => router.push(`/product/edit/${productId}`)}>
              <Text className="text-base font-semibold text-white">수정하기</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            className="flex-1 items-center rounded-full py-4"
            style={{ backgroundColor: COLORS.active }}
            onPress={handleOpenBidModal}>
            <Text className="text-base font-semibold text-white">
              {product.is_top_bidder ? '추가 입찰하기' : '입찰하기'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 입찰 모달 */}
      <Modal visible={bidModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Pressable
            className="flex-1 justify-end"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onPress={() => {
              Keyboard.dismiss();
              setBidModalVisible(false);
            }}>
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                Keyboard.dismiss();
              }}>
              <View className="rounded-t-3xl bg-white px-5 pb-8 pt-6">
                <View className="mb-4 flex-row items-center justify-between">
                  <Text className="text-lg font-bold text-gray-900">입찰하기</Text>
                  <TouchableOpacity onPress={() => setBidModalVisible(false)}>
                    <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <View className="mb-2 flex-row items-center justify-between">
                  <Text className="text-sm text-gray-500">현재가</Text>
                  <Text className="text-base font-bold" style={{ color: COLORS.active }}>
                    {formatPrice(product.current_price)}원
                  </Text>
                </View>

                <View className="mb-4">
                  <Text className="mb-2 text-sm text-gray-500">입찰 금액</Text>
                  <TextInput
                    className="rounded-xl border border-gray-200 px-4 py-3 text-base"
                    placeholder="현재가보다 높은 금액을 입력하세요"
                    keyboardType="number-pad"
                    value={bidPrice}
                    onChangeText={setBidPrice}
                  />
                  {bidPrice !== '' && Number(bidPrice) > 0 && (
                    <Text className="mt-1 text-right text-sm text-gray-400">
                      {formatPrice(Number(bidPrice))}원
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  className="items-center rounded-full py-4"
                  style={{
                    backgroundColor: COLORS.active,
                    opacity: isBidding ? 0.6 : 1,
                  }}
                  onPress={handlePlaceBid}
                  disabled={isBidding}>
                  <Text className="text-base font-semibold text-white">
                    {isBidding ? '입찰 중...' : '입찰하기'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
