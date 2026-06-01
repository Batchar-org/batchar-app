import * as SecureStore from 'expo-secure-store';

// NestJS JWT 모델: refresh 토큰은 영속 저장하고, access 토큰은 메모리(zustand)에 둔다.
// 앱 재실행 시 refresh 토큰 + userId/userName으로 세션을 복구한다.
const ACCESS_TOKEN_KEY = 'batchar_access_token';
const REFRESH_TOKEN_KEY = 'batchar_refresh_token';
const USER_ID_KEY = 'batchar_user_id';
const USER_NAME_KEY = 'batchar_user_name';

export async function setRefreshToken(refreshToken: string) {
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function removeRefreshToken() {
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

export async function setAccessToken(accessToken: string) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
}

export async function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function removeAccessToken() {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}

// userId는 NestJS에서 number(bigint)다. SecureStore는 문자열만 저장하므로 String()으로 보관한다.
export async function setStoredUserId(userId: number) {
  await SecureStore.setItemAsync(USER_ID_KEY, String(userId));
}

export async function getStoredUserId(): Promise<number | null> {
  const value = await SecureStore.getItemAsync(USER_ID_KEY);
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
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
