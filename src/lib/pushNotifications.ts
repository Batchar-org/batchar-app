import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import {
  deletePushTokenApi,
  getUnreadNotificationCountApi,
  registerPushTokenApi,
} from '@/services/notification';

const PUSH_TOKEN_KEY = 'batchar_expo_push_token';

// 앱이 포그라운드일 때도 배너/사운드/배지를 표시한다.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// 권한 요청 → Expo 푸시 토큰 발급 → 서버 등록. 실패(권한 거부/네트워크 등)는 조용히 무시한다.
export async function registerForPushNotifications(): Promise<void> {
  try {
    if (!Device.isDevice) return; // 실기기에서만 동작 (시뮬레이터 푸시 불가)

    // Android는 채널이 있어야 알림이 정상 표시된다.
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: '기본',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let status = existingStatus;
    if (existingStatus !== 'granted') {
      status = (await Notifications.requestPermissionsAsync()).status;
    }
    if (status !== 'granted') return;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) return;

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

    // 이미 등록된 동일 토큰이면 서버 재등록을 생략한다(불필요한 네트워크 방지).
    const stored = await SecureStore.getItemAsync(PUSH_TOKEN_KEY);
    if (stored === token) return;

    await SecureStore.setItemAsync(PUSH_TOKEN_KEY, token);
    await registerPushTokenApi(token);
  } catch {
    // 무시
  }
}

// 로그아웃 시 서버 토큰을 해제한다. (access 토큰이 유효할 때 = 로그아웃 직전에 호출해야 함)
export async function unregisterPushNotifications(): Promise<void> {
  try {
    const token = await SecureStore.getItemAsync(PUSH_TOKEN_KEY);
    if (token) await deletePushTokenApi(token);
  } catch {
    // 무시
  } finally {
    await SecureStore.deleteItemAsync(PUSH_TOKEN_KEY);
  }
}

// 서버의 미읽음 수로 앱 아이콘 배지를 동기화한다.
export async function syncBadgeCount(): Promise<void> {
  try {
    const response = await getUnreadNotificationCountApi();
    await Notifications.setBadgeCountAsync(response.data.count);
  } catch {
    // 무시
  }
}
