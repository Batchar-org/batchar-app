import { Alert } from 'react-native';
import { ApiError } from '@/services/errors';

type SuspensionDetails = {
  suspended_until?: string;
  remaining_seconds?: number;
};

function formatRemainingSeconds(totalSeconds: number): string {
  const seconds = Math.max(0, Math.ceil(totalSeconds));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.ceil((seconds % 3600) / 60);

  if (days > 0) return `${days}일 ${hours}시간`;
  if (hours > 0) return `${hours}시간 ${minutes}분`;
  return `${minutes}분`;
}

function getSuspensionDetails(details: unknown): SuspensionDetails | null {
  if (!details || typeof details !== 'object') return null;
  return details as SuspensionDetails;
}

function getSuspensionRemainingSeconds(error: unknown): number | null {
  if (error instanceof ApiError && error.code === 'USER_SUSPENDED') {
    const details = getSuspensionDetails(error.details);
    if (typeof details?.remaining_seconds === 'number') return details.remaining_seconds;
    if (details?.suspended_until) {
      return Math.ceil((new Date(details.suspended_until).getTime() - Date.now()) / 1000);
    }
  }
  return null;
}

export function useLoginErrorHandler() {
  const isSuspended = (error: unknown): boolean =>
    error instanceof ApiError && error.code === 'USER_SUSPENDED';

  const getErrorMessage = (error: unknown): string | null => {
    if (isSuspended(error)) return null;
    if (!(error instanceof Error)) return '로그인에 실패했습니다.';
    return error.message;
  };

  const handleError = (error: unknown): void => {
    if (!isSuspended(error)) return;

    const remainingSeconds = getSuspensionRemainingSeconds(error);
    if (remainingSeconds === null) {
      Alert.alert('정지된 계정입니다', '정지 기간 동안 로그인할 수 없습니다.');
      return;
    }

    Alert.alert(
      '정지된 계정입니다',
      `정지 기간 동안 로그인할 수 없습니다.\n남은 시간: ${formatRemainingSeconds(remainingSeconds)}`
    );
  };

  return { getErrorMessage, handleError };
}
