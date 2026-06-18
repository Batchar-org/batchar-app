import { apiFetch } from '@/services/client';
import type {
  ApiResponse,
  NotificationListResponse,
  NotificationSettingResponse,
  UnreadCountResponse,
} from '@/types';

export function registerPushTokenApi(token: string): Promise<ApiResponse<null>> {
  return apiFetch<ApiResponse<null>>('/api/notifications/device-tokens', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export function deletePushTokenApi(token: string): Promise<ApiResponse<null>> {
  return apiFetch<ApiResponse<null>>(
    `/api/notifications/device-tokens?token=${encodeURIComponent(token)}`,
    { method: 'DELETE' }
  );
}

export function getNotificationsApi(page = 0, size = 20): Promise<NotificationListResponse> {
  return apiFetch<NotificationListResponse>(`/api/notifications?page=${page}&size=${size}`, {
    method: 'GET',
  });
}

export function getUnreadNotificationCountApi(): Promise<UnreadCountResponse> {
  return apiFetch<UnreadCountResponse>('/api/notifications/unread-count', { method: 'GET' });
}

export function markNotificationReadApi(id: number): Promise<ApiResponse<null>> {
  return apiFetch<ApiResponse<null>>(`/api/notifications/${id}/read`, { method: 'PATCH' });
}

export function markAllNotificationsReadApi(): Promise<ApiResponse<null>> {
  return apiFetch<ApiResponse<null>>('/api/notifications/read-all', { method: 'PATCH' });
}

export function deleteNotificationApi(id: number): Promise<ApiResponse<null>> {
  return apiFetch<ApiResponse<null>>(`/api/notifications/${id}`, { method: 'DELETE' });
}

export function deleteAllNotificationsApi(): Promise<ApiResponse<null>> {
  return apiFetch<ApiResponse<null>>('/api/notifications', { method: 'DELETE' });
}

export function getNotificationSettingsApi(): Promise<NotificationSettingResponse> {
  return apiFetch<NotificationSettingResponse>('/api/notifications/settings', { method: 'GET' });
}

export function updateNotificationSettingsApi(
  pushEnabled: boolean
): Promise<NotificationSettingResponse> {
  return apiFetch<NotificationSettingResponse>('/api/notifications/settings', {
    method: 'PATCH',
    body: JSON.stringify({ push_enabled: pushEnabled }),
  });
}
