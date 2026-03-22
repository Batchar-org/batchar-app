import { useRef, useState } from 'react';
import { Modal, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../constants/theme';

// 인증 코드 자릿수
const CODE_LENGTH = 6;

interface EmailVerifyModalProps {
  /** 모달 표시 여부 */
  visible: boolean;
  /** 모달 닫기 콜백 */
  onClose: () => void;
  /** 로그인 완료 버튼 콜백 (API 연동 전까지 단순 콜백) */
  onVerifyComplete: () => void;
  /** [TODO] 인증 코드 재전송 콜백 */
  onResend?: () => void;
}

/**
 * EmailVerifyModal
 *
 * 이메일로 전송된 6자리 인증 코드를 입력하는 모달 컴포넌트.
 * - 각 자리를 개별 박스로 표시
 * - 숫자 입력 시 다음 칸으로 자동 포커스 이동
 * - 백스페이스 시 이전 칸으로 포커스 복귀
 * - 배경 탭 또는 취소 버튼으로 닫힘
 *
 * [TODO] API 연동 시 onVerifyComplete에 코드 검증 로직 추가
 */
export default function EmailVerifyModal({
  visible,
  onClose,
  onVerifyComplete,
  onResend,
}: EmailVerifyModalProps) {
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const inputRefs = useRef<(TextInput | null)[]>(Array(CODE_LENGTH).fill(null));

  // 모달이 닫힐 때 코드 초기화
  const handleClose = () => {
    setCode(Array(CODE_LENGTH).fill(''));
    onClose();
  };

  // 숫자 입력: 다음 칸으로 자동 포커스 이동
  const handleCodeChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // 백스페이스: 현재 칸이 비어있으면 이전 칸으로 포커스 복귀
  const handleCodeKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // 인증 번호 재전송: 코드 초기화 후 첫 번째 칸 포커스
  const handleResend = () => {
    setCode(Array(CODE_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
    onResend?.();
  };

  // 로그인 완료 버튼
  const handleVerifyComplete = () => {
    setCode(Array(CODE_LENGTH).fill(''));
    onVerifyComplete();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}>
      {/* 반투명 딤드 배경 — 탭 시 모달 닫힘 */}
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.45)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={handleClose}>
        {/* 모달 카드 — 내부 탭 이벤트 전파 차단 */}
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            width: '88%',
            maxWidth: 360,
            backgroundColor: 'white',
            borderRadius: 20,
            paddingHorizontal: 24,
            paddingVertical: 32,
          }}>
          {/* 제목 */}
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 8 }}>
            인증 코드 입력
          </Text>

          {/* 안내 문구 */}
          <Text style={{ fontSize: 13, color: '#6B7280', lineHeight: 20, marginBottom: 24 }}>
            {'로그인 보호를 위해 이메일로 전송된 6자리 인증\n코드를 입력해 주세요.'}
          </Text>

          {/* 6자리 코드 입력 박스 */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
            {Array(CODE_LENGTH)
              .fill(null)
              .map((_, index) => (
                <View
                  key={index}
                  style={{
                    flex: 1,
                    borderWidth: 2,
                    borderRadius: 12,
                    borderColor: code[index] ? COLORS.primary : '#E5E7EB',
                    backgroundColor: code[index] ? '#F0FDF4' : '#F9FAFB',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 12,
                  }}>
                  <TextInput
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    value={code[index]}
                    onChangeText={(text) => handleCodeChange(text, index)}
                    onKeyPress={({ nativeEvent }) => handleCodeKeyPress(nativeEvent.key, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      fontSize: 20,
                      fontWeight: 'bold',
                      color: '#111827',
                    }}
                  />
                </View>
              ))}
          </View>

          {/* 재전송 안내 */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 4,
              marginBottom: 24,
            }}>
            <Text style={{ fontSize: 12, color: '#9CA3AF' }}>인증 번호를 받지 못하셨나요?</Text>
            <TouchableOpacity onPress={handleResend}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.primary }}>
                인증 번호 재전송
              </Text>
            </TouchableOpacity>
          </View>

          {/* 로그인 완료 버튼 */}
          {/* [TODO] 6자리 코드 검증 API 호출 후 성공 시 onVerifyComplete 실행 */}
          <TouchableOpacity
            onPress={handleVerifyComplete}
            style={{
              backgroundColor: COLORS.primary,
              borderRadius: 999,
              paddingVertical: 16,
              alignItems: 'center',
              marginBottom: 12,
            }}>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>로그인 완료</Text>
          </TouchableOpacity>

          {/* 취소 버튼 */}
          <TouchableOpacity
            onPress={handleClose}
            style={{ alignItems: 'center', paddingVertical: 8 }}>
            <Text style={{ fontSize: 14, color: '#9CA3AF' }}>취소</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
