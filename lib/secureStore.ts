import * as SecureStore from 'expo-secure-store';

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

export async function setStoredUserId(userId: number) {
  await SecureStore.setItemAsync(USER_ID_KEY, String(userId));
}

export async function getStoredUserId() {
  const userId = await SecureStore.getItemAsync(USER_ID_KEY);

  if (!userId) {
    return null;
  }

  const parsedUserId = Number(userId);
  return Number.isFinite(parsedUserId) ? parsedUserId : null;
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
