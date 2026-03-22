import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { useIsLoggedIn } from '../store/useAuthStore';

// ──────────────────────────────────────────────────────────────────
// 라우트 가드 컴포넌트
// - useRootNavigationState().key 로 네비게이터 마운트 완료 여부를 확인합니다.
// - key가 undefined인 동안에는 router.replace 호출을 차단하여
//   "Attempted to navigate before mounting" 에러를 방지합니다.
// ──────────────────────────────────────────────────────────────────

// 인증 없이 접근 가능한 퍼블릭 라우트 목록
const PUBLIC_ROUTES = ['login', 'register'];

function RouteGuard() {
  const router = useRouter();
  const segments = useSegments();
  const isLoggedIn = useIsLoggedIn();

  // 네비게이터 마운트 완료 여부 확인
  // key가 undefined이면 아직 Stack이 준비되지 않은 상태
  const navigationState = useRootNavigationState();

  useEffect(() => {
    // 네비게이터가 준비되지 않으면 리다이렉트를 실행하지 않음
    if (!navigationState?.key) return;

    const currentSegment = segments[0] as string | undefined;
    const isPublicRoute = PUBLIC_ROUTES.includes(currentSegment ?? '');

    if (!isLoggedIn && !isPublicRoute) {
      // [TODO] 비로그인 상태 → 로그인 페이지로 리다이렉트
      // 토큰 구현 후: 저장된 토큰 유효성 검사 후 리다이렉트 여부 결정
      router.replace('/login');
    } else if (isLoggedIn && isPublicRoute) {
      // 로그인 상태에서 /login 또는 /register 접근 → 홈으로 리다이렉트
      router.replace('/');
    }
  }, [isLoggedIn, segments, navigationState?.key]);

  return null;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      {/* Stack을 먼저 렌더링하여 네비게이터를 마운트한 뒤 RouteGuard 실행 */}
      <Stack screenOptions={{ headerShown: false }} />
      <RouteGuard />
    </SafeAreaProvider>
  );
}
