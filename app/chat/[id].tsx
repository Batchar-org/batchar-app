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
import { useState, useRef, useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useChatMessagesQuery } from '../../hooks/chat/useChatMessagesQuery';
import { useSendMessageMutation } from '../../hooks/chat/useSendMessageMutation';
import { useChatListQuery } from '../../hooks/chat/useChatListQuery';
import { COLORS, ICON_SIZES } from '../../constants/theme';
import useAuthStore from '../../store/useAuthStore';

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

export default function ChatDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [messageText, setMessageText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const chatId = Number(id) || 0;
  const userId = useAuthStore((state) => state.userId);
  const { data: chatList } = useChatListQuery();
  const { data: messages, isLoading } = useChatMessagesQuery(chatId);
  const { mutate: sendMessage, isPending: isSending } = useSendMessageMutation();

  const chatInfo = chatList?.find((c) => c.chat_id === chatId);

  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }, [messages]);

  const handleSend = () => {
    const trimmed = messageText.trim();
    if (!trimmed || isSending) return;
    sendMessage(
      { chatId, message: trimmed },
      {
        onSuccess: () => {
          setMessageText('');
          setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 200);
        },
      }
    );
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

  // 날짜별 그룹핑을 위해 이전 메시지와 날짜 비교
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
                  <View className={`mb-2 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <View className={`flex-row items-end ${isMe ? 'flex-row-reverse' : ''}`}>
                      <View
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                          isMe ? 'rounded-br-sm' : 'rounded-bl-sm'
                        }`}
                        style={{
                          backgroundColor: isMe ? COLORS.primary : COLORS.backgroundSecondary,
                        }}>
                        <Text
                          className="text-sm leading-5"
                          style={{ color: isMe ? '#FFFFFF' : COLORS.text }}>
                          {msg.content}
                        </Text>
                      </View>
                      <Text
                        className={`text-xs ${isMe ? 'mr-1.5' : 'ml-1.5'}`}
                        style={{ color: COLORS.textMuted }}>
                        {formatMessageTime(msg.created_at)}
                      </Text>
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
          <TouchableOpacity className="ml-2 p-1" onPress={handleSend} disabled={isSending}>
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
