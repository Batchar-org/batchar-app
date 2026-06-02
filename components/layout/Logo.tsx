import { Image } from 'expo-image';

// 밭찰 로고 이미지(원본 128×47)의 가로세로 비율
const LOGO_ASPECT_RATIO = 128 / 47;

// 텍스트 "밭찰!" 대신 사용하는 브랜드 로고. height만 주면 비율에 맞춰 width가 정해진다.
export default function Logo({ height = 32 }: { height?: number }) {
  return (
    <Image
      source={require('../../assets/public/batchar-icon.png')}
      style={{ height, width: height * LOGO_ASPECT_RATIO }}
      contentFit="contain"
    />
  );
}
