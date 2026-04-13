import { apiFetch } from './client';
import type {
  DeleteUserResponse,
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
