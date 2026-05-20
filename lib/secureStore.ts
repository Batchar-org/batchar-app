import * as SecureStore from 'expo-secure-store';

// Supabase 클라이언트가 access/refresh 토큰을 자체 SecureStore adapter로 관리하므로
// 여기서는 라우팅 복원에 필요한 부가 정보(userId, userName)만 저장합니다.
const USER_ID_KEY = 'batchar_user_id';
const USER_NAME_KEY = 'batchar_user_name';

export async function setStoredUserId(userId: string) {
  await SecureStore.setItemAsync(USER_ID_KEY, userId);
}

export async function getStoredUserId() {
  return SecureStore.getItemAsync(USER_ID_KEY);
}

export async function removeStoredUserId() {
  await SecureStore.deleteItemAsync(USER_ID_KEY);
}

export async function setStoredUserName(userName: string) {
  await SecureStore.setItemAsync(USER_NAME_KEY, userName);
}

export async function getStoredUserName() {
  return SecureStore.getItemAsync(USER_NAME_KEY);
}

export async function removeStoredUserName() {
  await SecureStore.deleteItemAsync(USER_NAME_KEY);
}
