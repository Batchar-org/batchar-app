import '../global.css';
import '@/lib/expo-image-setup';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import { ActivityIndicator, AppState, Platform, View } from 'react-native';
import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useAuthActions, useIsInitialized, useIsLoggedIn } from '@/store/useAuthStore';
import { COLORS } from '@/constants/theme';
import { registerForPushNotifications, syncBadgeCount } from '@/lib/pushNotifications';
import { useNotificationListeners } from '@/hooks/notification/useNotificationListeners';

// React Native에서 앱이 포그라운드로 돌아올 때 refetchOnWindowFocus 동작을 위한 설정
focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener('change', (state) => {
    if (Platform.OS !== 'web') {
      handleFocus(state === 'active');
    }
  });
  return () => subscription.remove();
});

// ──────────────────────────────────────────────────────────────────
// 라우트 가드 컴포넌트
// - useRootNavigationState().key 로 네비게이터 마운트 완료 여부를 확인합니다.
// - key가 undefined인 동안에는 router.replace 호출을 차단하여
//   "Attempted to navigate before mounting" 에러를 방지합니다.
// ──────────────────────────────────────────────────────────────────

// 인증 없이 접근 가능한 퍼블릭 라우트 목록.
// login/register는 (auth) 라우트 그룹에 있으므로 segments[0]이 '(auth)'가 된다.
const PUBLIC_ROUTES = ['(auth)'];
// 앱 전역에서 같은 QueryClient를 재사용합니다.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const status = (error as any)?.status;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
    },
  },
});

function RouteGuard() {
  const router = useRouter();
  const segments = useSegments();
  const isLoggedIn = useIsLoggedIn();
  const isInitialized = useIsInitialized();
  const { initializeAuth } = useAuthActions();

  // 네비게이터 마운트 완료 여부 확인
  // key가 undefined이면 아직 Stack이 준비되지 않은 상태
  const navigationState = useRootNavigationState();

  // 푸시 알림 리스너(수신/탭/콜드스타트/배지) 등록
  useNotificationListeners();

  useEffect(() => {
    // 앱 시작 시 저장된 RT로 로그인 상태를 먼저 복구합니다.
    void initializeAuth();
  }, [initializeAuth]);

  // 로그인 상태가 되면(최초 로그인 또는 세션 복구 후) 푸시 토큰을 등록하고 배지를 동기화합니다.
  useEffect(() => {
    if (isInitialized && isLoggedIn) {
      void registerForPushNotifications();
      void syncBadgeCount();
    }
  }, [isInitialized, isLoggedIn]);

  const currentSegment = segments[0];

  useEffect(() => {
    if (!navigationState?.key) return;
    if (!isInitialized) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(currentSegment ?? '');

    if (!isLoggedIn && !isPublicRoute) {
      router.replace('/login');
    } else if (isLoggedIn && isPublicRoute) {
      // 로그인 상태에서 /login 또는 /register 접근 → 홈으로 리다이렉트
      router.replace('/');
    }
  }, [isInitialized, isLoggedIn, router, currentSegment, navigationState?.key]);

  if (!isInitialized) {
    return (
      // 세션 복원 중에는 잠깐 로딩만 보여줍니다.
      <View className="absolute inset-0 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4B8B3B" />
      </View>
    );
  }

  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <StatusBar style="dark" backgroundColor={COLORS.background} />
          {/* Stack을 먼저 렌더링하여 네비게이터를 마운트한 뒤 RouteGuard 실행 */}
          {/* 옆으로 미는 슬라이드 대신 빠른 페이드로 전환 */}
          <Stack
            screenOptions={{ headerShown: false, animation: 'fade', animationDuration: 200 }}
          />
          <RouteGuard />
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
