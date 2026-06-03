import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import type { DimensionValue } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '@/constants/theme';
import { getFertilityStage, FERTILITY_STAGES, FERTILITY_BASE } from '@/constants/fertility';

type FertilityCardProps = {
  percent: number;
};

// 각 단계의 표시용 % 구간(예: 30~49%)을 다음 단계 시작값에서 계산한다.
const STAGE_RANGES = FERTILITY_STAGES.map((stage, index) => {
  const max =
    index < FERTILITY_STAGES.length - 1 ? FERTILITY_STAGES[index + 1].minPercent - 1 : 100;
  return { ...stage, range: `${stage.minPercent}~${max}%` };
});

export default function FertilityCard({ percent }: FertilityCardProps) {
  const value = Math.max(0, Math.min(100, percent));
  const stage = getFertilityStage(value);
  const [showInfo, setShowInfo] = useState(false);

  return (
    <View className="mx-4 rounded-2xl bg-white p-5" style={SHADOWS.card}>
      {/* 제목 + 설명 버튼 */}
      <View className="mb-3 flex-row items-center">
        <Text className="text-base font-bold text-gray-900">밭비옥도</Text>
        <TouchableOpacity
          onPress={() => setShowInfo(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ marginLeft: 4 }}>
          <MaterialCommunityIcons name="information-outline" size={15} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* 퍼센트 + 식물 */}
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-3xl font-extrabold" style={{ color: COLORS.primary }}>
            {value}%
          </Text>
          <Text className="mt-0.5 text-sm font-semibold" style={{ color: COLORS.primary }}>
            {stage.label}
          </Text>
        </View>
        <Text style={{ fontSize: 44 }}>{stage.emoji}</Text>
      </View>

      {/* 진행 바 */}
      <View className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
        <View
          className="h-full rounded-full"
          style={{ width: `${value}%` as DimensionValue, backgroundColor: COLORS.primary }}
        />
      </View>

      {/* 캡션 */}
      <Text className="mt-3 text-sm text-gray-500">{stage.message}</Text>

      {/* 성장 단계 설명 모달 */}
      <Modal
        visible={showInfo}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInfo(false)}>
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onPress={() => setShowInfo(false)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="rounded-t-2xl bg-white px-5 pb-8 pt-5">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-lg font-bold text-gray-900">밭비옥도란?</Text>
                <TouchableOpacity onPress={() => setShowInfo(false)}>
                  <MaterialCommunityIcons name="close" size={22} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text className="mb-4 text-sm leading-5 text-gray-500">
                {`거래 상대에게 받은 평가로 키우는 내 밭의 비옥도예요.\n기본 ${FERTILITY_BASE}%에서 시작하고, 거래를 완료하면 상대가 거래당 한 번 물 주기(+0.5%)나 산성비(-0.5%)로 평가해요.`}
              </Text>

              <View className="rounded-xl bg-gray-50 p-4">
                {STAGE_RANGES.map((s) => (
                  <View key={s.label} className="flex-row items-center py-1.5">
                    <Text style={{ fontSize: 20 }}>{s.emoji}</Text>
                    <Text className="ml-3 flex-1 text-sm font-semibold text-gray-800">
                      {s.label}
                    </Text>
                    <Text className="text-sm font-medium text-gray-500">{s.range}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
