import type { ApiResponse } from '@/types/common';

export type UserProfile = {
  user_id: number;
  email: string;
  name: string;
  address: string;
  profile_image_url: string | null;
  fertility: number;
};

export type UserProfileResponse = ApiResponse<UserProfile>;

export type UpdateUserProfileRequest = {
  name?: string;
  address?: string;
};

export type DeleteUserResponse = ApiResponse<null>;

export type DeleteProfileImageResponse = ApiResponse<null>;

export type PasswordVerifyRequest = {
  password: string;
};

export type PasswordVerifyResponse = ApiResponse<null>;

export type ChangePasswordRequest = {
  current_password: string;
  new_password: string;
};

export type ChangePasswordResponse = ApiResponse<null>;
