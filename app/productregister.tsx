import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TabBar from '../components/layout/TabBar';
import { COLORS, INPUT_STYLE, LAYOUT } from '../constants/theme';

const MAX_DESCRIPTION_LENGTH = 2000;

export default function Register() {
  const [productName, setProductName] = useState('');
  const [category] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [auctionDate] = useState('');
  const [auctionTime] = useState('');

  const handleSubmit = () => {
    // 등록 로직 구현 예정
    console.log('등록 완료 버튼 클릭');
  };

  const handleDescriptionChange = (text: string) => {
    if (text.length <= MAX_DESCRIPTION_LENGTH) {
      setDescription(text);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      {/* 헤더 영역 */}
      <View className="flex-row items-center justify-between px-4 py-4">
        <View className="w-8" />
        <Text className="text-lg font-bold">경매품 등록</Text>
        <TouchableOpacity>
          <MaterialCommunityIcons name="dots-horizontal" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* 스크롤 콘텐츠 영역 */}
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}>
        {/* 상세정보 섹션 */}
        <View className="py-4">
          <Text className="mb-4 text-base font-bold">상세정보</Text>

          {/* 사진/동영상 업로드 버튼 */}
          <TouchableOpacity
            className="mb-4 h-20 w-20 items-center justify-center rounded-lg border-2"
            style={{ borderColor: COLORS.active }}>
            <MaterialCommunityIcons name="camera-outline" size={28} color={COLORS.active} />
            <Text className="mt-1 text-xs" style={{ color: COLORS.active }}>
              사진/동영상
            </Text>
          </TouchableOpacity>

          {/* 상품명 입력 */}
          <View className="border-b border-gray-200 py-3">
            <TextInput
              className="text-base"
              placeholder="상품명"
              placeholderTextColor="#9CA3AF"
              value={productName}
              onChangeText={setProductName}
              style={INPUT_STYLE}
            />
          </View>

          {/* 카테고리 선택 */}
          <TouchableOpacity className="flex-row items-center justify-between border-b border-gray-200 py-3">
            <Text className={category ? 'text-base text-black' : 'text-base text-gray-400'}>
              {category || '카테고리'}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* 설명 섹션 */}
        <View className="py-4">
          <Text className="mb-4 text-base font-bold">설명</Text>
          <View className="rounded-lg bg-gray-50 p-4">
            <TextInput
              className="h-32 text-base"
              placeholder={`• 브랜드, 모델명, 구매 시기, 하자 유무 등 상품 설명을\n  최대한 자세히 적어주세요.\n\n• 전화번호, SNS 계정 등 개인정보 입력은 제한될 수\n  있어요.`}
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={handleDescriptionChange}
              multiline
              textAlignVertical="top"
              style={{
                ...INPUT_STYLE,
                minHeight: 128,
                paddingTop: 12,
              }}
            />
            <Text className="mt-2 text-right text-sm text-gray-400">
              {description.length}/{MAX_DESCRIPTION_LENGTH}
            </Text>
          </View>
        </View>

        {/* 시작가 섹션 */}
        <View className="py-4">
          <Text className="mb-4 text-base font-bold">시작가</Text>
          <View className="border-b border-gray-200 py-3">
            <TextInput
              className="text-base"
              placeholder="가격"
              placeholderTextColor="#9CA3AF"
              value={startingPrice}
              onChangeText={setStartingPrice}
              keyboardType="numeric"
              style={INPUT_STYLE}
            />
          </View>
        </View>

        {/* 경매 기간 섹션 */}
        <View className="py-4">
          <Text className="mb-4 text-base font-bold">경매 기간</Text>
          <TouchableOpacity className="flex-row items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
            <View className="flex-row items-center">
              <Text className={auctionDate ? 'text-base text-black' : 'text-base text-gray-400'}>
                {auctionDate || 'YYYY-MM-DD'}
              </Text>
              <Text className="mx-3 text-gray-300">|</Text>
              <Text className={auctionTime ? 'text-base text-black' : 'text-base text-gray-400'}>
                {auctionTime || '00:00'}
              </Text>
            </View>
            <MaterialCommunityIcons name="calendar-outline" size={24} color={COLORS.active} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 등록 완료 버튼 */}
      <View className="px-5 pb-2">
        <TouchableOpacity
          onPress={handleSubmit}
          style={{ minHeight: LAYOUT.inputMinHeight, backgroundColor: COLORS.active }}
          className="items-center justify-center rounded-full py-4">
          <Text className="text-base font-bold text-white">등록 완료</Text>
        </TouchableOpacity>
      </View>

      {/* 하단 탭바 */}
      <TabBar />
    </SafeAreaView>
  );
}
