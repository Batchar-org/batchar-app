import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthActions, useIsInitialized, useIsLoggedIn } from '../store/useAuthStore';
import { COLORS } from '../constants/theme';

// ──────────────────────────────────────────────────────────────────
// 라우트 가드 컴포넌트
// - useRootNavigationState().key 로 네비게이터 마운트 완료 여부를 확인합니다.
// - key가 undefined인 동안에는 router.replace 호출을 차단하여
//   "Attempted to navigate before mounting" 에러를 방지합니다.
// ──────────────────────────────────────────────────────────────────

// 인증 없이 접근 가능한 퍼블릭 라우트 목록
const PUBLIC_ROUTES = ['login', 'register'];
// 앱 전역에서 같은 QueryClient를 재사용합니다.
const queryClient = new QueryClient();

function RouteGuard() {
  const router = useRouter();
  const segments = useSegments();
  const isLoggedIn = useIsLoggedIn();
  const isInitialized = useIsInitialized();
  const { initializeAuth } = useAuthActions();

  // 네비게이터 마운트 완료 여부 확인
  // key가 undefined이면 아직 Stack이 준비되지 않은 상태
  const navigationState = useRootNavigationState();

  useEffect(() => {
    // 앱 시작 시 저장된 RT로 로그인 상태를 먼저 복구합니다.
    void initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    // 네비게이터 준비 전이나 세션 복원 전에는 리다이렉트를 막습니다.
    if (!navigationState?.key) return;
    if (!isInitialized) return;

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
  }, [isInitialized, isLoggedIn, router, segments, navigationState?.key]);

  if (!isInitialized) {
    return (
      // 세션 복원 중에는 잠깐 로딩만 보여줍니다.
      <View className="absolute inset-0 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return null;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        {/* Stack을 먼저 렌더링하여 네비게이터를 마운트한 뒤 RouteGuard 실행 */}
        <Stack screenOptions={{ headerShown: false }} />
        <RouteGuard />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
