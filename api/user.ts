import { apiFetch } from './client';
import { getMimeType } from '@/utils/mimeTypes';
import { getRefreshToken } from '@/lib/secureStore';
import type {
  ApiResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  DeleteProfileImageResponse,
  DeleteUserResponse,
  PasswordVerifyRequest,
  PasswordVerifyResponse,
  UpdateUserProfileRequest,
  UserProfile,
  UserProfileResponse,
} from './types';

// NestJS UserMeResponse(snake_case)를 앱 UserProfile로 매핑. 백엔드는 `id`, 앱은 `user_id`를 쓴다.
type UserMeRaw = {
  id: number;
  email: string;
  name: string;
  address: string;
  profile_image_url: string | null;
};

function toUserProfile(raw: UserMeRaw): UserProfile {
  return {
    user_id: raw.id,
    email: raw.email,
    name: raw.name,
    address: raw.address,
    profile_image_url: raw.profile_image_url,
  };
}

export async function getUserProfileApi(_accessToken?: string): Promise<UserProfileResponse> {
  const res = await apiFetch<ApiResponse<UserMeRaw>>('/api/users/me', { method: 'GET' });
  return { data: toUserProfile(res.data), message: res.message };
}

export async function updateUserProfileApi(
  body: UpdateUserProfileRequest,
  _accessToken?: string
): Promise<void> {
  // 수정 결과(프로필)는 호출부에서 사용하지 않고 ['userProfile'] invalidate로 갱신한다.
  await apiFetch<ApiResponse<unknown>>('/api/users/me', {
    method: 'PATCH',
    body: JSON.stringify({ name: body.name, address: body.address }),
  });
}

export async function deleteUserApi(
  _accessToken?: string,
  _refreshToken?: string
): Promise<DeleteUserResponse> {
  // NestJS DELETE /api/users/me는 Bearer(자동) + Refresh-Token 헤더를 요구한다.
  const refreshToken = await getRefreshToken();
  return apiFetch<DeleteUserResponse>('/api/users/me', {
    method: 'DELETE',
    headers: refreshToken ? { 'Refresh-Token': refreshToken } : undefined,
  });
}

export async function updateProfileImageApi(
  imageUri: string,
  _accessToken?: string
): Promise<void> {
  const filename = imageUri.split('/').pop() ?? 'profile.jpg';
  const form = new FormData();
  // RN FormData 파일 형식: { uri, name, type }
  form.append('image', { uri: imageUri, name: filename, type: getMimeType(filename) } as any);

  // 변경 결과(프로필)는 호출부에서 사용하지 않고 ['userProfile'] invalidate로 갱신한다.
  await apiFetch<ApiResponse<unknown>>('/api/users/me/profile-image', {
    method: 'PATCH',
    body: form,
  });
}

export function deleteProfileImageApi(_accessToken?: string): Promise<DeleteProfileImageResponse> {
  return apiFetch<DeleteProfileImageResponse>('/api/users/me/profile-image', {
    method: 'DELETE',
  });
}

export function verifyPasswordApi(
  body: PasswordVerifyRequest,
  _accessToken?: string
): Promise<PasswordVerifyResponse> {
  return apiFetch<PasswordVerifyResponse>('/api/users/me/password/verify', {
    method: 'POST',
    body: JSON.stringify({ password: body.password }),
  });
}

export function changePasswordApi(
  body: ChangePasswordRequest,
  _accessToken?: string
): Promise<ChangePasswordResponse> {
  // 요청 body는 camelCase로 보낸다 (NestJS DTO: currentPassword / newPassword).
  return apiFetch<ChangePasswordResponse>('/api/users/me/password', {
    method: 'PATCH',
    body: JSON.stringify({
      currentPassword: body.current_password,
      newPassword: body.new_password,
    }),
  });
}
