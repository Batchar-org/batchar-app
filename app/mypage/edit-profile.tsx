import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '@/constants/theme';
import TabBar from '@/components/layout/TabBar';
import { useUserProfileQuery } from '@/hooks/user/useUserProfileQuery';
import { useUpdateProfileImageMutation } from '@/hooks/user/useUpdateProfileImageMutation';
import { useDeleteProfileImageMutation } from '@/hooks/user/useDeleteProfileImageMutation';

type ProfileField = {
  label: string;
  value: string;
  editable?: boolean;
};

export default function EditProfile() {
  const router = useRouter();
  const { data: profile, isLoading } = useUserProfileQuery();
  const updateImageMutation = useUpdateProfileImageMutation();
  const deleteImageMutation = useDeleteProfileImageMutation();

  const handleProfileImagePress = () => {
    const options = profile?.profile_image_url
      ? [
          { text: '앨범에서 선택', onPress: pickImage },
          { text: '기본 이미지로 변경', onPress: handleDeleteImage },
          { text: '취소', style: 'cancel' as const },
        ]
      : [
          { text: '앨범에서 선택', onPress: pickImage },
          { text: '취소', style: 'cancel' as const },
        ];

    Alert.alert('프로필 사진', '변경 방법을 선택해주세요.', options);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    updateImageMutation.mutate(result.assets[0].uri, {
      onError: (error) => Alert.alert('오류', error.message),
    });
  };

  const handleDeleteImage = () => {
    deleteImageMutation.mutate(undefined, {
      onError: (error) => Alert.alert('오류', error.message),
    });
  };

  const isImageLoading = updateImageMutation.isPending || deleteImageMutation.isPending;

  const fields: ProfileField[] = [
    { label: '이메일', value: profile?.email ?? '' },
    { label: '닉네임', value: profile?.name ?? '', editable: true },
    { label: '주소', value: profile?.address ?? '', editable: true },
    { label: '비밀번호', value: '••••••••••', editable: true },
  ];

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

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* 프로필 이미지 */}
          <View className="items-center pb-6 pt-4">
            <TouchableOpacity
              style={{ width: 96, height: 96 }}
              onPress={handleProfileImagePress}
              disabled={isImageLoading}>
              <View
                className="h-24 w-24 items-center justify-center overflow-hidden rounded-full"
                style={{ backgroundColor: COLORS.primary }}>
                {isImageLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : profile?.profile_image_url ? (
                  <Image
                    source={{ uri: profile.profile_image_url }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                ) : (
                  <MaterialCommunityIcons
                    name="account"
                    size={48}
                    color="white"
                    style={{ marginTop: -8 }}
                  />
                )}
                <View
                  className="absolute bottom-0 left-0 right-0 items-center py-1.5"
                  style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                  <Text className="text-xs font-semibold text-white">편집</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* 프로필 정보 */}
          <View className="px-5">
            <Text className="mb-4 text-lg font-bold text-gray-900">프로필 정보</Text>

            {fields.map((field, index) => (
              <View
                key={field.label}
                className={`pb-4 pt-3 ${index !== fields.length - 1 ? 'border-b border-gray-100' : ''}`}>
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
      )}

      <TabBar />
    </SafeAreaView>
  );
}
