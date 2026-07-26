import { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/theme';
import { useUpdateUserProfileMutation } from '@/hooks/user/useUpdateUserProfileMutation';

export default function ChangeAddress() {
  const router = useRouter();
  const [address, setAddress] = useState('');
  const updateProfileMutation = useUpdateUserProfileMutation();

  const canSubmit = address.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    updateProfileMutation.mutate(
      { address: address.trim() },
      {
        onSuccess: () => {
          Alert.alert('완료', '주소가 변경되었습니다.');
          router.back();
        },
        onError: (error) => {
          Alert.alert('실패', error.message);
        },
      }
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* 헤더 */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.active} />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-lg font-bold text-gray-900">주소 변경</Text>
        </View>
        <View className="w-7" />
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* 주소 입력 */}
        <View className="mt-4">
          <Text className="mb-2 text-sm font-semibold text-gray-700">새 주소</Text>
          <View className="flex-row items-center rounded-lg border border-gray-200 px-4 py-3">
            <TextInput
              className="flex-1 text-sm text-gray-900"
              placeholder="새 주소를 입력해주세요"
              placeholderTextColor={COLORS.textMuted}
              value={address}
              onChangeText={setAddress}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View className="px-5 pb-10 pt-3">
        <TouchableOpacity
          className="items-center rounded-xl bg-primary py-4"
          style={{ opacity: canSubmit ? 1 : 0.5 }}
          disabled={!canSubmit || updateProfileMutation.isPending}
          onPress={handleSubmit}>
          <Text className="text-base font-bold text-white">
            {updateProfileMutation.isPending ? '변경 중...' : '주소 변경하기'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
