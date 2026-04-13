import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useRef, useEffect, useCallback } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useChatMessagesQuery } from '@/hooks/chat/useChatMessagesQuery';
import { useSendMessageMutation } from '@/hooks/chat/useSendMessageMutation';
import { useChatListQuery } from '@/hooks/chat/useChatListQuery';
import { useStompClient } from '@/hooks/chat/useStompClient';
import { COLORS, ICON_SIZES } from '@/constants/theme';
import useAuthStore from '@/store/useAuthStore';

function formatMessageTime(createdAt: string): string {
  const date = new Date(createdAt);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const period = hours >= 12 ? '오후' : '오전';
  const displayHours = hours > 12 ? hours - 12 : hours || 12;
  return `${period} ${displayHours}:${minutes}`;
}

function formatDateSeparator(createdAt: string): string {
  const date = new Date(createdAt);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function DefaultAvatar({ size = 36, color = COLORS.textMuted }: { size?: number; color?: string }) {
  return (
    <View
      className="items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: COLORS.border,
      }}>
      <MaterialCommunityIcons name="account" size={size * 0.6} color={color} />
    </View>
  );
}

export default function ChatDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [messageText, setMessageText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const chatId = Number(id) || 0;
  const userId = useAuthStore((state) => state.userId);
  const { data: chatList } = useChatListQuery();
  const { data: messages, isLoading } = useChatMessagesQuery(chatId);

  const { mutate: sendMessageHttp, isPending: isSending } = useSendMessageMutation();
  const chatInfo = chatList?.find((c) => c.chat_id === chatId);

  const onMessageReceived = useCallback(() => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const { sendMessage: stompSend } = useStompClient({
    chatId,
    onMessageReceived,
  });

  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }, [messages]);

  const handleSend = () => {
    const trimmed = messageText.trim();
    if (!trimmed || isSending) return;

    // WebSocket 전송 시도, 실패 시 HTTP API 폴백
    const sent = stompSend(trimmed);
    if (sent) {
      setMessageText('');
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 200);
    } else {
      sendMessageHttp(
        { chatId, message: trimmed },
        {
          onSuccess: () => {
            setMessageText('');
            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 200);
          },
        }
      );
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons
              name="chevron-left"
              size={ICON_SIZES.lg}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.active} />
        </View>
      </SafeAreaView>
    );
  }

  const getDateKey = (createdAt: string) => new Date(createdAt).toDateString();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      {/* 헤더 */}
      <View
        className="flex-row items-center px-4 py-3"
        style={{ borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={ICON_SIZES.lg} color={COLORS.primary} />
        </TouchableOpacity>
        <View className="ml-2">
          <Text className="text-lg font-bold" style={{ color: COLORS.text }}>
            {chatInfo?.partner_name ?? '채팅'}
          </Text>
        </View>
      </View>

      {/* 상품 정보 바 */}
      {chatInfo && (
        <TouchableOpacity
          className="flex-row items-center px-4 py-3"
          style={{ borderBottomWidth: 1, borderBottomColor: COLORS.border }}
          onPress={() => router.push(`/product/${chatInfo.product_id}`)}>
          <View className="ml-3 flex-1">
            <Text className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>
              상품 상세 보기
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
      )}

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}>
        {/* 메시지 영역 */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}>
          {!messages || messages.length === 0 ? (
            <View className="flex-1 items-center pt-20">
              <Text className="text-sm text-gray-400">
                {chatInfo?.partner_name ?? '상대방'}님과 대화를 시작해 보세요.
              </Text>
            </View>
          ) : (
            messages.map((msg, index) => {
              const isMe = msg.sender_id === userId;
              const showDate =
                index === 0 ||
                getDateKey(msg.created_at) !== getDateKey(messages[index - 1].created_at);

              // 상대방 메시지: 연속 메시지면 아바타 숨김
              const showPartnerAvatar =
                !isMe && (index === 0 || messages[index - 1].sender_id === userId || showDate);

              // 같은 발신자 + 같은 시간이면 마지막 메시지에만 시간 표시
              const nextMsg = messages[index + 1];
              const showTime =
                !nextMsg ||
                nextMsg.sender_id !== msg.sender_id ||
                formatMessageTime(nextMsg.created_at) !== formatMessageTime(msg.created_at) ||
                getDateKey(nextMsg.created_at) !== getDateKey(msg.created_at);

              return (
                <View key={msg.message_id}>
                  {/* 날짜 구분선 */}
                  {showDate && (
                    <View className="my-5 flex-row items-center">
                      <View className="flex-1 border-b" style={{ borderColor: COLORS.border }} />
                      <Text className="mx-3 text-xs" style={{ color: COLORS.textMuted }}>
                        {formatDateSeparator(msg.created_at)}
                      </Text>
                      <View className="flex-1 border-b" style={{ borderColor: COLORS.border }} />
                    </View>
                  )}

                  {/* 메시지 버블 */}
                  <View
                    className={`${showTime ? 'mb-3' : 'mb-1'} flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {/* 상대방 아바타 */}
                    {!isMe && (
                      <View className="mr-2 self-start" style={{ width: 40 }}>
                        {showPartnerAvatar ? <DefaultAvatar size={40} /> : null}
                      </View>
                    )}

                    <View className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                      {/* 말풍선 */}
                      <View
                        className="rounded-2xl px-4 py-2.5"
                        style={{
                          backgroundColor: isMe ? COLORS.primary : COLORS.backgroundSecondary,
                          borderBottomRightRadius: isMe ? 4 : 16,
                          borderBottomLeftRadius: isMe ? 16 : 4,
                        }}>
                        <Text
                          className="text-[15px] leading-6"
                          style={{ color: isMe ? '#FFFFFF' : COLORS.text }}>
                          {msg.content}
                        </Text>
                      </View>
                      {/* 읽음 표시 + 시간 */}
                      {showTime && (
                        <View
                          className={`mt-1 flex-row items-center ${isMe ? 'flex-row-reverse' : ''}`}>
                          <Text className="text-xs" style={{ color: COLORS.textMuted }}>
                            {formatMessageTime(msg.created_at)}
                          </Text>
                          {isMe && !msg.is_read && (
                            <Text
                              className="mr-1 text-xs font-semibold"
                              style={{ color: COLORS.primary }}>
                              1
                            </Text>
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              );
            })
          )}
          <View className="h-4" />
        </ScrollView>

        {/* 메시지 입력 영역 */}
        <View
          className="flex-row items-center px-3 pb-2 pt-2"
          style={{ borderTopWidth: 1, borderTopColor: COLORS.border }}>
          <View
            className="flex-1 flex-row items-center rounded-full px-4 py-2"
            style={{ backgroundColor: COLORS.backgroundSecondary }}>
            <TextInput
              className="flex-1 text-sm"
              placeholder="메시지를 입력하세요."
              placeholderTextColor={COLORS.textMuted}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              style={{ color: COLORS.text, maxHeight: 80 }}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
          </View>
          <TouchableOpacity className="ml-2 p-1" onPress={handleSend}>
            <MaterialCommunityIcons
              name="arrow-up-circle"
              size={ICON_SIZES.lg}
              color={messageText.trim() ? COLORS.primary : COLORS.textMuted}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
