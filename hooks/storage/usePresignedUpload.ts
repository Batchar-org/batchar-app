import { useMutation } from '@tanstack/react-query';

import { getPresignedUrlApi, uploadToPresignedUrl } from '@/api/storage';
import { useAccessToken } from '@/store/useAuthStore';

type PresignedUploadParams = {
  fileName: string;
  contentType: string;
  fileUri: string;
};

type PresignedUploadResult = {
  objectUrl: string;
};

export function usePresignedUpload() {
  const accessToken = useAccessToken();

  return useMutation<PresignedUploadResult, Error, PresignedUploadParams>({
    mutationFn: async ({ fileName, contentType, fileUri }) => {
      if (!accessToken) {
        throw new Error('로그인이 필요합니다.');
      }

      const { data } = await getPresignedUrlApi({ fileName, contentType }, accessToken);
      await uploadToPresignedUrl(data.presignedUrl, fileUri, contentType);

      return { objectUrl: data.objectUrl };
    },
  });
}
