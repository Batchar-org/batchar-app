import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  Animated,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { IMAGE_TRANSITION_MS, IMAGE_PLACEHOLDER } from '@/lib/expo-image-setup';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useRef, useEffect, useCallback } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useChatMessagesQuery } from '@/hooks/chat/useChatMessagesQuery';
import { useSendMessageMutation } from '@/hooks/chat/useSendMessageMutation';
import { useChatListQuery } from '@/hooks/chat/useChatListQuery';
import { useStompClient } from '@/hooks/chat/useStompClient';
import { useLeaveChatMutation } from '@/hooks/chat/useLeaveChatMutation';
import { useCompleteDealMutation } from '@/hooks/chat/useCompleteDealMutation';
import { useSendChatMediaMutation } from '@/hooks/chat/useSendChatMediaMutation';
import { useDealStatus } from '@/hooks/chat/useDealStatus';
import { COLORS, ICON_SIZES } from '@/constants/theme';
import useAuthStore from '@/store/useAuthStore';
import { displayUserName } from '@/utils/displayUserName';
import { formatPrice } from '@/utils/format';
import ReportModal from '@/components/modals/ReportModal';
import { useBlockUserMutation } from '@/hooks/block/useBlockUserMutation';
import { useUnblockUserMutation } from '@/hooks/block/useUnblockUserMutation';
import { useFertilityReactionMutation } from '@/hooks/fertility/useFertilityReactionMutation';
import { compressImage } from '@/utils/compressImage';
import FertilityBadge from '@/components/fertility/FertilityBadge';

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
  const [showMenu, setShowMenu] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const sheetAnim = useRef(new Animated.Value(0)).current;
  const SHEET_HEIGHT = 320;

  const openMenu = () => {
    setShowMenu(true);
    Animated.timing(sheetAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowMenu(false));
  };

  const chatId = Number(id) || 0;
  const userId = useAuthStore((state) => state.userId);
  const { data: chatList } = useChatListQuery();
  const { data: messages, isLoading } = useChatMessagesQuery(chatId);

  const { mutate: sendMessageHttp, isPending: isSending } = useSendMessageMutation();
  const { mutate: leaveChat, isPending: isLeaving } = useLeaveChatMutation();
  const { mutate: completeDeal, isPending: isCompleting } = useCompleteDealMutation();
  const { mutate: sendMedia, isPending: isSendingMedia } = useSendChatMediaMutation();
  const { mutate: blockUser, isPending: isBlocking } = useBlockUserMutation();
  const { mutate: unblockUser, isPending: isUnblocking } = useUnblockUserMutation();
  const chatInfo = chatList?.find((c) => c.chat_id === chatId);
  const partnerId = chatInfo?.partner_id;
  const reportTarget =
    typeof partnerId === 'number' && partnerId > 0 && chatId > 0
      ? ({ kind: 'user', id: partnerId, chatId } as const)
      : null;
  const { dealCompleted, myConfirmed, markMyConfirmed } = useDealStatus(chatId);
  const partnerFertility = chatInfo?.partner_fertility;
  const productTitle = chatInfo?.product_title ?? '상품 정보';
  const productPrice = chatInfo?.product_price;

  // 비옥도 평가(물 주기/산성비) — 거래당 1회. 경계/중복/거래완료/차단 검증은 백엔드가 강제한다.
  const { mutate: reactFertility, isPending: isReacting } = useFertilityReactionMutation();
  const reactionBlocked = !!(chatInfo?.i_blocked || chatInfo?.blocked_by_partner);

  const handleReact = (action: 'water' | 'acid-rain') => {
    const label = action === 'water' ? '물 주기' : '산성비 내리기';
    reactFertility(
      { chatId, action },
      {
        onSuccess: () => {
          Alert.alert(
            label,
            action === 'water'
              ? '상대방의 밭에 물을 줬어요. 🌱'
              : '상대방의 밭에 산성비를 내렸어요. 🥀'
          );
        },
        onError: (error) => Alert.alert(label, error.message),
      }
    );
  };

  const onMessageReceived = useCallback(() => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const { sendMessage: stompSend } = useStompClient({
    chatId,
    onMessageReceived,
  });

  useEffect(() => {
    if (!messages?.length) return;
    const timerId = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 100);
    return () => clearTimeout(timerId);
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

  const handleLeaveChat = () => {
    if (!dealCompleted) {
      closeMenu();
      Alert.alert('알림', '양쪽 모두 거래를 완료해야 채팅방을 나갈 수 있어요.');
      return;
    }
    closeMenu();
    Alert.alert('채팅방 나가기', '정말 이 채팅방을 나가시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '나가기',
        style: 'destructive',
        onPress: () => {
          leaveChat(chatId, {
            onSuccess: () => {
              router.replace('/chat');
            },
            onError: (error) => {
              Alert.alert('오류', error.message);
            },
          });
        },
      },
    ]);
  };

  const handleReport = () => {
    if (!reportTarget) {
      closeMenu();
      Alert.alert('오류', '상대 사용자 정보를 불러올 수 없습니다.');
      return;
    }
    // 바텀시트 닫힘 애니메이션이 완전히 끝난 후 ReportModal을 띄워야
    // RN의 Modal 중첩 충돌(화면 멈춤) 방지됨
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowMenu(false);
      setReportVisible(true);
    });
  };

  const handleBlock = () => {
    closeMenu();
    if (!chatInfo || !reportTarget) {
      Alert.alert('오류', '상대 사용자 정보를 불러올 수 없습니다.');
      return;
    }
    const partnerName = displayUserName(chatInfo.partner_name);
    Alert.alert(
      '차단하기',
      `${partnerName}님을 차단하시겠습니까?\n차단하면 이 사용자의 상품이 더 이상 보이지 않고, 채팅 메시지도 보낼 수 없습니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '차단',
          style: 'destructive',
          onPress: () => {
            blockUser(reportTarget.id, {
              onError: (error) => {
                Alert.alert('오류', error.message);
              },
            });
          },
        },
      ]
    );
  };

  const handleUnblock = () => {
    closeMenu();
    if (!chatInfo || !reportTarget) {
      Alert.alert('오류', '상대 사용자 정보를 불러올 수 없습니다.');
      return;
    }
    const partnerName = displayUserName(chatInfo.partner_name);
    Alert.alert('차단 해제', `${partnerName}님의 차단을 해제하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '해제',
        onPress: () => {
          unblockUser(reportTarget.id, {
            onError: (error) => {
              Alert.alert('오류', error.message);
            },
          });
        },
      },
    ]);
  };

  const handleCompleteDeal = () => {
    closeMenu();
    Alert.alert('거래 완료', '거래를 완료하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '완료',
        onPress: () => {
          completeDeal(chatId, {
            onSuccess: () => {
              markMyConfirmed();
              Alert.alert(
                '거래 완료 확인',
                '거래 완료를 확인했습니다.\n상대방도 거래 완료를 확인해야 최종 완료됩니다.'
              );
            },
            onError: (error) => {
              Alert.alert('오류', error.message);
            },
          });
        },
      },
    ]);
  };

  const handlePickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진 라이브러리 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const compressed = await compressImage(result.assets[0]);
      sendMedia(
        { chatId, file: compressed },
        {
          onSuccess: () => {
            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 200);
          },
          onError: (error) => {
            Alert.alert('전송 실패', error.message);
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

  const isMediaMessage = (content: string) => {
    // S3 presigned/서명 URL은 끝에 ?X-Amz-...가 붙으므로 query string 허용
    return /\.(jpg|jpeg|png|gif|webp|mp4|mov|avi|webm)(\?.*)?$/i.test(content);
  };

  const isVideoUrl = (url: string) => {
    return /\.(mp4|mov|avi|webm)(\?.*)?$/i.test(url);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      {/* 헤더 */}
      <View
        className="flex-row items-center justify-between px-4 py-3"
        style={{ borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons
              name="chevron-left"
              size={ICON_SIZES.lg}
              color={COLORS.primary}
            />
          </TouchableOpacity>
          <View className="ml-2">
            <View className="flex-row items-center">
              <Text className="text-lg font-bold" style={{ color: COLORS.text }}>
                {chatInfo ? displayUserName(chatInfo.partner_name) : '채팅'}
              </Text>
              {typeof partnerFertility === 'number' && (
                <View className="ml-2">
                  <FertilityBadge percent={partnerFertility} />
                </View>
              )}
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={openMenu}>
          <MaterialCommunityIcons name="dots-vertical" size={ICON_SIZES.md} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* 하단 바텀시트 메뉴 */}
      <Modal visible={showMenu} transparent animationType="none" onRequestClose={closeMenu}>
        <View className="flex-1">
          {/* 딤 배경 (페이드) */}
          <Animated.View
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: 'rgba(0,0,0,0.4)',
              opacity: sheetAnim,
            }}
          />
          <Pressable className="flex-1" onPress={closeMenu} />
          {/* 시트 (슬라이드) */}
          <Animated.View
            style={{
              transform: [
                {
                  translateY: sheetAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [SHEET_HEIGHT, 0],
                  }),
                },
              ],
            }}>
            <View className="rounded-t-2xl bg-white pb-8 pt-2">
              {/* 핸들 바 */}
              <View className="mb-2 items-center py-2">
                <View
                  style={{
                    width: 36,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: COLORS.border,
                  }}
                />
              </View>
              <TouchableOpacity className="flex-row items-center px-5 py-4" onPress={handleReport}>
                <MaterialCommunityIcons name="flag-outline" size={22} color={COLORS.error} />
                <Text className="ml-4 text-base font-medium" style={{ color: COLORS.error }}>
                  신고하기
                </Text>
              </TouchableOpacity>
              {chatInfo?.i_blocked ? (
                <TouchableOpacity
                  className="flex-row items-center px-5 py-4"
                  disabled={isUnblocking}
                  onPress={handleUnblock}>
                  <MaterialCommunityIcons
                    name="account-check-outline"
                    size={22}
                    color={COLORS.primary}
                  />
                  <Text className="ml-4 text-base font-medium" style={{ color: COLORS.primary }}>
                    {isUnblocking ? '해제 중...' : '차단 해제하기'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  className="flex-row items-center px-5 py-4"
                  disabled={isBlocking}
                  onPress={handleBlock}>
                  <MaterialCommunityIcons name="block-helper" size={22} color={COLORS.error} />
                  <Text className="ml-4 text-base font-medium" style={{ color: COLORS.error }}>
                    {isBlocking ? '차단 중...' : '차단하기'}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                className="flex-row items-center px-5 py-4"
                disabled={isLeaving}
                onPress={handleLeaveChat}>
                <MaterialCommunityIcons
                  name="exit-to-app"
                  size={22}
                  color={dealCompleted ? COLORS.error : COLORS.textMuted}
                />
                <Text
                  className="ml-4 text-base font-medium"
                  style={{ color: dealCompleted ? COLORS.error : COLORS.textMuted }}>
                  채팅방 나가기
                </Text>
                {!dealCompleted && (
                  <Text className="ml-auto text-xs" style={{ color: COLORS.textMuted }}>
                    양쪽 완료 후 가능
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* 차단 상태 배너 */}
      {chatInfo?.i_blocked && (
        <View className="flex-row items-center px-4 py-3.5" style={{ backgroundColor: '#FEF2F2' }}>
          <MaterialCommunityIcons name="block-helper" size={20} color={COLORS.error} />
          <Text className="ml-2.5 text-sm font-medium" style={{ color: COLORS.error }}>
            차단한 사용자입니다. 메시지를 보낼 수 없습니다.
          </Text>
        </View>
      )}
      {!chatInfo?.i_blocked && chatInfo?.blocked_by_partner && (
        <View className="flex-row items-center px-4 py-3.5" style={{ backgroundColor: '#FEF2F2' }}>
          <MaterialCommunityIcons name="account-cancel" size={20} color={COLORS.error} />
          <Text className="ml-2.5 text-sm font-medium" style={{ color: COLORS.error }}>
            상대방이 회원님을 차단했습니다. 메시지를 보낼 수 없습니다.
          </Text>
        </View>
      )}

      {/* 상대방 퇴장 안내 */}
      {chatInfo?.partner_left && (
        <View
          className="flex-row items-center px-4 py-3.5"
          style={{ backgroundColor: COLORS.backgroundSecondary }}>
          <MaterialCommunityIcons
            name="account-arrow-left-outline"
            size={20}
            color={COLORS.textMuted}
          />
          <Text className="ml-2.5 text-sm font-medium" style={{ color: COLORS.textSecondary }}>
            상대방이 채팅방을 나갔어요.
          </Text>
        </View>
      )}

      {/* 거래 상품 바 (헤더 아래 고정) + 물 주기·거래 완료 */}
      {chatInfo && (
        <View style={{ borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
          <TouchableOpacity
            className="flex-row items-center px-4 pt-4"
            onPress={() => router.push(`/product/${chatInfo.product_id}`)}>
            {chatInfo.product_image_url ? (
              <Image
                source={{ uri: chatInfo.product_image_url }}
                style={{ width: 72, height: 72, borderRadius: 10 }}
                contentFit="cover"
                transition={IMAGE_TRANSITION_MS}
                placeholder={IMAGE_PLACEHOLDER}
              />
            ) : (
              <View
                className="items-center justify-center rounded-lg"
                style={{ width: 72, height: 72, backgroundColor: COLORS.backgroundSecondary }}>
                <MaterialCommunityIcons name="image-outline" size={28} color={COLORS.textMuted} />
              </View>
            )}
            <View className="ml-4 flex-1">
              <Text
                className="text-base font-bold"
                style={{ color: COLORS.text }}
                numberOfLines={1}>
                {productTitle}
              </Text>
              <View className="mt-2 flex-row items-center">
                {productPrice != null && (
                  <Text className="text-[15px] font-bold" style={{ color: COLORS.text }}>
                    {formatPrice(productPrice)}원
                  </Text>
                )}
                <View
                  className={`${productPrice != null ? 'ml-2' : ''} rounded px-2 py-1`}
                  style={{
                    backgroundColor: dealCompleted
                      ? COLORS.primaryLight
                      : COLORS.backgroundSecondary,
                  }}>
                  <Text
                    className="text-xs font-bold"
                    style={{ color: dealCompleted ? COLORS.primary : COLORS.textSecondary }}>
                    {dealCompleted ? '거래완료' : '거래중'}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* 거래 완료 흐름 → 완료 후 평가(물 주기/산성비). 차단·중복 평가는 차단 */}
          <View className="flex-row items-center px-4 pb-4 pt-3">
            {!dealCompleted ? (
              myConfirmed ? (
                <View className="flex-row items-center rounded-full px-1 py-1">
                  <MaterialCommunityIcons name="clock-outline" size={20} color={COLORS.textMuted} />
                  <Text
                    className="ml-1.5 text-sm font-bold"
                    style={{ color: COLORS.textSecondary }}>
                    상대방 확인 대기중
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  className="flex-row items-center rounded-full px-4 py-2.5"
                  style={{ backgroundColor: COLORS.primaryLight }}
                  disabled={isCompleting}
                  onPress={handleCompleteDeal}>
                  <MaterialCommunityIcons
                    name="check-circle-outline"
                    size={16}
                    color={COLORS.primary}
                  />
                  <Text className="ml-1.5 text-sm font-bold" style={{ color: COLORS.primary }}>
                    {chatInfo.is_seller ? '판매 완료' : '구매 완료'}
                  </Text>
                </TouchableOpacity>
              )
            ) : reactionBlocked ? (
              <Text className="text-xs" style={{ color: COLORS.textMuted }}>
                차단 상태에서는 평가할 수 없어요.
              </Text>
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => handleReact('water')}
                  disabled={isReacting}
                  className="mr-2 flex-row items-center rounded-full border px-4 py-2.5"
                  style={{
                    backgroundColor: COLORS.primaryLight,
                    borderColor: COLORS.primaryLight,
                    opacity: isReacting ? 0.6 : 1,
                  }}>
                  <MaterialCommunityIcons name="water-outline" size={18} color={COLORS.primary} />
                  <Text className="ml-1.5 text-sm font-bold" style={{ color: COLORS.primary }}>
                    물 주기
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleReact('acid-rain')}
                  disabled={isReacting}
                  className="flex-row items-center rounded-full border px-4 py-2.5"
                  style={{
                    backgroundColor: COLORS.backgroundSecondary,
                    borderColor: COLORS.border,
                    opacity: isReacting ? 0.6 : 1,
                  }}>
                  <MaterialCommunityIcons
                    name="weather-pouring"
                    size={18}
                    color={COLORS.textSecondary}
                  />
                  <Text
                    className="ml-1.5 text-sm font-bold"
                    style={{ color: COLORS.textSecondary }}>
                    산성비
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
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
                {chatInfo ? displayUserName(chatInfo.partner_name) : '상대방'}님과 대화를 시작해
                보세요.
              </Text>
            </View>
          ) : (
            messages.map((msg, index) => {
              const isMe = Number(msg.sender_id) === Number(userId);
              const showDate =
                index === 0 ||
                getDateKey(msg.created_at) !== getDateKey(messages[index - 1].created_at);

              // 상대방 메시지: 연속 메시지면 아바타 숨김
              const showPartnerAvatar =
                !isMe &&
                (index === 0 ||
                  Number(messages[index - 1].sender_id) === Number(userId) ||
                  showDate);

              // 같은 발신자 + 같은 시간이면 마지막 메시지에만 시간 표시
              const nextMsg = messages[index + 1];
              const showTime =
                !nextMsg ||
                nextMsg.sender_id !== msg.sender_id ||
                formatMessageTime(nextMsg.created_at) !== formatMessageTime(msg.created_at) ||
                getDateKey(nextMsg.created_at) !== getDateKey(msg.created_at);

              const hasMedia = isMediaMessage(msg.content);
              const isVideo = hasMedia && isVideoUrl(msg.content);

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
                      {hasMedia ? (
                        <View
                          className="overflow-hidden rounded-2xl"
                          style={{
                            borderBottomRightRadius: isMe ? 4 : 16,
                            borderBottomLeftRadius: isMe ? 16 : 4,
                          }}>
                          {isVideo ? (
                            <View
                              className="items-center justify-center"
                              style={{
                                width: 200,
                                height: 150,
                                backgroundColor: COLORS.backgroundSecondary,
                              }}>
                              <MaterialCommunityIcons
                                name="play-circle-outline"
                                size={48}
                                color={COLORS.textMuted}
                              />
                              <Text className="mt-1 text-xs" style={{ color: COLORS.textMuted }}>
                                동영상
                              </Text>
                            </View>
                          ) : (
                            <Image
                              source={{ uri: msg.content }}
                              style={{ width: 200, height: 200 }}
                              contentFit="cover"
                              transition={IMAGE_TRANSITION_MS}
                              placeholder={IMAGE_PLACEHOLDER}
                            />
                          )}
                        </View>
                      ) : (
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
                      )}
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
          {/* 미디어 첨부 버튼 */}
          <TouchableOpacity
            className="mr-2 p-1"
            onPress={handlePickMedia}
            disabled={isSendingMedia || !!(chatInfo?.i_blocked || chatInfo?.blocked_by_partner)}>
            <MaterialCommunityIcons
              name="plus-circle-outline"
              size={ICON_SIZES.lg}
              color={
                isSendingMedia || chatInfo?.i_blocked || chatInfo?.blocked_by_partner
                  ? COLORS.textMuted
                  : COLORS.primary
              }
            />
          </TouchableOpacity>
          <View
            className="flex-1 flex-row items-center rounded-full px-4 py-2"
            style={{ backgroundColor: COLORS.backgroundSecondary }}>
            <TextInput
              className="flex-1 text-sm"
              placeholder={
                chatInfo?.i_blocked || chatInfo?.blocked_by_partner
                  ? '채팅을 하려면 차단을 해제해 주세요.'
                  : '메시지를 입력하세요.'
              }
              placeholderTextColor={COLORS.textMuted}
              value={messageText}
              onChangeText={setMessageText}
              editable={!(chatInfo?.i_blocked || chatInfo?.blocked_by_partner)}
              multiline
              style={{
                color: COLORS.text,
                lineHeight: 20,
                maxHeight: 80,
                minHeight: 22,
                paddingVertical: 0,
                textAlignVertical: 'center',
              }}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
          </View>
          <TouchableOpacity
            className="ml-2 p-1"
            onPress={handleSend}
            disabled={
              isSending ||
              !messageText.trim() ||
              !!(chatInfo?.i_blocked || chatInfo?.blocked_by_partner)
            }>
            <MaterialCommunityIcons
              name="arrow-up-circle"
              size={ICON_SIZES.lg}
              color={
                !(chatInfo?.i_blocked || chatInfo?.blocked_by_partner) && messageText.trim()
                  ? COLORS.primary
                  : COLORS.textMuted
              }
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {reportTarget && (
        <ReportModal
          visible={reportVisible}
          onClose={() => setReportVisible(false)}
          target={reportTarget}
        />
      )}
    </SafeAreaView>
  );
}
