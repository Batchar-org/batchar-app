import { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { IMAGE_TRANSITION_MS, IMAGE_PLACEHOLDER } from '@/lib/expo-image-setup';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import TabBar from '@/components/layout/TabBar';
import FertilityCard from '@/components/fertility/FertilityCard';
import { COLORS, SHADOWS } from '@/constants/theme';
import { FERTILITY_BASE } from '@/constants/fertility';
import { POLICY_URLS } from '@/constants/policy';
import { useAuthActions } from '@/store/useAuthStore';
import { useProductsQuery } from '@/hooks/product/useProductsQuery';
import { useUserProfileQuery } from '@/hooks/user/useUserProfileQuery';
import { useDeleteUserMutation } from '@/hooks/user/useDeleteUserMutation';
import { unregisterPushNotifications } from '@/lib/pushNotifications';
import type { ProductSummary } from '@/api/types';

function countByStatus(products: ProductSummary[], view: 'MY_BIDS' | 'MY_PRODUCTS') {
  let bidding = 0;
  let inProgress = 0;
  let completed = 0;
  const visibleProducts =
    view === 'MY_BIDS' ? products.filter((p) => p.status === 'ON_SALE' || p.is_winner) : products;

  for (const p of visibleProducts) {
    if (p.status === 'ON_SALE') {
      if (view === 'MY_BIDS' || p.bid_count > 0) bidding++;
    } else if (p.status === 'ENDED') {
      if (view === 'MY_PRODUCTS' || p.is_winner) inProgress++;
    } else if (p.status === 'FAILED' || p.status === 'CANCELED' || p.status === 'TRADED')
      completed++;
  }
  return { total: visibleProducts.length, bidding, inProgress, completed };
}

const WITHDRAWAL_REASONS = [
  '사이트 방문을 잘 하지 않아요',
  '물건 판매가 어려워요',
  '주문 과정이 불편해요',
  '기타',
];

export default function MyPage() {
  const { logout } = useAuthActions();
  const { data: profile } = useUserProfileQuery();
  const router = useRouter();
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  const deleteUserMutation = useDeleteUserMutation();
  const queryClient = useQueryClient();

  const { data: bidsData } = useProductsQuery({ view: 'MY_BIDS' });
  const { data: productsData } = useProductsQuery({ view: 'MY_PRODUCTS' });

  const purchaseCounts = useMemo(
    () => countByStatus(bidsData?.content ?? [], 'MY_BIDS'),
    [bidsData]
  );
  const saleCounts = useMemo(
    () => countByStatus(productsData?.content ?? [], 'MY_PRODUCTS'),
    [productsData]
  );

  // 로그아웃: 푸시 토큰 해제(access 유효할 때 먼저) + 앱 아이콘 배지 0 + 쿼리 캐시 정리
  const performLogout = async () => {
    await unregisterPushNotifications();
    await logout();
    await Notifications.setBadgeCountAsync(0);
    queryClient.clear();
  };

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '확인', onPress: () => void performLogout() },
    ]);
  };

  const handleWithdrawPress = () => {
    setSelectedReason(null);
    setShowWithdrawModal(true);
  };

  const handleWithdrawSubmit = () => {
    setShowWithdrawModal(false);
    setShowConfirmModal(true);
  };

  const handleConfirmWithdraw = () => {
    deleteUserMutation.mutate(undefined, {
      onSuccess: () => {
        setShowConfirmModal(false);
        void performLogout();
      },
      onError: (error) => {
        setShowConfirmModal(false);
        Alert.alert('탈퇴 실패', error.message);
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* 헤더 — 하단 탭으로 접근하므로 뒤로가기 버튼 없음 */}
      <View className="items-center px-4 py-3">
        <Text className="text-lg font-bold text-gray-900">마이페이지</Text>
      </View>

      <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
        {/* 프로필 섹션 */}
        <View className="items-center pb-6 pt-4">
          <View
            className="mb-3 h-24 w-24 items-center justify-center overflow-hidden rounded-full"
            style={{ backgroundColor: COLORS.primary }}>
            {profile?.profile_image_url ? (
              <Image
                source={{ uri: profile.profile_image_url }}
                className="h-full w-full"
                contentFit="cover"
                transition={IMAGE_TRANSITION_MS}
                placeholder={IMAGE_PLACEHOLDER}
              />
            ) : (
              <MaterialCommunityIcons name="account" size={48} color="white" />
            )}
          </View>
          <Text className="mb-2 text-xl font-bold text-gray-900">{profile?.name ?? '사용자'}</Text>
          <TouchableOpacity
            className="rounded-full border px-4 py-1.5"
            style={{ borderColor: COLORS.primary }}
            onPress={() => router.push('/mypage/edit-profile')}>
            <Text className="text-sm font-medium" style={{ color: COLORS.primary }}>
              내 정보 수정
            </Text>
          </TouchableOpacity>
        </View>

        {/* 밭비옥도 (당근 매너온도 패러디) */}
        <FertilityCard percent={profile?.fertility ?? FERTILITY_BASE} />

        {/* 구매/판매 내역 카드 */}
        <View className="mx-4 mt-4 rounded-2xl bg-white p-5" style={SHADOWS.card}>
          <Text className="mb-3 text-base font-bold text-gray-900">구매 내역</Text>
          <TouchableOpacity
            className="mb-5 flex-row rounded-xl border border-gray-200 bg-white py-3"
            onPress={() => router.push('/mypage/purchase-history')}>
            {[
              { label: '전체', count: purchaseCounts.total },
              { label: '입찰 중', count: purchaseCounts.bidding },
              { label: '진행 중', count: purchaseCounts.inProgress },
              { label: '종료', count: purchaseCounts.completed },
            ].map(({ label, count }) => (
              <View key={label} className="flex-1 items-center">
                <Text className="mb-1 text-sm text-gray-500">{label}</Text>
                <Text
                  className="text-base font-bold"
                  style={{ color: label === '전체' ? COLORS.primary : COLORS.text }}>
                  {count}
                </Text>
              </View>
            ))}
          </TouchableOpacity>

          <Text className="mb-3 text-base font-bold text-gray-900">판매 내역</Text>
          <TouchableOpacity
            className="flex-row rounded-xl border border-gray-200 bg-white py-3"
            onPress={() => router.push('/mypage/sale-history')}>
            {[
              { label: '전체', count: saleCounts.total },
              { label: '입찰 중', count: saleCounts.bidding },
              { label: '진행 중', count: saleCounts.inProgress },
              { label: '종료', count: saleCounts.completed },
            ].map(({ label, count }) => (
              <View key={label} className="flex-1 items-center">
                <Text className="mb-1 text-sm text-gray-500">{label}</Text>
                <Text
                  className="text-base font-bold"
                  style={{ color: label === '전체' ? COLORS.primary : COLORS.text }}>
                  {count}
                </Text>
              </View>
            ))}
          </TouchableOpacity>
        </View>

        {/* 알림 설정 카드 */}
        <View className="mx-4 mt-4 rounded-2xl bg-white px-5 py-4" style={SHADOWS.card}>
          <TouchableOpacity
            onPress={() => router.push('/mypage/notification-settings')}
            className="py-2">
            <Text className="text-base font-bold text-gray-900">알림 설정</Text>
          </TouchableOpacity>
        </View>

        {/* 차단 목록 카드 */}
        <View className="mx-4 mt-4 rounded-2xl bg-white px-5 py-4" style={SHADOWS.card}>
          <TouchableOpacity onPress={() => router.push('/mypage/blocked-users')} className="py-2">
            <Text className="text-base font-bold text-gray-900">차단 목록</Text>
          </TouchableOpacity>
        </View>

        {/* 약관 카드 */}
        <View className="mx-4 mt-4 rounded-2xl bg-white px-5 py-4" style={SHADOWS.card}>
          <TouchableOpacity
            onPress={() => Linking.openURL(POLICY_URLS.termsOfService)}
            className="py-2">
            <Text className="text-base font-bold text-gray-900">이용약관</Text>
          </TouchableOpacity>
          <View className="my-2 h-px bg-gray-100" />
          <TouchableOpacity
            onPress={() => Linking.openURL(POLICY_URLS.privacyPolicy)}
            className="py-2">
            <Text className="text-base font-bold text-gray-900">개인정보처리방침</Text>
          </TouchableOpacity>
        </View>

        {/* 로그아웃 / 회원 탈퇴 카드 */}
        <View className="mx-4 mt-4 rounded-2xl bg-white px-5 py-4" style={SHADOWS.card}>
          <TouchableOpacity onPress={handleLogout} className="py-2">
            <Text className="text-base font-bold text-gray-900">로그아웃</Text>
          </TouchableOpacity>
          <View className="my-2 h-px bg-gray-100" />
          <TouchableOpacity onPress={handleWithdrawPress} className="py-2">
            <Text className="text-base font-medium" style={{ color: COLORS.error }}>
              회원 탈퇴
            </Text>
          </TouchableOpacity>
        </View>

        <View className="h-8" />
      </ScrollView>

      <TabBar />

      {/* 회원탈퇴 사유 선택 모달 */}
      <Modal
        visible={showWithdrawModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWithdrawModal(false)}>
        <Pressable
          className="flex-1 items-center justify-center px-8"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={() => setShowWithdrawModal(false)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="w-full rounded-2xl bg-white px-12 pb-10 pt-12">
              <Text className="mb-4 text-center text-xl font-bold text-gray-900">회원탈퇴</Text>
              <Text className="mb-7 text-center text-sm leading-5 text-black">
                서비스를 아껴주신 시간에 감사드립니다.{'\n'}고객님이 느끼셨던 점을 저희에게{'\n'}
                공유해주시면 더욱 건강한 서비스를{'\n'}제공할 수 있도록 하겠습니다.
              </Text>

              {WITHDRAWAL_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  className="mb-5 flex-row items-center"
                  onPress={() => setSelectedReason(reason)}>
                  <View
                    className="mr-3.5 h-6 w-6 items-center justify-center rounded-full border-2"
                    style={{
                      borderColor: selectedReason === reason ? COLORS.error : COLORS.inactive,
                      backgroundColor: selectedReason === reason ? COLORS.error : 'transparent',
                    }}>
                    {selectedReason === reason && (
                      <View className="h-2.5 w-2.5 rounded-full bg-white" />
                    )}
                  </View>
                  <Text className="text-[14px] text-black">{reason}</Text>
                </TouchableOpacity>
              ))}

              <View className="mt-7 flex-row">
                <TouchableOpacity
                  className="mr-3 flex-1 items-center rounded-xl bg-gray-100 py-3.5"
                  onPress={() => setShowWithdrawModal(false)}>
                  <Text className="text-sm font-semibold text-gray-600">취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 items-center rounded-xl py-3.5"
                  style={{ backgroundColor: COLORS.error }}
                  onPress={handleWithdrawSubmit}>
                  <Text className="text-sm font-semibold text-white">탈퇴 하기</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* 회원탈퇴 최종 확인 모달 */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}>
        <Pressable
          className="flex-1 items-center justify-center px-10"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={() => setShowConfirmModal(false)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="w-full rounded-2xl bg-white px-12 py-6">
              <Text className="mb-2 text-center text-lg font-bold text-gray-900">회원탈퇴</Text>
              <Text className="mb-5 text-center text-sm leading-5 text-black">
                탈퇴 버튼 선택 시, 계정은 삭제되며{'\n'}복구되지 않습니다.
              </Text>

              <View className="flex-row">
                <TouchableOpacity
                  className="mr-3 flex-1 items-center rounded-xl bg-gray-100 py-3.5"
                  onPress={() => setShowConfirmModal(false)}>
                  <Text className="text-sm font-semibold text-gray-600">취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 items-center rounded-xl py-3.5"
                  style={{ backgroundColor: COLORS.error }}
                  onPress={handleConfirmWithdraw}>
                  <Text className="text-sm font-semibold text-white">탈퇴</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
