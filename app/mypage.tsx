import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import TabBar from '../components/layout/TabBar';
import { COLORS } from '../constants/theme';
import { MOCK_MILESTONES, MOCK_REWARDS, MOCK_FERTILITY } from '../mocks/mypage';
import { useAuthActions } from '../store/useAuthStore';

export default function MyPage() {
  const { logout } = useAuthActions();
  const fertilityProgress = MOCK_FERTILITY.progress;

  // 로그아웃: isLoggedIn = false 설정 후 RouteGuard가 /login으로 자동 리다이렉트
  const handleLogout = () => {
    logout();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'bottom']}>
      {/* 헤더 */}
      <View className="items-center justify-center py-4">
        <Text className="text-lg font-bold text-gray-900">마이페이지</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 밭 비옥도 카드 */}
        <View className="mx-4 overflow-hidden rounded-2xl" style={{ backgroundColor: '#E8E4DC' }}>
          {/* 비옥도 정보 */}
          <View className="p-4">
            <Text className="text-sm text-gray-600">밭 비옥도</Text>
            <Text className="text-3xl font-bold text-gray-900">{fertilityProgress}%</Text>
          </View>

          {/* 캐릭터 이미지 */}
          <View className="items-center justify-center" style={{ height: 200 }}>
            <Image
              source={require('../assets/public/mypage.png')}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* 마일스톤 진행 바 */}
        <View className="mx-4 mt-4">
          {/* 진행 바 */}
          <View className="relative mb-2 h-2 rounded-full bg-gray-200">
            <View
              className="absolute left-0 top-0 h-2 rounded-full"
              style={{
                backgroundColor: COLORS.primary,
                width: `${(fertilityProgress / MOCK_FERTILITY.maxValue) * 100}%`,
              }}
            />
            {/* 마일스톤 점들 */}
            {MOCK_MILESTONES.map((milestone) => (
              <View
                key={milestone.id}
                className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white"
                style={{
                  left: `${(milestone.value / MOCK_FERTILITY.maxValue) * 100}%`,
                  marginLeft: -8,
                  backgroundColor: milestone.completed ? COLORS.primary : '#E5E7EB',
                }}
              />
            ))}
          </View>

          {/* 마일스톤 라벨 및 버튼 */}
          <View className="flex-row justify-between">
            {MOCK_MILESTONES.map((milestone, index) => (
              <View key={milestone.id} className="items-center">
                <Text className="mb-1 text-sm text-gray-600">{milestone.label}</Text>
                <TouchableOpacity
                  className="rounded-full px-3 py-1"
                  style={{
                    backgroundColor: milestone.completed ? COLORS.primary : '#E5E7EB',
                  }}>
                  <Text
                    className="text-xs font-medium"
                    style={{ color: milestone.completed ? 'white' : '#6B7280' }}>
                    {index === 0 ? '받음' : '받기'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* 보상 리스트 */}
        <View className="mx-4 mt-6 rounded-2xl bg-white p-4">
          {MOCK_REWARDS.map((reward, index) => (
            <View
              key={reward.id}
              className={`flex-row items-center py-4 ${
                index !== MOCK_REWARDS.length - 1 ? 'border-b border-gray-100' : ''
              }`}>
              {/* 아이콘 */}
              <View
                className="mr-4 h-12 w-12 rounded-full"
                style={{ backgroundColor: reward.color }}
              />

              {/* 텍스트 */}
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">{reward.title}</Text>
                <Text className="mt-1 text-sm text-gray-500">{reward.description}</Text>
              </View>

              {/* 받기 버튼 */}
              <TouchableOpacity
                className="rounded-full px-4 py-2"
                style={{ backgroundColor: COLORS.primary }}>
                <Text className="text-sm font-medium text-white">받기</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* 로그아웃 버튼 */}
        <View className="mx-4 mb-4 mt-8">
          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center justify-center rounded-full py-4"
            style={{ backgroundColor: COLORS.primary }}>
            <Feather name="log-out" size={18} color="white" style={{ marginRight: 8 }} />
            <Text className="text-base font-semibold text-white">로그아웃</Text>
          </TouchableOpacity>
        </View>

        {/* 하단 여백 */}
        <View className="h-4" />
      </ScrollView>

      {/* 하단 탭바 */}
      <TabBar />
    </SafeAreaView>
  );
}
