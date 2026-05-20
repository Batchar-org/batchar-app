import * as FileSystem from 'expo-file-system/legacy';

/**
 * React Native(Expo)에서 로컬 파일 URI(file://...)를 ArrayBuffer로 변환합니다.
 *
 * `fetch(uri).then(r => r.blob())` 패턴은 Expo에서 빈(0 byte) blob을 반환하는
 * 알려진 이슈가 있어, Supabase Storage 업로드 시 0바이트 객체가 만들어집니다.
 * Supabase 공식 가이드대로 base64 → ArrayBuffer 변환을 사용합니다.
 */
export async function uriToArrayBuffer(uri: string): Promise<ArrayBuffer> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return base64ToArrayBuffer(base64);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
