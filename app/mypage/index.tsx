import { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import TabBar from '@/components/layout/TabBar';
import { COLORS, SHADOWS } from '@/constants/theme';
import { useAuthActions } from '@/store/useAuthStore';
import { useProductsQuery } from '@/hooks/product/useProductsQuery';
import { useUserProfileQuery } from '@/hooks/user/useUserProfileQuery';
import { useDeleteUserMutation } from '@/hooks/user/useDeleteUserMutation';
import type { ProductSummary } from '@/api/types';

function countByStatus(products: ProductSummary[]) {
  let bidding = 0;
  let inProgress = 0;
  let completed = 0;
  for (const p of products) {
    if (p.status === 'ON_SALE') bidding++;
    else if (
      p.status === 'ENDED' ||
      p.status === 'FAILED' ||
      p.status === 'CANCELED' ||
      p.status === 'TRADED'
    )
      completed++;
    else inProgress++;
  }
  return { total: products.length, bidding, inProgress, completed };
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

  const { data: bidsData } = useProductsQuery({ view: 'MY_BIDS' });
  const { data: productsData } = useProductsQuery({ view: 'MY_PRODUCTS' });

  const purchaseCounts = useMemo(() => countByStatus(bidsData?.content ?? []), [bidsData]);
  const saleCounts = useMemo(() => countByStatus(productsData?.content ?? []), [productsData]);

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '확인', onPress: () => logout() },
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
        logout();
      },
      onError: (error) => {
        setShowConfirmModal(false);
        Alert.alert('탈퇴 실패', error.message);
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* 헤더 */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.active} />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-lg font-bold text-gray-900">마이페이지</Text>
        </View>
        <View style={{ width: 28 }} />
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
                resizeMode="cover"
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

        {/* 구매/판매 내역 카드 */}
        <View className="mx-4 rounded-2xl bg-white p-5" style={SHADOWS.card}>
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
            <View className="w-full rounded-2xl bg-white px-6 pb-6 pt-8">
              <Text className="mb-4 text-center text-xl font-bold text-gray-900">회원탈퇴</Text>
              <Text className="mb-8 text-center text-sm leading-6 text-gray-500">
                서비스를 아껴주신 시간에 감사드립니다.{'\n'}고객님이 느끼셨던 점을 저희에게{'\n'}
                공유해주시면 더욱 건강한 서비스를{'\n'}제공할 수 있도록 하겠습니다.
              </Text>

              {WITHDRAWAL_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  className="mb-5 flex-row items-center"
                  onPress={() => setSelectedReason(reason)}>
                  <View
                    className="mr-3 h-5 w-5 items-center justify-center rounded-full border-2"
                    style={{
                      borderColor: selectedReason === reason ? COLORS.error : '#D1D5DB',
                      backgroundColor: selectedReason === reason ? COLORS.error : 'transparent',
                    }}>
                    {selectedReason === reason && (
                      <View className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </View>
                  <Text className="text-sm text-gray-700">{reason}</Text>
                </TouchableOpacity>
              ))}

              <View className="mt-8 flex-row">
                <TouchableOpacity
                  className="mr-3 flex-1 items-center rounded-lg border border-gray-200 py-3"
                  onPress={() => setShowWithdrawModal(false)}>
                  <Text className="text-sm font-semibold text-gray-500">취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 items-center rounded-lg py-3"
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
            <View className="w-full rounded-2xl bg-white px-6 py-6">
              <Text className="mb-2 text-center text-lg font-bold text-gray-900">회원탈퇴</Text>
              <Text className="mb-5 text-center text-sm leading-5 text-gray-500">
                탈퇴 버튼 선택 시, 계정은 삭제되며{'\n'}복구되지 않습니다.
              </Text>

              <View className="flex-row">
                <TouchableOpacity
                  className="mr-3 flex-1 items-center rounded-lg border border-gray-200 py-3"
                  onPress={() => setShowConfirmModal(false)}>
                  <Text className="text-sm font-semibold text-gray-500">취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 items-center rounded-lg py-3"
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
