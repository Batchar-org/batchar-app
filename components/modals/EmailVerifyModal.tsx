import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../constants/theme';

// 백엔드 명세 기준 6자리 코드를 입력받습니다.
const CODE_LENGTH = 6;

interface EmailVerifyModalProps {
  /** 모달 표시 여부 */
  visible: boolean;
  /** 모달 닫기 콜백 */
  onClose: () => void;
  /** 인증 완료 버튼 콜백 */
  onVerifyComplete: (code: string) => void;
  /** 인증 번호 재전송 콜백 */
  onResend?: () => void;
  /** 남은 인증 유효 시간(초) */
  remainingSeconds: number;
  /** 인증 중 여부 */
  isSubmitting?: boolean;
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
  remainingSeconds,
  isSubmitting = false,
}: EmailVerifyModalProps) {
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const inputRefs = useRef<(TextInput | null)[]>(Array(CODE_LENGTH).fill(null));

  useEffect(() => {
    if (!visible) {
      setCode(Array(CODE_LENGTH).fill(''));
    }
  }, [visible]);

  // visible 변화에 맞춰 초기화되므로 닫기 함수는 부모 상태만 변경합니다.
  const handleClose = () => {
    onClose();
  };

  // 한 자리씩 입력하고 다음 칸으로 이동합니다.
  const handleCodeChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // 빈 칸에서 백스페이스를 누르면 이전 칸으로 이동합니다.
  const handleCodeKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // 재전송 시 입력값을 초기화하고 첫 칸부터 다시 입력받습니다.
  const handleResend = () => {
    setCode(Array(CODE_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
    onResend?.();
  };

  // 만료 전 6자리가 모두 입력된 경우에만 인증을 시도합니다.
  const handleVerifyComplete = () => {
    const joinedCode = code.join('');

    if (joinedCode.length !== CODE_LENGTH || remainingSeconds <= 0) {
      return;
    }

    onVerifyComplete(joinedCode);
  };

  const formatRemainingTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
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
          backgroundColor: COLORS.overlay,
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
          <Text
            style={{ fontSize: 20, fontWeight: 'bold', color: COLORS.cardTitle, marginBottom: 8 }}>
            인증 코드 입력
          </Text>

          {/* 안내 문구 */}
          <Text
            style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 24 }}>
            {'회원가입을 위해 이메일로 전송된 6자리 인증\n코드를 입력해 주세요.'}
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
                      color: COLORS.cardTitle,
                    }}
                  />
                </View>
              ))}
          </View>

          {/* 남은 시간과 재전송 액션을 함께 표시합니다. */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
              marginBottom: 24,
            }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: remainingSeconds > 0 ? COLORS.cardTitle : '#DC2626',
              }}>
              {remainingSeconds > 0 ? formatRemainingTime(remainingSeconds) : '인증 만료'}
            </Text>
            <Text style={{ fontSize: 12, color: '#9CA3AF' }}>인증 번호를 받지 못하셨나요?</Text>
            <TouchableOpacity onPress={handleResend}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.primary }}>
                인증 번호 재전송
              </Text>
            </TouchableOpacity>
          </View>

          {/* 실제 검증 요청은 부모 화면에서 수행합니다. */}
          <TouchableOpacity
            onPress={handleVerifyComplete}
            disabled={isSubmitting || remainingSeconds <= 0}
            style={{
              backgroundColor:
                isSubmitting || remainingSeconds <= 0 ? COLORS.disabled : COLORS.primary,
              borderRadius: 999,
              paddingVertical: 16,
              alignItems: 'center',
              marginBottom: 12,
            }}>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
              {isSubmitting ? '인증 중...' : '이메일 인증 완료'}
            </Text>
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
