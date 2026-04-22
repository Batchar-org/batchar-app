import { apiFetch } from './client';
import { PresignedUrlRequest, PresignedUrlResponse } from './types';

export async function getPresignedUrlApi(
  request: PresignedUrlRequest,
  accessToken: string
): Promise<PresignedUrlResponse> {
  return apiFetch<PresignedUrlResponse>('/api/storage/presigned-url', {
    method: 'POST',
    body: JSON.stringify(request),
    accessToken,
  });
}

export async function uploadToPresignedUrl(
  presignedUrl: string,
  fileUri: string,
  contentType: string
): Promise<void> {
  const response = await fetch(fileUri);
  const blob = await response.blob();

  const uploadResponse = await fetch(presignedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    body: blob,
  });

  if (!uploadResponse.ok) {
    throw new Error(`파일 업로드에 실패했습니다. status=${uploadResponse.status}`);
  }
}
