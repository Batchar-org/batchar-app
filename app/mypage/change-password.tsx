import { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/theme';

export default function ChangePassword() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // 새 비밀번호 유효성: 8~30자 영문+숫자
  const isNewPasswordValid =
    newPassword.length === 0 || (newPassword.length >= 8 && newPassword.length <= 30);
  const isConfirmMatch = confirmPassword.length === 0 || newPassword === confirmPassword;

  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    newPassword.length <= 30 &&
    newPassword === confirmPassword;

  const handleSubmit = () => {
    if (!canSubmit) return;
    // TODO: 비밀번호 변경 API 연동
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* 헤더 */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.active} />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-lg font-bold text-gray-900">비밀번호 변경</Text>
        </View>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* 기존 비밀번호 */}
        <View className="mb-5 mt-4">
          <Text className="mb-2 text-sm font-semibold text-gray-700">기존 비밀번호 입력</Text>
          <View className="flex-row items-center rounded-lg border border-gray-200 px-4 py-3">
            <TextInput
              className="flex-1 text-sm text-gray-900"
              placeholder="기존 비밀번호 입력"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showCurrent}
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
              <MaterialCommunityIcons
                name={showCurrent ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* 새 비밀번호 */}
        <View className="mb-5">
          <Text className="mb-2 text-sm font-semibold text-gray-700">새 비밀번호</Text>
          <View
            className="flex-row items-center rounded-lg border px-4 py-3"
            style={{
              borderColor: !isNewPasswordValid ? COLORS.error : '#E5E7EB',
            }}>
            <TextInput
              className="flex-1 text-sm text-gray-900"
              placeholder="새 비밀번호"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showNew}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity onPress={() => setShowNew(!showNew)}>
              <MaterialCommunityIcons
                name={showNew ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>
          {!isNewPasswordValid && (
            <Text className="mt-1 text-xs" style={{ color: COLORS.error }}>
              8~30자 이내 영문자 주세요
            </Text>
          )}
        </View>

        {/* 새 비밀번호 확인 */}
        <View className="mb-5">
          <Text className="mb-2 text-sm font-semibold text-gray-700">새 비밀번호 확인</Text>
          <View
            className="flex-row items-center rounded-lg border px-4 py-3"
            style={{
              borderColor: !isConfirmMatch ? COLORS.error : '#E5E7EB',
            }}>
            <TextInput
              className="flex-1 text-sm text-gray-900"
              placeholder="새 비밀번호 확인"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showConfirm}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
              <MaterialCommunityIcons
                name={showConfirm ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>
          {!isConfirmMatch && (
            <Text className="mt-1 text-xs" style={{ color: COLORS.error }}>
              비밀번호가 일치하지 않습니다
            </Text>
          )}
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View className="px-5 pb-10 pt-3">
        <TouchableOpacity
          className="items-center rounded-xl py-4"
          style={{ backgroundColor: COLORS.primary, opacity: canSubmit ? 1 : 0.5 }}
          disabled={!canSubmit}
          onPress={handleSubmit}>
          <Text className="text-base font-bold text-white">비밀번호 변경하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
