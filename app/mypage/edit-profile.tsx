import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/theme';
import TabBar from '@/components/layout/TabBar';

// Mock 데이터
const PROFILE = {
  email: '11111111@edu.hanbat.ac.kr',
  nickname: '학생 1',
  address: '010-****-1111',
  password: '••••••••••',
};

type ProfileField = {
  label: string;
  value: string;
  editable?: boolean;
};

const FIELDS: ProfileField[] = [
  { label: '이메일', value: PROFILE.email },
  { label: '닉네임', value: PROFILE.nickname, editable: true },
  { label: '주소', value: PROFILE.address, editable: true },
  { label: '비밀번호', value: PROFILE.password, editable: true },
];

export default function EditProfile() {
  const router = useRouter();

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

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 프로필 이미지 */}
        <View className="items-center pb-6 pt-4">
          <View style={{ width: 96, height: 96 }}>
            <View
              className="h-24 w-24 items-center justify-center overflow-hidden rounded-full"
              style={{ backgroundColor: COLORS.primary }}>
              <MaterialCommunityIcons
                name="account"
                size={48}
                color="white"
                style={{ marginTop: -8 }}
              />
              <TouchableOpacity
                className="absolute bottom-0 left-0 right-0 items-center py-1.5"
                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <Text className="text-xs font-semibold text-white">편집</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 프로필 정보 */}
        <View className="px-5">
          <Text className="mb-4 text-lg font-bold text-gray-900">프로필 정보</Text>

          {FIELDS.map((field, index) => (
            <View
              key={field.label}
              className={`pb-4 pt-3 ${index !== FIELDS.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <Text className="mb-1 text-sm font-semibold text-gray-900">{field.label}</Text>
              <View className="flex-row items-center justify-between">
                <Text
                  className={`text-sm ${field.label === '이메일' ? 'rounded-lg bg-gray-100 px-3 py-2.5 text-gray-500' : 'py-1 text-gray-700'}`}
                  style={field.label === '이메일' ? { flex: 1 } : undefined}>
                  {field.value}
                </Text>
                {field.editable && (
                  <TouchableOpacity
                    className="rounded-lg border px-4 py-1.5"
                    style={{ borderColor: COLORS.primary }}
                    onPress={() => {
                      if (field.label === '닉네임') router.push('/mypage/change-nickname');
                      if (field.label === '주소') router.push('/mypage/change-address');
                      if (field.label === '비밀번호') router.push('/mypage/change-password');
                    }}>
                    <Text className="text-sm font-medium" style={{ color: COLORS.primary }}>
                      변경
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        <View className="h-8" />
      </ScrollView>

      <TabBar />
    </SafeAreaView>
  );
}
