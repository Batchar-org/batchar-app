import { View, Text } from 'react-native';
import { COLORS } from '@/constants/theme';
import { getFertilityStage } from '@/constants/fertility';

type FertilityBadgeProps = {
  percent: number;
};

// 상품 상세 등에서 판매자 옆에 붙는 작은 비옥도 뱃지.
export default function FertilityBadge({ percent }: FertilityBadgeProps) {
  const value = Math.max(0, Math.min(100, percent));
  const stage = getFertilityStage(value);

  return (
    <View
      className="flex-row items-center rounded-full px-2 py-0.5"
      style={{ backgroundColor: COLORS.primaryLight }}>
      <Text style={{ fontSize: 12 }}>{stage.emoji}</Text>
      <Text className="ml-1 text-xs font-bold" style={{ color: COLORS.primary }}>
        {value}%
      </Text>
    </View>
  );
}
