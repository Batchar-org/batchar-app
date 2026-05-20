import { supabase } from "@/lib/supabase";
import { ApiError } from "./errors";
import type { PresignedUrlRequest, PresignedUrlResponse } from "./types";

const DEFAULT_BUCKET = "product-media";

// Supabase Storage 표준 업로드 흐름 (CLI/SDK)으로 사용 권장.
// 기존 PresignedURL 인터페이스는 호환층으로 남겨두지만, 새 호출부에서는 supabase.storage 직접 사용.
export async function getPresignedUrlApi(
  request: PresignedUrlRequest,
  _accessToken?: string,
): Promise<PresignedUrlResponse> {
  const today = new Date().toISOString().slice(0, 10);
  const path = `${today}/${Date.now()}-${request.fileName}`;

  const { data, error } = await supabase.storage
    .from(DEFAULT_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    throw new ApiError(error?.message ?? "업로드 URL 생성에 실패했습니다.", {
      code: "FILE_UPLOAD_FAILED",
      status: 500,
    });
  }

  const { data: publicData } = supabase.storage.from(DEFAULT_BUCKET).getPublicUrl(path);

  return {
    data: { presignedUrl: data.signedUrl, objectUrl: publicData.publicUrl },
    message: "업로드 URL이 발급되었습니다.",
  };
}

export async function uploadToPresignedUrl(
  presignedUrl: string,
  fileUri: string,
  contentType: string,
): Promise<void> {
  const blob = await fetch(fileUri).then((r) => r.blob());
  const uploadResponse = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: blob,
  });
  if (!uploadResponse.ok) {
    throw new ApiError(`파일 업로드에 실패했습니다. status=${uploadResponse.status}`, {
      code: "FILE_UPLOAD_FAILED",
      status: uploadResponse.status,
    });
  }
}
