import { useState } from 'react';
import { Modal, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS, INPUT_STYLE } from '@/constants/theme';
import { useResetPasswordMutation } from '@/hooks/auth/useResetPasswordMutation';

interface PasswordResetModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function PasswordResetModal({ visible, onClose }: PasswordResetModalProps) {
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const resetPasswordMutation = useResetPasswordMutation();

  const handleClose = () => {
    setEmail('');
    setIsSuccess(false);
    resetPasswordMutation.reset();
    onClose();
  };

  const handleSubmit = () => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      return;
    }

    resetPasswordMutation.mutate(
      { email: normalizedEmail },
      {
        onSuccess: () => {
          setIsSuccess(true);
        },
      }
    );
  };

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
            maxWidth: 360,
            backgroundColor: 'white',
            borderRadius: 20,
            paddingHorizontal: 24,
            paddingVertical: 32,
          }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 8 }}>
            비밀번호 찾기
          </Text>

          {isSuccess ? (
            <>
              <Text
                style={{
                  fontSize: 14,
                  color: COLORS.textSecondary,
                  lineHeight: 20,
                  marginBottom: 24,
                }}>
                {
                  '입력하신 이메일로 임시 비밀번호가 발송되었습니다. \n로그인 후 비밀번호를 변경해 주세요.'
                }
              </Text>

              <TouchableOpacity
                onPress={handleClose}
                style={{
                  backgroundColor: COLORS.primary,
                  borderRadius: 999,
                  paddingVertical: 16,
                  alignItems: 'center',
                }}>
                <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>확인</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text
                style={{
                  fontSize: 14,
                  color: COLORS.textSecondary,
                  lineHeight: 20,
                  marginBottom: 24,
                }}>
                {'가입 시 사용한 이메일을 입력하시면\n임시 비밀번호를 발송해 드립니다.'}
              </Text>

              <View
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: COLORS.inactive,
                  marginBottom: 12,
                }}>
                <TextInput
                  placeholder="예) 12345678@hanbat.edu.kr"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    resetPasswordMutation.reset();
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                  style={{
                    ...INPUT_STYLE,
                    fontSize: 16,
                    color: '#111827',
                  }}
                />
              </View>

              {resetPasswordMutation.isError && (
                <Text style={{ fontSize: 14, color: COLORS.error, marginBottom: 12 }}>
                  {resetPasswordMutation.error instanceof Error
                    ? resetPasswordMutation.error.message
                    : '임시 비밀번호 발송에 실패했습니다.'}
                </Text>
              )}

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!email.trim() || resetPasswordMutation.isPending}
                style={{
                  backgroundColor:
                    !email.trim() || resetPasswordMutation.isPending
                      ? COLORS.disabled
                      : COLORS.primary,
                  borderRadius: 999,
                  paddingVertical: 16,
                  alignItems: 'center',
                  marginBottom: 12,
                }}>
                <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
                  {resetPasswordMutation.isPending ? '발송 중...' : '임시 비밀번호 발송'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleClose}
                style={{ alignItems: 'center', paddingVertical: 8 }}>
                <Text style={{ fontSize: 14, color: COLORS.textMuted }}>취소</Text>
              </TouchableOpacity>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
