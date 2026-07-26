import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS } from '@/constants/theme';
import { REPORT_DESCRIPTION_MAX_LENGTH, REPORT_REASONS } from '@/constants/report';
import { useReportMutation, type ReportTarget } from '@/hooks/report/useReportMutation';
import type { ReportReasonCode } from '@/types';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  target: ReportTarget;
}

export default function ReportModal({ visible, onClose, target }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReasonCode | null>(null);
  const [description, setDescription] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const reportMutation = useReportMutation();

  const handleClose = () => {
    setSelectedReason(null);
    setDescription('');
    setIsSuccess(false);
    reportMutation.reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!selectedReason || reportMutation.isPending) return;
    reportMutation.mutate(
      {
        target,
        reason: selectedReason,
        description: description.trim() || undefined,
      },
      {
        onSuccess: () => setIsSuccess(true),
      }
    );
  };

  const submitDisabled = !selectedReason || reportMutation.isPending;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/45" onPress={handleClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="max-h-[85%] w-[88%] max-w-[400px] rounded-[20px] bg-white p-6">
          {/* 헤더 */}
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-[18px] font-bold text-gray-900">신고하기</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={8}>
              <MaterialCommunityIcons name="close" size={22} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {isSuccess ? (
            <>
              <Text className="mb-6 text-[14px] leading-[22px] text-content-secondary">
                신고가 접수되었습니다.{'\n'}24시간 이내에 검토합니다.
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                className="items-center rounded-full bg-primary py-3.5">
                <Text className="text-[14px] font-semibold text-white">확인</Text>
              </TouchableOpacity>
            </>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="mb-4 text-[14px] text-content-secondary">
                신고 사유를 선택해주세요.
              </Text>

              {/* 사유 라디오 */}
              <View className="mb-5">
                {REPORT_REASONS.map((r) => {
                  const checked = selectedReason === r.code;
                  return (
                    <TouchableOpacity
                      key={r.code}
                      onPress={() => setSelectedReason(r.code)}
                      className="flex-row items-center py-2.5">
                      <View
                        className="mr-3 h-5 w-5 items-center justify-center rounded-full border-2"
                        style={{ borderColor: checked ? COLORS.primary : COLORS.inactive }}>
                        {checked && <View className="h-2.5 w-2.5 rounded-full bg-primary" />}
                      </View>
                      <Text className="text-[15px] text-gray-900">{r.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* 상세 설명 */}
              <Text className="mb-2 text-[14px] text-content-secondary">상세 설명 (선택)</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                multiline
                maxLength={REPORT_DESCRIPTION_MAX_LENGTH}
                placeholder="구체적인 내용을 적어주시면 검토에 도움이 됩니다."
                placeholderTextColor={COLORS.textMuted}
                className="min-h-[100px] rounded-lg border border-inactive px-3 py-2.5 text-[14px] text-gray-900"
                style={{ textAlignVertical: 'top' }}
              />
              <Text className="mb-4 mt-1 text-right text-[12px] text-content-muted">
                {description.length} / {REPORT_DESCRIPTION_MAX_LENGTH}
              </Text>

              {/* 에러 메시지 */}
              {reportMutation.isError && (
                <Text className="mb-3 text-[14px] text-error">
                  {reportMutation.error instanceof Error
                    ? reportMutation.error.message
                    : '신고 접수에 실패했습니다.'}
                </Text>
              )}

              {/* 제출 */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={submitDisabled}
                className="items-center rounded-full py-3.5"
                style={{ backgroundColor: submitDisabled ? COLORS.disabled : COLORS.primary }}>
                <Text className="text-[14px] font-semibold text-white">
                  {reportMutation.isPending ? '제출 중...' : '신고 제출'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
