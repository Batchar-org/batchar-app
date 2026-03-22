import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../constants/theme';
import { useAuthActions } from '../store/useAuthStore';
import EmailVerifyModal from '../components/modals/EmailVerifyModal';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthActions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  // 이메일 인증 모달 상태
  const [isVerifyModalVisible, setIsVerifyModalVisible] = useState(false);

  // 뒤로가기 → 로그인 페이지
  const handleBack = () => {
    router.back();
  };

  // 이메일 인증하기 버튼
  const handleOpenVerifyModal = () => {
    setIsVerifyModalVisible(true);
    // [TODO] 이메일 인증 코드 발송 API 호출
  };

  // 인증 완료 → login() 호출, RouteGuard가 / 로 리다이렉트
  // [TODO] 인증 코드 검증 API 성공 후 호출하도록 수정
  const handleVerifyComplete = () => {
    setIsVerifyModalVisible(false);
    login();
  };

  // 회원가입 버튼 클릭 (추후 API 연동)
  const handleRegister = () => {
    // [TODO] 회원가입 API 호출 후 성공 시 handleVerifyComplete 호출
    console.log('회원가입 버튼 클릭', { email, password, name, address });
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* 헤더: 뒤로가기 버튼 (chevron-left 단독 아이콘) */}
        <View className="flex-row items-center px-2 py-3">
          <TouchableOpacity onPress={handleBack} className="p-2">
            <Feather name="chevron-left" size={28} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="flex-1 px-6 pb-10 pt-4">
            {/* 앱 로고 */}
            <View className="mb-10 items-center">
              <Text className="text-5xl font-black" style={{ color: COLORS.primary }}>
                밭-찰!
              </Text>
            </View>

            {/* 타이틀 */}
            <Text className="mb-6 text-xl font-bold text-gray-900">회원가입</Text>

            {/* 이름 입력 */}
            <View className="mb-6">
              <Text className="mb-2 text-sm font-medium text-gray-700">이름</Text>
              <View className="border-b border-gray-300">
                <TextInput
                  className="py-2 text-base text-gray-900"
                  placeholder="이름을 입력해주세요"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* 이메일 입력 */}
            <View className="mb-6">
              <Text className="mb-2 text-sm font-medium text-gray-700">이메일 주소</Text>
              <View className="flex-row items-center border-b border-gray-300">
                <TextInput
                  className="flex-1 py-2 text-base text-gray-900"
                  placeholder="예) 12345678@hanbat.edu.kr"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {/* 이메일 인증하기 버튼 — 입력 필드 우측 */}
                <TouchableOpacity
                  onPress={handleOpenVerifyModal}
                  className="ml-2 rounded-full px-3 py-1"
                  style={{ backgroundColor: COLORS.primary }}>
                  <Text className="text-xs font-semibold text-white">이메일 인증</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 비밀번호 입력 */}
            <View className="mb-6">
              <Text className="mb-2 text-sm font-medium text-gray-700">비밀번호</Text>
              <View className="flex-row items-center border-b border-gray-300">
                <TextInput
                  className="flex-1 py-2 text-base text-gray-900"
                  placeholder="비밀번호를 입력해주세요"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="p-1">
                  <Feather name={isPasswordVisible ? 'eye' : 'eye-off'} size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* 주소 입력 */}
            <View className="mb-10">
              <Text className="mb-2 text-sm font-medium text-gray-700">주소</Text>
              <View className="border-b border-gray-300">
                <TextInput
                  className="py-2 text-base text-gray-900"
                  placeholder="주소를 입력해주세요"
                  placeholderTextColor="#9CA3AF"
                  value={address}
                  onChangeText={setAddress}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* 회원가입 버튼 */}
            <TouchableOpacity
              onPress={handleRegister}
              className="items-center rounded-full py-4"
              style={{ backgroundColor: COLORS.primary }}>
              <Text className="text-base font-semibold text-white">회원가입</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 이메일 인증 모달 — components/modals/EmailVerifyModal.tsx */}
      <EmailVerifyModal
        visible={isVerifyModalVisible}
        onClose={() => setIsVerifyModalVisible(false)}
        onVerifyComplete={handleVerifyComplete}
        onResend={() => {
          // [TODO] 인증 코드 재발송 API 호출
          console.log('인증 번호 재전송');
        }}
      />
    </SafeAreaView>
  );
}
