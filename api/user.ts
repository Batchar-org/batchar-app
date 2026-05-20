import { supabase } from "@/lib/supabase";
import { getMimeType } from "@/utils/mimeTypes";
import { uriToArrayBuffer } from "@/utils/uploadFile";
import { ApiError, mapSupabaseAuthError, throwFromEdgeFunction } from "./errors";
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
  UserProfile,
  UserProfileResponse,
} from "./types";

const PROFILE_BUCKET = "profile-images";

async function invokeEdgeFunction<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = {};
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }
  const { data, error } = await supabase.functions.invoke<T>(name, { body, headers });
  if (error) {
    let payload: unknown = null;
    if ((error as { context?: { json?: () => Promise<unknown> } }).context?.json) {
      try {
        payload = await (error as { context: { json: () => Promise<unknown> } }).context.json();
      } catch {
        payload = null;
      }
    }
    throwFromEdgeFunction(payload, (error as { status?: number }).status ?? 500);
  }
  if (data === null || data === undefined) {
    throw new ApiError(`Edge Function ${name} 응답이 비어 있습니다.`);
  }
  return data;
}

async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new ApiError("인증이 필요합니다.", { code: "UNAUTHORIZED", status: 401 });
  }
  return user.id;
}

async function fetchProfile(userId: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, name, address, profile_image_url")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new ApiError(error.message, { code: error.code, status: 500 });
  }
  if (!data) {
    throw new ApiError("사용자를 찾을 수 없습니다.", { code: "USER_NOT_FOUND", status: 404 });
  }
  return {
    user_id: data.id,
    email: data.email,
    name: data.name,
    address: data.address,
    profile_image_url: data.profile_image_url,
  };
}

export async function getUserProfileApi(_accessToken?: string): Promise<UserProfileResponse> {
  const uid = await getCurrentUserId();
  const profile = await fetchProfile(uid);
  return { data: profile, message: "프로필 조회 성공" };
}

export async function updateUserProfileApi(
  body: UpdateUserProfileRequest,
  _accessToken?: string
): Promise<UpdateUserProfileResponse> {
  const uid = await getCurrentUserId();
  const patch: { name?: string; address?: string } = {};
  if (body.name !== undefined) patch.name = body.name;
  if (body.address !== undefined) patch.address = body.address;

  if (Object.keys(patch).length === 0) {
    const profile = await fetchProfile(uid);
    return { data: profile, message: "변경된 항목이 없습니다." };
  }

  const { error } = await supabase.from("users").update(patch).eq("id", uid);
  if (error) {
    if (error.code === "23505") {
      throw new ApiError("이미 사용 중인 닉네임입니다.", {
        code: "DUPLICATE_NAME",
        status: 409,
      });
    }
    throw new ApiError(error.message, { code: error.code, status: 500 });
  }

  const profile = await fetchProfile(uid);
  return { data: profile, message: "프로필이 수정되었습니다." };
}

export async function deleteUserApi(
  _accessToken?: string,
  _refreshToken?: string
): Promise<DeleteUserResponse> {
  await invokeEdgeFunction<{ id: string }>("withdraw-user", {});
  return { data: null, message: "탈퇴가 완료되었습니다." };
}

// ── 프로필 이미지 ──

function extractStoragePath(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl);
    const marker = `/${PROFILE_BUCKET}/`;
    const idx = url.pathname.indexOf(marker);
    if (idx < 0) return null;
    return url.pathname.slice(idx + marker.length);
  } catch {
    return null;
  }
}

export async function updateProfileImageApi(
  imageUri: string,
  _accessToken?: string
): Promise<UpdateProfileImageResponse> {
  const uid = await getCurrentUserId();

  const filename = imageUri.split("/").pop() ?? "profile.jpg";
  const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
  const contentType = getMimeType(filename);
  const today = new Date().toISOString().slice(0, 10);
  const objectPath = `${today}/${uid}-${Date.now()}.${ext}`;

  const buffer = await uriToArrayBuffer(imageUri);

  const { error: uploadError } = await supabase.storage
    .from(PROFILE_BUCKET)
    .upload(objectPath, buffer, { contentType, upsert: false });

  if (uploadError) {
    throw new ApiError(uploadError.message, { code: "FILE_UPLOAD_FAILED", status: 500 });
  }

  const { data: publicData } = supabase.storage.from(PROFILE_BUCKET).getPublicUrl(objectPath);
  const publicUrl = publicData.publicUrl;

  const { data: prev } = await supabase
    .from("users")
    .select("profile_image_url")
    .eq("id", uid)
    .maybeSingle();

  const { error: updateError } = await supabase
    .from("users")
    .update({ profile_image_url: publicUrl })
    .eq("id", uid);

  if (updateError) {
    await supabase.storage.from(PROFILE_BUCKET).remove([objectPath]);
    throw new ApiError(updateError.message, { code: updateError.code, status: 500 });
  }

  if (prev?.profile_image_url) {
    const oldPath = extractStoragePath(prev.profile_image_url);
    if (oldPath && oldPath !== objectPath) {
      await supabase.storage.from(PROFILE_BUCKET).remove([oldPath]);
    }
  }

  const profile = await fetchProfile(uid);
  return { data: profile, message: "프로필 이미지가 변경되었습니다." };
}

export async function deleteProfileImageApi(
  _accessToken?: string
): Promise<DeleteProfileImageResponse> {
  const uid = await getCurrentUserId();
  const { data: row } = await supabase
    .from("users")
    .select("profile_image_url")
    .eq("id", uid)
    .maybeSingle();

  if (row?.profile_image_url) {
    const path = extractStoragePath(row.profile_image_url);
    if (path) {
      await supabase.storage.from(PROFILE_BUCKET).remove([path]);
    }
  }

  const { error } = await supabase
    .from("users")
    .update({ profile_image_url: null })
    .eq("id", uid);

  if (error) {
    throw new ApiError(error.message, { code: error.code, status: 500 });
  }

  return { data: null, message: "프로필 이미지가 삭제되었습니다." };
}

// ── 비밀번호 ──

export async function verifyPasswordApi(
  body: PasswordVerifyRequest,
  _accessToken?: string
): Promise<PasswordVerifyResponse> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) {
    throw new ApiError("인증이 필요합니다.", { code: "UNAUTHORIZED", status: 401 });
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: body.password,
  });
  if (error) {
    throw mapSupabaseAuthError("비밀번호가 올바르지 않습니다.", error.status);
  }
  return { data: null, message: "비밀번호 확인 완료" };
}

export async function changePasswordApi(
  body: ChangePasswordRequest,
  _accessToken?: string
): Promise<ChangePasswordResponse> {
  // 1) 현재 비밀번호 재검증
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) {
    throw new ApiError("인증이 필요합니다.", { code: "UNAUTHORIZED", status: 401 });
  }
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: body.current_password,
  });
  if (signInError) {
    throw new ApiError("비밀번호가 올바르지 않습니다.", {
      code: "INVALID_PASSWORD",
      status: 401,
    });
  }

  // 2) supabase.auth.updateUser 로 본인이 직접 변경 (세션 유지됨)
  //    admin.auth.admin.updateUserById는 모든 세션을 invalidate 하므로 사용하지 않음
  const { error } = await supabase.auth.updateUser({ password: body.new_password });
  if (error) {
    throw new ApiError(error.message, { code: error.code, status: 500 });
  }

  return { data: null, message: "비밀번호가 변경되었습니다." };
}
