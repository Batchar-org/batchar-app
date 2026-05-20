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
import type { ReportReasonCode } from '@/api/types';

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
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.45)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={handleClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            width: '88%',
            maxWidth: 400,
            maxHeight: '85%',
            backgroundColor: 'white',
            borderRadius: 20,
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 24,
          }}>
          {/* 헤더 */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}>신고하기</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={8}>
              <MaterialCommunityIcons name="close" size={22} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {isSuccess ? (
            <>
              <Text
                style={{
                  fontSize: 14,
                  color: COLORS.textSecondary,
                  lineHeight: 22,
                  marginBottom: 24,
                }}>
                신고가 접수되었습니다.{'\n'}24시간 이내에 검토합니다.
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                style={{
                  backgroundColor: COLORS.primary,
                  borderRadius: 999,
                  paddingVertical: 14,
                  alignItems: 'center',
                }}>
                <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>확인</Text>
              </TouchableOpacity>
            </>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text
                style={{
                  fontSize: 14,
                  color: COLORS.textSecondary,
                  marginBottom: 16,
                }}>
                신고 사유를 선택해주세요.
              </Text>

              {/* 사유 라디오 */}
              <View style={{ marginBottom: 20 }}>
                {REPORT_REASONS.map((r) => {
                  const checked = selectedReason === r.code;
                  return (
                    <TouchableOpacity
                      key={r.code}
                      onPress={() => setSelectedReason(r.code)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 10,
                      }}>
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          borderWidth: 2,
                          borderColor: checked ? COLORS.primary : COLORS.inactive,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 12,
                        }}>
                        {checked && (
                          <View
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: 5,
                              backgroundColor: COLORS.primary,
                            }}
                          />
                        )}
                      </View>
                      <Text style={{ fontSize: 15, color: '#111827' }}>{r.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* 상세 설명 */}
              <Text style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 8 }}>
                상세 설명 (선택)
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                multiline
                maxLength={REPORT_DESCRIPTION_MAX_LENGTH}
                placeholder="구체적인 내용을 적어주시면 검토에 도움이 됩니다."
                placeholderTextColor={COLORS.textMuted}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.inactive,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: '#111827',
                  minHeight: 100,
                  textAlignVertical: 'top',
                }}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: COLORS.textMuted,
                  textAlign: 'right',
                  marginTop: 4,
                  marginBottom: 16,
                }}>
                {description.length} / {REPORT_DESCRIPTION_MAX_LENGTH}
              </Text>

              {/* 에러 메시지 */}
              {reportMutation.isError && (
                <Text style={{ fontSize: 14, color: COLORS.error, marginBottom: 12 }}>
                  {reportMutation.error instanceof Error
                    ? reportMutation.error.message
                    : '신고 접수에 실패했습니다.'}
                </Text>
              )}

              {/* 제출 */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={submitDisabled}
                style={{
                  backgroundColor: submitDisabled ? COLORS.disabled : COLORS.primary,
                  borderRadius: 999,
                  paddingVertical: 14,
                  alignItems: 'center',
                }}>
                <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
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
