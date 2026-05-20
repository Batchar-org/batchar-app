const WITHDRAWN_LABEL = "탈퇴회원";

/**
 * 탈퇴 처리된 사용자의 placeholder name을 "탈퇴회원"으로 변환합니다.
 *
 * Edge Function `withdraw-user`는 `public.users.name`을 `withdrawn_<uid>` 형태로 저장하고
 * `withdrawn_at`을 기록합니다. 클라이언트 측에서 이 prefix를 감지해 사용자 친화적으로 표시합니다.
 */
export function displayUserName(name: string | null | undefined): string {
  if (!name) return WITHDRAWN_LABEL;
  if (name.startsWith("withdrawn_")) return WITHDRAWN_LABEL;
  return name;
}

export function isWithdrawnUser(name: string | null | undefined): boolean {
  return !name || name.startsWith("withdrawn_");
}
