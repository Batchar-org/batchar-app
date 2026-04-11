import { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, INPUT_STYLE } from '@/constants/theme';
import { useCheckNicknameDuplicateMutation } from '@/hooks/auth/useCheckNicknameDuplicateMutation';

export default function ChangeNickname() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [checkedNickname, setCheckedNickname] = useState('');

  const checkNicknameMutation = useCheckNicknameDuplicateMutation();

  const handleCheckNickname = () => {
    const trimmed = nickname.trim();
    if (!trimmed) return;

    checkNicknameMutation.mutate(
      { name: trimmed },
      {
        onSuccess: () => {
          setIsNicknameChecked(true);
          setCheckedNickname(trimmed);
        },
      }
    );
  };

  const canSubmit = isNicknameChecked && checkedNickname === nickname.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    // TODO: 닉네임 변경 API 연동
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
          <Text className="text-lg font-bold text-gray-900">닉네임 변경</Text>
        </View>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* 닉네임 입력 */}
        <View className="mt-4">
          <Text className="mb-2 text-sm font-semibold text-gray-700">새 닉네임</Text>
          <View className="flex-row items-center rounded-lg border border-gray-200 px-4 py-3">
            <TextInput
              className="flex-1 text-sm text-gray-900"
              placeholder="새 닉네임을 입력해주세요"
              placeholderTextColor="#9CA3AF"
              value={nickname}
              onChangeText={(value) => {
                setNickname(value);
                setIsNicknameChecked(false);
                setCheckedNickname('');
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={handleCheckNickname}
              disabled={checkNicknameMutation.isPending}
              className="ml-2 rounded-full px-3 py-1.5"
              style={{
                backgroundColor: checkNicknameMutation.isPending ? '#A3A3A3' : COLORS.primary,
              }}>
              <Text className="text-xs font-semibold text-white">
                {checkNicknameMutation.isPending ? '검사 중' : '중복 검사'}
              </Text>
            </TouchableOpacity>
          </View>

          {isNicknameChecked && checkedNickname === nickname.trim() && (
            <Text className="mt-2 text-sm text-green-600">사용 가능한 닉네임입니다.</Text>
          )}

          {checkNicknameMutation.isError && (
            <Text className="mt-2 text-sm text-red-500">
              {checkNicknameMutation.error instanceof Error
                ? checkNicknameMutation.error.message
                : '닉네임 중복 검사에 실패했습니다.'}
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
          <Text className="text-base font-bold text-white">닉네임 변경하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
