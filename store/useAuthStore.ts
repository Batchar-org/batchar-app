import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { supabase } from '@/lib/supabase';
import {
  getStoredUserName,
  removeStoredUserId,
  removeStoredUserName,
  setStoredUserId,
  setStoredUserName,
} from '@/lib/secureStore';

type AuthStatus = 'idle' | 'authenticated' | 'unauthenticated';

type AuthStoreState = {
  userId: string | null;
  userName: string | null;
  accessToken: string | null;
  status: AuthStatus;
  isInitialized: boolean;
  isInitializing: boolean;
};

const initialState: AuthStoreState = {
  userId: null,
  userName: null,
  accessToken: null,
  status: 'idle' as AuthStatus,
  isInitialized: false,
  isInitializing: false,
};

const useAuthStore = create(
  devtools(
    immer(
      combine(initialState, (set, get) => ({
        actions: {
          setSession: ({
            userId,
            accessToken,
            userName,
          }: {
            userId: string;
            accessToken: string;
            userName?: string | null;
          }) =>
            set((state) => {
              state.userId = userId;
              state.accessToken = accessToken;
              state.status = 'authenticated';
              if (userName) state.userName = userName;
            }),

          clearSession: () =>
            set((state) => {
              state.userId = null;
              state.userName = null;
              state.accessToken = null;
              state.status = 'unauthenticated';
            }),

          initializeAuth: async () => {
            const { isInitialized, isInitializing } = get();
            if (isInitialized || isInitializing) return;

            set((state) => {
              state.isInitializing = true;
            });

            try {
              // Supabase 클라이언트가 SecureStore에서 세션을 자동 복원합니다.
              const {
                data: { session },
              } = await supabase.auth.getSession();
              const storedUserName = await getStoredUserName();

              if (!session) {
                set((state) => {
                  state.userId = null;
                  state.userName = null;
                  state.accessToken = null;
                  state.status = 'unauthenticated';
                  state.isInitialized = true;
                });
                return;
              }

              await setStoredUserId(session.user.id);

              set((state) => {
                state.userId = session.user.id;
                state.userName = storedUserName;
                state.accessToken = session.access_token;
                state.status = 'authenticated';
                state.isInitialized = true;
              });
            } catch {
              await removeStoredUserId();
              await removeStoredUserName();

              set((state) => {
                state.userId = null;
                state.userName = null;
                state.accessToken = null;
                state.status = 'unauthenticated';
                state.isInitialized = true;
              });
            } finally {
              set((state) => {
                state.isInitializing = false;
              });
            }
          },

          logout: async () => {
            try {
              await supabase.auth.signOut();
            } catch {
              // 서버 응답과 무관하게 앱 쪽 세션은 반드시 종료합니다.
            } finally {
              await removeStoredUserId();
              await removeStoredUserName();

              set((state) => {
                state.userId = null;
                state.userName = null;
                state.accessToken = null;
                state.status = 'unauthenticated';
              });
            }
          },
        },
      }))
    ),
    { name: 'AuthStore' }
  )
);

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || !session) {
    useAuthStore.setState((state) => ({
      ...state,
      userId: null,
      userName: null,
      accessToken: null,
      status: 'unauthenticated',
    }));
    return;
  }

  if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN' || event === 'USER_UPDATED') {
    useAuthStore.setState((state) => ({
      ...state,
      userId: session.user.id,
      accessToken: session.access_token,
      status: 'authenticated',
    }));
  }
});

export default useAuthStore;

export const useUserId = () => useAuthStore((state) => state.userId);
export const useAuthStatus = () => useAuthStore((state) => state.status);
export const useAccessToken = () => useAuthStore((state) => state.accessToken);
export const useUserName = () => useAuthStore((state) => state.userName);
export const useIsInitialized = () => useAuthStore((state) => state.isInitialized);
export const useIsLoggedIn = () => useAuthStore((state) => state.status === 'authenticated');
export const useAuthActions = () => useAuthStore((state) => state.actions);

export { setStoredUserId, setStoredUserName };
