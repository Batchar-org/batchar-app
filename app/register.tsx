import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { COLORS, INPUT_STYLE } from '@/constants/theme';
import { POLICY_URLS } from '@/constants/policy';
import EmailVerifyModal from '@/components/modals/EmailVerifyModal';
import { useCheckEmailDuplicateMutation } from '@/hooks/auth/useCheckEmailDuplicateMutation';
import { useCheckNicknameDuplicateMutation } from '@/hooks/auth/useCheckNicknameDuplicateMutation';
import { useSendEmailCodeMutation } from '@/hooks/auth/useSendEmailCodeMutation';
import { useSignupMutation } from '@/hooks/auth/useSignupMutation';
import { useVerifyEmailCodeMutation } from '@/hooks/auth/useVerifyEmailCodeMutation';

const EMAIL_VERIFY_EXPIRE_SECONDS = 10 * 60;

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [checkedNickname, setCheckedNickname] = useState('');
  const [isVerifyModalVisible, setIsVerifyModalVisible] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [expireAt, setExpireAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  const checkEmailDuplicateMutation = useCheckEmailDuplicateMutation();
  const checkNicknameDuplicateMutation = useCheckNicknameDuplicateMutation();
  const sendEmailCodeMutation = useSendEmailCodeMutation();
  const verifyEmailCodeMutation = useVerifyEmailCodeMutation();
  const signupMutation = useSignupMutation();

  // 남은 인증 시간을 초 단위로 계산합니다.
  const remainingSeconds = useMemo(() => {
    if (!expireAt) {
      return 0;
    }

    const seconds = Math.ceil((expireAt - now) / 1000);
    return seconds > 0 ? seconds : 0;
  }, [expireAt, now]);

  useEffect(() => {
    if (!expireAt || remainingSeconds === 0) {
      return;
    }

    // 모달 타이머 표기를 1초마다 갱신합니다.
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [expireAt, remainingSeconds]);

  // 뒤로가기 → 로그인 페이지
  const handleBack = () => {
    router.back();
  };

  const handleOpenVerifyModal = () => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      return;
    }

    // 이메일 중복 체크 후 인증 코드 발송
    checkEmailDuplicateMutation.mutate(
      { email: normalizedEmail },
      {
        onSuccess: () => {
          sendEmailCodeMutation.mutate(
            { email: normalizedEmail },
            {
              onSuccess: () => {
                // 재전송 시에는 이전 인증 결과와 만료 시간을 모두 초기화합니다.
                setIsEmailVerified(false);
                setVerifiedEmail('');
                setExpireAt(Date.now() + EMAIL_VERIFY_EXPIRE_SECONDS * 1000);
                setNow(Date.now());
                setIsVerifyModalVisible(true);
              },
            }
          );
        },
      }
    );
  };

  const handleCheckNickname = () => {
    const normalizedNickname = name.trim();

    if (!normalizedNickname) {
      return;
    }

    checkNicknameDuplicateMutation.mutate(
      { name: normalizedNickname },
      {
        onSuccess: () => {
          setIsNicknameChecked(true);
          setCheckedNickname(normalizedNickname);
        },
      }
    );
  };

  const handleVerifyComplete = (code: string) => {
    const normalizedEmail = email.trim();

    verifyEmailCodeMutation.mutate(
      { email: normalizedEmail, code },
      {
        onSuccess: () => {
          // 현재 입력한 이메일만 인증 완료 상태로 인정합니다.
          setIsEmailVerified(true);
          setVerifiedEmail(normalizedEmail);
          setIsVerifyModalVisible(false);
        },
      }
    );
  };

  const handleRegister = () => {
    const normalizedEmail = email.trim();

    if (!isEmailVerified || verifiedEmail !== normalizedEmail) {
      return;
    }

    signupMutation.mutate(
      {
        email: normalizedEmail,
        password,
        name: name.trim(),
        address: address.trim(),
      },
      {
        onSuccess: () => {
          // 이번 정책에서는 가입 직후 로그인하지 않고 로그인 화면으로 이동합니다.
          router.replace('/login');
        },
      }
    );
  };

  const isRegisterDisabled =
    !email.trim() ||
    !password.trim() ||
    !name.trim() ||
    !address.trim() ||
    !isNicknameChecked ||
    checkedNickname !== name.trim() ||
    !isEmailVerified ||
    verifiedEmail !== email.trim() ||
    signupMutation.isPending;

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
                밭찰!
              </Text>
            </View>

            {/* 타이틀 */}
            <Text className="mb-6 text-xl font-bold text-gray-900">회원가입</Text>

            {/* 닉네임 입력 */}
            <View className="mb-6">
              <Text className="mb-2 text-sm font-medium text-gray-700">닉네임</Text>
              <View className="flex-row items-center border-b border-gray-300">
                <TextInput
                  className="flex-1 text-base text-gray-900"
                  placeholder="닉네임을 입력해주세요"
                  placeholderTextColor={COLORS.textMuted}
                  value={name}
                  onChangeText={(value) => {
                    setName(value);
                    setIsNicknameChecked(false);
                    setCheckedNickname('');
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={INPUT_STYLE}
                />
                <TouchableOpacity
                  onPress={handleCheckNickname}
                  disabled={checkNicknameDuplicateMutation.isPending}
                  className="ml-2 rounded-full px-3 py-1"
                  style={{
                    backgroundColor: checkNicknameDuplicateMutation.isPending
                      ? COLORS.disabled
                      : COLORS.primary,
                  }}>
                  <Text className="text-xs font-semibold text-white">
                    {checkNicknameDuplicateMutation.isPending ? '검사 중' : '중복 검사'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {isNicknameChecked && checkedNickname === name.trim() && (
              <Text className="mb-6 text-sm text-green-600">사용 가능한 닉네임입니다.</Text>
            )}

            {checkNicknameDuplicateMutation.isError && (
              <Text className="mb-6 text-sm text-red-500">
                {checkNicknameDuplicateMutation.error instanceof Error
                  ? checkNicknameDuplicateMutation.error.message
                  : '닉네임 중복 검사에 실패했습니다.'}
              </Text>
            )}

            {/* 이메일 입력 */}
            <View className="mb-6">
              <Text className="mb-2 text-sm font-medium text-gray-700">이메일 주소</Text>
              <View className="flex-row items-center border-b border-gray-300">
                <TextInput
                  className="flex-1 text-base text-gray-900"
                  placeholder="예) 12345678@hanbat.edu.kr"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={(value) => {
                    // 이메일이 바뀌면 이전 인증 결과는 더 이상 유효하지 않습니다.
                    setEmail(value);
                    setIsEmailVerified(false);
                    setVerifiedEmail('');
                    setExpireAt(null);
                    checkEmailDuplicateMutation.reset();
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={INPUT_STYLE}
                />
                {/* 이메일 인증하기 버튼 — 입력 필드 우측 */}
                <TouchableOpacity
                  onPress={handleOpenVerifyModal}
                  disabled={
                    checkEmailDuplicateMutation.isPending || sendEmailCodeMutation.isPending
                  }
                  className="ml-2 rounded-full px-3 py-1"
                  style={{
                    backgroundColor:
                      checkEmailDuplicateMutation.isPending || sendEmailCodeMutation.isPending
                        ? COLORS.disabled
                        : COLORS.primary,
                  }}>
                  <Text className="text-xs font-semibold text-white">
                    {checkEmailDuplicateMutation.isPending
                      ? '확인 중'
                      : sendEmailCodeMutation.isPending
                        ? '전송 중'
                        : '이메일 인증'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {isEmailVerified && verifiedEmail === email.trim() && (
              // 검증한 이메일과 현재 입력값이 같을 때만 인증 완료로 표시합니다.
              <Text className="mb-6 text-sm text-green-600">이메일 인증이 완료되었습니다.</Text>
            )}

            {checkEmailDuplicateMutation.isError && (
              <Text className="mb-6 text-sm text-red-500">
                {checkEmailDuplicateMutation.error instanceof Error
                  ? checkEmailDuplicateMutation.error.message
                  : '이메일 중복 확인에 실패했습니다.'}
              </Text>
            )}

            {sendEmailCodeMutation.isError && (
              <Text className="mb-6 text-sm text-red-500">
                {sendEmailCodeMutation.error instanceof Error
                  ? sendEmailCodeMutation.error.message
                  : '인증 메일 발송에 실패했습니다.'}
              </Text>
            )}

            {verifyEmailCodeMutation.isError && (
              <Text className="mb-6 text-sm text-red-500">
                {verifyEmailCodeMutation.error instanceof Error
                  ? verifyEmailCodeMutation.error.message
                  : '이메일 인증에 실패했습니다.'}
              </Text>
            )}

            {/* 비밀번호 입력 */}
            <View className="mb-6">
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
                  className="items-center justify-center p-1">
                  <Feather
                    name={isPasswordVisible ? 'eye' : 'eye-off'}
                    size={20}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* 주소 입력 */}
            <View className="mb-10">
              <Text className="mb-2 text-sm font-medium text-gray-700">주소</Text>
              <View className="border-b border-gray-300">
                <TextInput
                  className="text-base text-gray-900"
                  placeholder="주소를 입력해주세요"
                  placeholderTextColor={COLORS.textMuted}
                  value={address}
                  onChangeText={setAddress}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={INPUT_STYLE}
                />
              </View>
            </View>

            {signupMutation.isError && (
              <Text className="mb-6 text-sm text-red-500">
                {signupMutation.error instanceof Error
                  ? signupMutation.error.message
                  : '회원가입에 실패했습니다.'}
              </Text>
            )}

            {/* 회원가입 버튼 */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={isRegisterDisabled}
              className="items-center rounded-full py-4"
              style={{ backgroundColor: isRegisterDisabled ? COLORS.disabled : COLORS.primary }}>
              <Text className="text-base font-semibold text-white">
                {signupMutation.isPending ? '회원가입 중...' : '회원가입'}
              </Text>
            </TouchableOpacity>

            {/* 약관 동의 안내 */}
            <Text
              className="mt-4 text-center text-xs leading-5"
              style={{ color: COLORS.textMuted }}>
              회원가입 시{' '}
              <Text
                style={{ color: COLORS.primary, textDecorationLine: 'underline' }}
                onPress={() => Linking.openURL(POLICY_URLS.termsOfService)}>
                이용약관
              </Text>
              {'  및 '}
              <Text
                style={{ color: COLORS.primary, textDecorationLine: 'underline' }}
                onPress={() => Linking.openURL(POLICY_URLS.privacyPolicy)}>
                개인정보처리방침
              </Text>
              에 동의하는 것으로 간주됩니다.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 이메일 인증 모달 — components/modals/EmailVerifyModal.tsx */}
      <EmailVerifyModal
        visible={isVerifyModalVisible}
        onClose={() => setIsVerifyModalVisible(false)}
        onVerifyComplete={handleVerifyComplete}
        onResend={handleOpenVerifyModal}
        remainingSeconds={remainingSeconds}
        isSubmitting={verifyEmailCodeMutation.isPending}
      />
    </SafeAreaView>
  );
}
