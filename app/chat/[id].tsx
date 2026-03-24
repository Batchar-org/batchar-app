import { View, Text, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getChatById } from '../../mocks/chat';
import { COLORS, ICON_SIZES } from '../../constants/theme';
import { formatPrice } from '../../utils/format';

export default function ChatDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const chat = getChatById(id || '');

  if (!chat) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text>채팅을 찾을 수 없습니다.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      {/* 헤더 */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={ICON_SIZES.lg} color={COLORS.primary} />
        </TouchableOpacity>
        <View className="ml-2">
          <Text className="text-lg font-bold" style={{ color: COLORS.text }}>
            {chat.name}
          </Text>
          <Text className="text-xs" style={{ color: COLORS.textMuted }}>
            {chat.lastActiveTime}
          </Text>
        </View>
      </View>

      {/* 상품 정보 바 */}
      <View
        className="flex-row items-center px-4 py-3"
        style={{ borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
        <Image
          source={{ uri: chat.productImage }}
          className="h-10 w-10 rounded-lg"
          style={{ backgroundColor: COLORS.backgroundSecondary }}
        />
        <View className="ml-3 flex-1">
          <Text className="text-xs" style={{ color: COLORS.textSecondary }}>
            {chat.productName}
          </Text>
          <Text className="text-base font-bold" style={{ color: COLORS.text }}>
            {formatPrice(chat.productPrice)}원
          </Text>
        </View>
      </View>

      {/* 채팅 영역 */}
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* 날짜 구분선 */}
        <View className="my-5 flex-row items-center">
          <View className="flex-1 border-b" style={{ borderColor: COLORS.border }} />
          <Text className="mx-3 text-xs" style={{ color: COLORS.textMuted }}>
            2025년 11월 11일
          </Text>
          <View className="flex-1 border-b" style={{ borderColor: COLORS.border }} />
        </View>

        {/* 시스템 메시지 카드 */}
        <View
          className="mb-2 overflow-hidden rounded-2xl"
          style={{
            backgroundColor: COLORS.backgroundSecondary,
            borderWidth: 1,
            borderColor: COLORS.border,
          }}>
          {/* 상품 이미지 */}
          <View className="p-4 pb-0">
            <Image
              source={{ uri: chat.productImage }}
              className="h-14 w-14 rounded-lg"
              style={{ backgroundColor: COLORS.border }}
            />
          </View>

          {/* 안내 텍스트 */}
          <View className="px-4 pb-2 pt-3">
            <Text className="text-base font-bold leading-6" style={{ color: COLORS.text }}>
              {chat.name} 님과 {chat.productName}에 대한 이야기를 시작해 보세요.
            </Text>
          </View>

          {/* 상품 금액 */}
          <View className="px-4 pb-3">
            <Text className="text-sm" style={{ color: COLORS.textSecondary }}>
              상품금액: {formatPrice(chat.productPrice)}원
            </Text>
          </View>

          {/* 상품상세 보기 버튼 */}
          <View className="px-4 pb-4">
            <TouchableOpacity
              className="items-center rounded-xl py-3"
              style={{
                borderWidth: 1,
                borderColor: COLORS.primary,
              }}
              onPress={() => router.push(`/product/${chat.productId}`)}>
              <Text className="text-sm font-semibold" style={{ color: COLORS.primary }}>
                상품상세 보기
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 시간 표시 */}
        <Text className="mb-4 text-xs" style={{ color: COLORS.textMuted }}>
          15:00
        </Text>
      </ScrollView>

      {/* 거래 방식 버튼 */}
      <View className="flex-row gap-3 px-4 pb-3 pt-2">
        <TouchableOpacity
          className="flex-1 items-center rounded-full py-3"
          style={{ backgroundColor: COLORS.primary }}>
          <Text className="text-sm font-semibold text-white">직거래</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 items-center rounded-full py-3"
          style={{
            borderWidth: 1.5,
            borderColor: COLORS.primary,
          }}>
          <Text className="text-sm font-semibold" style={{ color: COLORS.primary }}>
            안전거래
          </Text>
        </TouchableOpacity>
      </View>

      {/* 메시지 입력 영역 */}
      <View
        className="flex-row items-center px-3 pb-2 pt-2"
        style={{ borderTopWidth: 1, borderTopColor: COLORS.border }}>
        <TouchableOpacity className="mr-2 p-1">
          <MaterialCommunityIcons
            name="plus-circle-outline"
            size={ICON_SIZES.lg}
            color={COLORS.textMuted}
          />
        </TouchableOpacity>
        <View
          className="flex-1 flex-row items-center rounded-full px-4 py-2"
          style={{ backgroundColor: COLORS.backgroundSecondary }}>
          <TextInput
            className="flex-1 text-sm"
            placeholder="메시지를 입력하세요."
            placeholderTextColor={COLORS.textMuted}
            editable={false}
            style={{ color: COLORS.text }}
          />
        </View>
        <TouchableOpacity className="ml-2 p-1">
          <MaterialCommunityIcons
            name="arrow-up-circle"
            size={ICON_SIZES.lg}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
