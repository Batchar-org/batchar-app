import * as FileSystem from 'expo-file-system';
import { ImagePickerAsset } from 'expo-image-picker';

import { ProductCreateRequest, ProductCreateResponse } from './types';

declare const process: {
  env: Record<string, string | undefined>;
};

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, '') ?? '';

export async function createProductApi(
  request: ProductCreateRequest,
  files: ImagePickerAsset[],
  accessToken: string
): Promise<ProductCreateResponse> {
  if (!BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL이 없습니다. Metro 서버를 재시작해 주세요.');
  }

  // 백엔드 Jackson 설정이 SNAKE_CASE이므로 키를 snake_case로 변환
  // endTime에서 타임존(Z) 제거 — Spring의 LocalDateTime 형식에 맞춤
  const payload = {
    title: request.title,
    description: request.description,
    category: request.category,
    start_price: request.startPrice,
    end_time: request.endTime.replace('Z', ''),
  };

  // JSON을 임시 파일로 저장 후 application/json 타입으로 FormData에 첨부
  // React Native FormData는 문자열을 text/plain으로 보내기 때문에
  // Spring @RequestPart가 역직렬화하지 못함 → 파일 객체로 전송해야 함
  const jsonUri = `${FileSystem.cacheDirectory}product_request.json`;
  await FileSystem.writeAsStringAsync(jsonUri, JSON.stringify(payload));

  const formData = new FormData();

  formData.append('request', {
    uri: jsonUri,
    name: 'request.json',
    type: 'application/json',
  } as unknown as Blob);

  // 파일 파트 첨부
  for (const file of files) {
    const uri = file.uri;
    const name = uri.split('/').pop() ?? 'image.jpg';
    const ext = name.split('.').pop()?.toLowerCase() ?? 'jpg';

    const mimeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      avi: 'video/x-msvideo',
      webm: 'video/webm',
    };

    formData.append('files', {
      uri,
      name,
      type: mimeMap[ext] ?? 'image/jpeg',
    } as unknown as Blob);
  }

  const response = await fetch(`${BASE_URL}/api/products`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = data?.message ?? `상품 등록에 실패했습니다. status=${response.status}`;
    throw new Error(message);
  }

  return data as ProductCreateResponse;
}
