import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { Image } from 'expo-image';
import { IMAGE_TRANSITION_MS, IMAGE_PLACEHOLDER } from '@/lib/expo-image-setup';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AuctionPeriodPicker from '@/components/product/AuctionPeriodPicker';
import { useRouter } from 'expo-router';
import TabBar from '@/components/layout/TabBar';
import { useTabBarInset } from '@/hooks/useTabBarInset';
import { useTabBarScroll } from '@/contexts/TabBarScrollContext';
import { COLORS, INPUT_STYLE, LAYOUT } from '@/constants/theme';
import { CATEGORY_LABELS } from '@/constants/categories';
import { useCreateProductMutation } from '@/hooks/product/useCreateProductMutation';
import { useIsLoggedIn } from '@/store/useAuthStore';
import { compressImages } from '@/utils/compressImage';

const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_IMAGE_COUNT = 10;

export default function Register() {
  'use memo';
  const router = useRouter();
  const tabBarInset = useTabBarInset();
  const { scrollHandler } = useTabBarScroll();
  const isLoggedIn = useIsLoggedIn();
  const { mutate: createProduct, isPending } = useCreateProductMutation();

  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);

  // 경매 종료 시간
  const [endTime, setEndTime] = useState<Date | null>(null);

  // 카테고리 모달
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const handlePickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진 라이브러리 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGE_COUNT - images.length,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const compressed = await compressImages(result.assets);
      const total = [...images, ...compressed].slice(0, MAX_IMAGE_COUNT);
      setImages(total);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDescriptionChange = (text: string) => {
    if (text.length <= MAX_DESCRIPTION_LENGTH) {
      setDescription(text);
    }
  };

  const isFormValid =
    productName.trim() &&
    category &&
    description.trim() &&
    startingPrice.trim() &&
    endTime &&
    images.length > 0 &&
    !isPending;

  const handleSubmit = () => {
    if (!isLoggedIn) {
      Alert.alert('로그인 필요', '상품을 등록하려면 로그인이 필요합니다.');
      return;
    }

    if (!productName.trim()) {
      Alert.alert('입력 오류', '상품명을 입력해주세요.');
      return;
    }
    if (!category) {
      Alert.alert('입력 오류', '카테고리를 선택해주세요.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('입력 오류', '상품 설명을 입력해주세요.');
      return;
    }
    if (!startingPrice.trim() || Number(startingPrice) < 0) {
      Alert.alert('입력 오류', '올바른 시작가를 입력해주세요.');
      return;
    }
    if (!endTime) {
      Alert.alert('입력 오류', '경매 종료 시간을 선택해주세요.');
      return;
    }
    if (endTime <= new Date()) {
      Alert.alert('입력 오류', '경매 종료 시간은 현재보다 미래여야 합니다.');
      return;
    }
    if (images.length === 0) {
      Alert.alert('입력 오류', '사진을 최소 1장 이상 등록해주세요.');
      return;
    }

    createProduct(
      {
        request: {
          title: productName.trim(),
          description: description.trim(),
          category,
          startPrice: Number(startingPrice),
          endTime: endTime.toISOString(),
        },
        files: images,
      },
      {
        onSuccess: () => {
          Alert.alert('등록 완료', '상품이 등록되었습니다.', [
            { text: '확인', onPress: () => router.back() },
          ]);
        },
        onError: (error) => {
          Alert.alert('등록 실패', error.message);
        },
      }
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* 헤더 영역 — 하단 탭으로 접근하므로 뒤로가기 버튼 없음 */}
      <View className="items-center px-4 py-4">
        <Text className="text-lg font-bold">경매품 등록</Text>
      </View>

      {/* 스크롤 콘텐츠 영역 */}
      <Animated.ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarInset }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}>
        {/* 상세정보 섹션 */}
        <View className="py-4">
          <Text className="mb-4 text-base font-bold">상세정보</Text>

          {/* 사진/동영상 업로드 */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 pt-2.5">
            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                onPress={handlePickImages}
                className="h-20 w-20 items-center justify-center rounded-lg border-2 border-active">
                <MaterialCommunityIcons name="camera-outline" size={28} color={COLORS.active} />
                <Text className="mt-1 text-xs text-active">
                  {images.length}/{MAX_IMAGE_COUNT}
                </Text>
              </TouchableOpacity>

              {images.map((img, index) => (
                <View key={img.uri} className="relative">
                  <Image
                    source={{ uri: img.uri }}
                    className="h-20 w-20 rounded-lg"
                    transition={IMAGE_TRANSITION_MS}
                    placeholder={IMAGE_PLACEHOLDER}
                  />
                  <TouchableOpacity
                    onPress={() => handleRemoveImage(index)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    className="absolute -right-2 -top-2 h-5 w-5 items-center justify-center rounded-full bg-black/70">
                    <MaterialCommunityIcons name="close" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* 상품명 입력 */}
          <View className="border-b border-gray-200 py-3">
            <TextInput
              className="text-base"
              placeholder="상품명"
              placeholderTextColor={COLORS.textMuted}
              value={productName}
              onChangeText={setProductName}
              style={INPUT_STYLE}
            />
          </View>

          {/* 카테고리 선택 */}
          <TouchableOpacity
            onPress={() => setShowCategoryModal(true)}
            className="border-b border-gray-200 py-3">
            <Text className={category ? 'text-base text-black' : 'text-base text-gray-400'}>
              {category || '카테고리'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 설명 섹션 */}
        <View className="py-4">
          <Text className="mb-4 text-base font-bold">설명</Text>
          <View className="rounded-lg bg-gray-50 px-4 pb-6 pt-4">
            <TextInput
              className="h-32 text-base"
              placeholder={`• 브랜드, 모델명, 구매 시기, 하자 유무 등 상품 설명을 최대한 자세히 적어주세요.\n\n• 전화번호, SNS 계정 등 개인정보 입력은 제한될 수 있어요.`}
              placeholderTextColor={COLORS.textMuted}
              value={description}
              onChangeText={handleDescriptionChange}
              multiline
              textAlignVertical="top"
              style={{
                ...INPUT_STYLE,
                minHeight: 128,
                paddingTop: 12,
                backgroundColor: 'transparent',
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
              placeholderTextColor={COLORS.textMuted}
              value={startingPrice}
              onChangeText={setStartingPrice}
              keyboardType="numeric"
              style={INPUT_STYLE}
            />
          </View>
        </View>

        {/* 경매 기간 섹션 */}
        <View className="py-4">
          <Text className="mb-4 text-base font-bold">경매기간</Text>
          <AuctionPeriodPicker value={endTime} onChange={setEndTime} />
        </View>

        {/* 등록 완료 버튼 */}
        <View className="py-4">
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isPending}
            style={{
              minHeight: LAYOUT.inputMinHeight,
              backgroundColor: isFormValid ? COLORS.active : COLORS.inactive,
            }}
            className="items-center justify-center rounded-full py-4">
            {isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-base font-bold text-white">등록 완료</Text>
            )}
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>

      {/* 하단 탭바 */}
      <TabBar />

      {/* 카테고리 선택 모달 */}
      <Modal visible={showCategoryModal} transparent animationType="slide">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowCategoryModal(false)}
          className="flex-1 justify-end bg-black/40">
          <View className="max-h-[50%] rounded-t-2xl bg-white pb-8 pt-4">
            <Text className="mb-4 px-5 text-lg font-bold">카테고리 선택</Text>
            <FlatList
              data={CATEGORY_LABELS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setCategory(item);
                    setShowCategoryModal(false);
                  }}
                  className="px-5 py-3">
                  <Text
                    className="text-base"
                    style={{
                      color: category === item ? COLORS.active : COLORS.text,
                      fontWeight: category === item ? 'bold' : 'normal',
                    }}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
