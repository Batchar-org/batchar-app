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
      <Pressable className="flex-1 items-center justify-center bg-black/45" onPress={handleClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-[88%] max-w-[360px] rounded-[20px] bg-white px-6 py-8">
          <Text className="mb-2 text-[20px] font-bold text-gray-900">비밀번호 찾기</Text>

          {isSuccess ? (
            <>
              <Text className="mb-6 text-[14px] leading-5 text-content-secondary">
                {
                  '입력하신 이메일로 임시 비밀번호가 발송되었습니다. \n로그인 후 비밀번호를 변경해 주세요.'
                }
              </Text>

              <TouchableOpacity
                onPress={handleClose}
                className="items-center rounded-full bg-primary py-4">
                <Text className="text-[14px] font-semibold text-white">확인</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text className="mb-6 text-[14px] leading-5 text-content-secondary">
                {'가입 시 사용한 이메일을 입력하시면\n임시 비밀번호를 발송해 드립니다.'}
              </Text>

              <View className="mb-3 border-b border-inactive">
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
                <Text className="mb-3 text-[14px] text-error">
                  {resetPasswordMutation.error instanceof Error
                    ? resetPasswordMutation.error.message
                    : '임시 비밀번호 발송에 실패했습니다.'}
                </Text>
              )}

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!email.trim() || resetPasswordMutation.isPending}
                className="mb-3 items-center rounded-full py-4"
                style={{
                  backgroundColor:
                    !email.trim() || resetPasswordMutation.isPending
                      ? COLORS.disabled
                      : COLORS.primary,
                }}>
                <Text className="text-[14px] font-semibold text-white">
                  {resetPasswordMutation.isPending ? '발송 중...' : '임시 비밀번호 발송'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleClose} className="items-center py-2">
                <Text className="text-[14px] text-content-muted">취소</Text>
              </TouchableOpacity>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
