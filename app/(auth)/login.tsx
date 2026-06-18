import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, INPUT_STYLE, LAYOUT } from '@/constants/theme';
import PasswordResetModal from '@/components/modals/PasswordResetModal';
import Logo from '@/components/layout/Logo';
import { useLoginMutation } from '@/hooks/auth/useLoginMutation';
import { ApiError } from '@/services/errors';

type SuspensionDetails = {
  suspended_until?: string;
  remaining_seconds?: number;
};

function formatRemainingSeconds(totalSeconds: number): string {
  const seconds = Math.max(0, Math.ceil(totalSeconds));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.ceil((seconds % 3600) / 60);

  if (days > 0) return `${days}일 ${hours}시간`;
  if (hours > 0) return `${hours}시간 ${minutes}분`;
  return `${minutes}분`;
}

function getSuspensionDetails(details: unknown): SuspensionDetails | null {
  if (!details || typeof details !== 'object') return null;
  return details as SuspensionDetails;
}

function getSuspensionRemainingSeconds(error: unknown): number | null {
  if (error instanceof ApiError && error.code === 'USER_SUSPENDED') {
    const details = getSuspensionDetails(error.details);
    if (typeof details?.remaining_seconds === 'number') return details.remaining_seconds;
    if (details?.suspended_until) {
      return Math.ceil((new Date(details.suspended_until).getTime() - Date.now()) / 1000);
    }
  }
  return null;
}

function isSuspendedLoginError(error: unknown): boolean {
  return error instanceof ApiError && error.code === 'USER_SUSPENDED';
}

function getLoginErrorMessage(error: unknown): string | null {
  if (isSuspendedLoginError(error)) return null;
  if (!(error instanceof Error)) return '로그인에 실패했습니다.';
  return error.message;
}

function showSuspensionAlert(error: unknown): void {
  const remainingSeconds = getSuspensionRemainingSeconds(error);
  if (remainingSeconds === null) {
    Alert.alert('정지된 계정입니다', '정지 기간 동안 로그인할 수 없습니다.');
    return;
  }

  Alert.alert(
    '정지된 계정입니다',
    `정지 기간 동안 로그인할 수 없습니다.\n남은 시간: ${formatRemainingSeconds(remainingSeconds)}`
  );
}

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLoginMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isResetModalVisible, setIsResetModalVisible] = useState(false);

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      return;
    }

    loginMutation.mutate(
      {
        email: email.trim(),
        password,
      },
      {
        onError: (error) => {
          if (isSuspendedLoginError(error)) {
            showSuspensionAlert(error);
          }
        },
      }
    );
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
            <View className="mb-28 mt-12 items-center">
              <Logo height={44} />
            </View>

            {/* 로그인 타이틀 */}
            <Text className="mb-6 text-xl font-bold text-gray-900">로그인</Text>

            {/* 이메일 입력 */}
            <View className="mb-6">
              <Text className="mb-2 text-sm font-medium text-gray-700">이메일 주소</Text>
              <View className="border-b border-gray-300">
                <TextInput
                  className="text-base text-gray-900"
                  placeholder="예) 학번@(edu/o365).hanbat.edu.kr"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={INPUT_STYLE}
                />
              </View>
            </View>

            {/* 비밀번호 입력 */}
            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-gray-700">비밀번호</Text>
              <View className="flex-row items-center border-b border-gray-300">
                <TextInput
                  className="flex-1 text-base text-gray-900"
                  placeholder="비밀번호를 입력해주세요"
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={INPUT_STYLE}
                />
                <TouchableOpacity
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  style={{ minHeight: LAYOUT.touchTargetMinHeight }}
                  className="items-center justify-center p-1">
                  <Feather
                    name={isPasswordVisible ? 'eye' : 'eye-off'}
                    size={20}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* 비밀번호 찾기 */}
            <TouchableOpacity
              onPress={() => setIsResetModalVisible(true)}
              className="mb-8 self-end">
              <Text className="text-sm text-gray-400">비밀번호를 잃어버리셨나요?</Text>
            </TouchableOpacity>

            {loginMutation.isError && getLoginErrorMessage(loginMutation.error) && (
              <Text className="mb-4 text-sm text-red-500">
                {getLoginErrorMessage(loginMutation.error)}
              </Text>
            )}

            {/* 로그인 버튼 */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loginMutation.isPending}
              className="mb-6 items-center rounded-full py-4"
              style={{
                backgroundColor: loginMutation.isPending ? COLORS.disabled : COLORS.primary,
              }}>
              <Text className="text-base font-semibold text-white">
                {loginMutation.isPending ? '로그인 중...' : '로그인'}
              </Text>
            </TouchableOpacity>

            {/* 회원가입 링크 */}
            <TouchableOpacity onPress={handleRegister} className="items-center">
              <Text className="text-sm text-gray-500">회원가입</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <PasswordResetModal
        visible={isResetModalVisible}
        onClose={() => setIsResetModalVisible(false)}
      />
    </SafeAreaView>
  );
}
