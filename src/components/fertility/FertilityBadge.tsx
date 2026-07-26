import { View, Text, Image } from 'react-native';
import { getFertilityStage } from '@/constants/fertility';

type FertilityBadgeProps = {
  percent: number;
};

// 상품 상세 등에서 판매자 옆에 붙는 작은 비옥도 뱃지.
export default function FertilityBadge({ percent }: FertilityBadgeProps) {
  const value = Math.max(0, Math.min(100, percent));
  const stage = getFertilityStage(value);

  return (
    <View className="flex-row items-center rounded-full bg-primary-light px-2 py-0.5">
      <Image source={stage.image} className="h-4 w-4" resizeMode="contain" />
      <Text className="ml-1 text-xs font-bold text-primary">{value}%</Text>
    </View>
  );
}
