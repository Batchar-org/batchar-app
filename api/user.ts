import { apiFetch } from './client';
import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
  DeleteProfileImageResponse,
  DeleteUserResponse,
  PasswordVerifyRequest,
  PasswordVerifyResponse,
  UpdateProfileImageResponse,
  UpdateUserProfileRequest,
  UpdateUserProfileResponse,
  UserProfileResponse,
} from './types';

export function getUserProfileApi(accessToken: string) {
  return apiFetch<UserProfileResponse>('/api/users/me', { accessToken });
}

export function updateUserProfileApi(body: UpdateUserProfileRequest, accessToken: string) {
  return apiFetch<UpdateUserProfileResponse>('/api/users/me', {
    method: 'PATCH',
    body: JSON.stringify(body),
    accessToken,
  });
}

export function deleteUserApi(accessToken: string, refreshToken: string) {
  return apiFetch<DeleteUserResponse>('/api/users/me', {
    method: 'DELETE',
    headers: { 'Refresh-Token': refreshToken },
    accessToken,
  });
}

// ── 프로필 이미지 ──

declare const process: {
  env: Record<string, string | undefined>;
};

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, '') ?? '';

export async function updateProfileImageApi(
  imageUri: string,
  accessToken: string
): Promise<UpdateProfileImageResponse> {
  if (!BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL이 없습니다. Metro 서버를 재시작해 주세요.');
  }

  const name = imageUri.split('/').pop() ?? 'profile.jpg';
  const ext = name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
  };

  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    name,
    type: mimeMap[ext] ?? 'image/jpeg',
  } as unknown as Blob);

  const response = await fetch(`${BASE_URL}/api/users/me/profile-image`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = data?.message ?? `프로필 이미지 변경에 실패했습니다. status=${response.status}`;
    throw new Error(message);
  }

  return data as UpdateProfileImageResponse;
}

export function deleteProfileImageApi(accessToken: string) {
  return apiFetch<DeleteProfileImageResponse>('/api/users/me/profile-image', {
    method: 'DELETE',
    accessToken,
  });
}

// ── 비밀번호 ──

export function verifyPasswordApi(body: PasswordVerifyRequest, accessToken: string) {
  return apiFetch<PasswordVerifyResponse>('/api/users/me/password/verify', {
    method: 'POST',
    body: JSON.stringify(body),
    accessToken,
  });
}

export function changePasswordApi(body: ChangePasswordRequest, accessToken: string) {
  return apiFetch<ChangePasswordResponse>('/api/users/me/password', {
    method: 'PATCH',
    body: JSON.stringify(body),
    accessToken,
  });
}
