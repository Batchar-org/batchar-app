import { View, Text } from 'react-native';
import { COLORS } from '@/constants/theme';

export default function TopBar() {
  return (
    <View className="w-full bg-white px-5 py-3">
      <Text className="text-2xl font-black" style={{ color: COLORS.primary }}>
        밭찰!
      </Text>
    </View>
  );
}
