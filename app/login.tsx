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
import { useAuthActions } from '../store/useAuthStore';
import { COLORS } from '../constants/theme';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthActions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // 로그인 버튼 클릭 시 isLoggedIn = true 설정
  // RouteGuard가 상태 변경을 감지하여 자동으로 / 으로 리다이렉트합니다.
  // [TODO] 실제 API 호출 후 성공 시 login() 호출하도록 수정 필요
  const handleLogin = () => {
    login();
  };

  // 회원가입 버튼 클릭 시 회원가입 페이지로 이동
  const handleRegister = () => {
    router.push('/register');
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="flex-1 px-6 py-10">
            {/* 앱 로고 */}
            <View className="mb-12 mt-8 items-center">
              <Text className="text-5xl font-black" style={{ color: COLORS.primary }}>
                밭-찰!
              </Text>
            </View>

            {/* 로그인 타이틀 */}
            <Text className="mb-6 text-xl font-bold text-gray-900">Login</Text>

            {/* 이메일 입력 */}
            <View className="mb-6">
              <Text className="mb-2 text-sm font-medium text-gray-700">이메일 주소</Text>
              <View className="border-b border-gray-300">
                <TextInput
                  className="py-2 text-base text-gray-900"
                  placeholder="예) 12345678@hanbat.edu.kr"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* 비밀번호 입력 */}
            <View className="mb-8">
              <Text className="mb-2 text-sm font-medium text-gray-700">비밀번호</Text>
              <View className="flex-row items-center border-b border-gray-300">
                <TextInput
                  className="flex-1 py-2 text-base text-gray-900"
                  placeholder=""
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

            {/* 로그인 버튼 */}
            <TouchableOpacity
              onPress={handleLogin}
              className="mb-6 items-center rounded-full py-4"
              style={{ backgroundColor: COLORS.primary }}>
              <Text className="text-base font-semibold text-white">로그인</Text>
            </TouchableOpacity>

            {/* 회원가입 링크 */}
            <TouchableOpacity onPress={handleRegister} className="items-center">
              <Text className="text-sm text-gray-500">회원가입</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
