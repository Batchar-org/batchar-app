# 외부 서비스 결정 권고

> Phase 0 산출물 5/5
> Phase 1에서 사용자가 직접 가입/설정해야 할 외부 서비스 정리

---

## 1. 정리 표

| 영역 | 현재 (batchar-api) | Supabase 이전 후 | 사용자 액션 |
|---|---|---|---|
| DB | MySQL 8 | Supabase Postgres | Supabase 프로젝트 생성 시 자동 |
| 인증 | JJWT + Spring Security | Supabase Auth | 자동 (이메일 자동 confirmation은 Edge Function에서 처리) |
| 파일 | AWS S3 | Supabase Storage | 자동 (버킷 3개 생성 필요) |
| 캐시 | Redis | Postgres 테이블 + pg_cron | 자동 (Redis 불필요) |
| 메일 | Gmail SMTP | **Resend (권장)** 또는 Postmark/SendGrid | **별도 가입 + API 키 + 발신 도메인 설정** |
| 푸시 알림 | 없음 (현 batchar-api 미구현) | Expo Push (Expo 앱이므로) | 향후 도입 시 |
| 모니터링/로그 | (미확인) | Supabase Dashboard 로그 + Logflare | 기본 제공 |

---

## 2. 메일 서비스 선택 — **Resend 권장**

### 2.1 비교

| 서비스 | 무료 한도 | 한국어 도메인 검증 | 개발자 경험 | 비고 |
|---|---|---|---|---|
| **Resend** | 100통/일, 3,000통/월 | OK | 매우 좋음 (Edge Function과 궁합) | 신규지만 안정적 |
| Postmark | 100통/월 | OK | 매우 좋음 | 트랜잭션 메일 강점 |
| SendGrid | 100통/일 (3일 후 종료) | OK | 무난 | 한도 빨리 소진 |
| Supabase Auth 기본 메일 | 매우 제한 (시간당 4) | △ | — | **운영 불가** |
| Gmail SMTP (기존) | 일 500통, 앱 비밀번호 | OK | 번거로움 | 안티스팸 트리거 가능 |

→ **Resend**: Edge Function(Deno)에서 `resend-node` 또는 fetch로 호출. 한밭 학생 사용량 추정상 무료 티어 충분.

### 2.2 Resend 셋업 (Phase 1에서 사용자 액션)
1. https://resend.com 가입 (GitHub 로그인)
2. **도메인 추가 + DNS 인증** (SPF/DKIM/DMARC TXT 레코드)
   - 본인 소유 도메인 필요. 없으면 `onboarding@resend.dev` 발신으로 일단 개발 진행 가능 (운영 전 도메인 필수)
3. API Key 발급 → Supabase 프로젝트 환경변수 `RESEND_API_KEY`로 추가
4. From 주소: `noreply@<도메인>` 또는 `BatChar <noreply@<도메인>>`

### 2.3 코드 패턴 (Edge Function)
```ts
// supabase/functions/_shared/email.ts
export async function sendVerificationEmail(to: string, code: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'BatChar <noreply@<도메인>>',
      to,
      subject: '[BatChar] 이메일 인증 코드',
      html: buildVerificationHtml(code),
    }),
  });
  if (!res.ok) throw new Error(`EMAIL_SEND_FAILED: ${await res.text()}`);
}
```

EmailTemplateBuilder.java의 HTML은 그대로 옮겨 사용 가능.

---

## 3. 도메인 (메일 발신용)

**현재 보유 도메인 여부 확인 필요.**

- 보유 시: `noreply@<본인도메인>` 사용
- 미보유 시: 가비아/Namecheap/Cloudflare 등에서 `.com` 약 2만원/년, `.kr` 약 2.5만원/년 또는 `.dev` 약 1.5만원/년
- 옵션: Resend 자체 도메인 (`onboarding@resend.dev`) — 개발/테스트만 가능, 운영 부적합

---

## 4. Storage 버킷 결정

| 버킷 | 공개여부 | 용도 | 예상 사이즈/객체 |
|---|---|---|---|
| `product-media` | public | 상품 이미지·영상 | 최대 100MB/객체 (현 multipart 제한과 동일) |
| `profile-images` | public | 프로필 이미지 | 5MB 권장 제한 |
| `chat-media` | private | 채팅 첨부 (signed URL) | 100MB |

Supabase Storage 무료 티어: **1GB**. 운영 진입 시 Pro($25/mo) = **100GB**.

### 4.1 객체 키 규칙 유지
`{YYYY-MM-DD}/{UUID}{ext}` — batchar-api StorageService와 동일 패턴

채팅 버킷만 chat_id prefix 추가 (RLS path 검증용):
- `chat-media/{chat_id}/{YYYY-MM-DD}/{UUID}{ext}`

---

## 5. Supabase 자체 비용 추정

| 항목 | 무료 | Pro ($25/mo) |
|---|---|---|
| DB 크기 | 500MB | 8GB |
| Storage | 1GB | 100GB |
| Edge Function 호출 | 500K/월 | 2M/월 |
| Realtime 동시 연결 | 200 | 500 |
| Auth MAU | 50K | 100K |

→ 출시 초기 무료로 시작, 사용량 늘면 Pro 전환. 한밭대 학생 한정 사용자 풀이라 무료티어로 충분히 운영 가능.

---

## 6. 푸시 알림 (향후)

batchar-api에는 푸시 알림 미구현. 그러나 채팅/입찰/마감 알림을 모바일로 받으려면 필요:

- **Expo Push** (Expo 앱이므로 가장 직관적) — 무료
- Firebase Cloud Messaging 직접 통합도 가능

도입 시점은 Phase 9 이후 추가 기능으로 분리 권장. 현재 마이그레이션 범위 밖.

---

## 7. 모니터링/로그

기본 제공:
- **Supabase Dashboard**: SQL 로그, Auth 로그, Storage 로그, Edge Function 로그
- **Logflare** 통합으로 외부 분석 가능
- Sentry 등 별도 통합은 Edge Function 단위로 SDK 추가

별도 가입 불필요 (Phase 1 범위 외).

---

## 8. Phase 1 사용자 액션 체크리스트

- [ ] Supabase 가입 + 프로젝트 생성 (`batchar-supabase` 등 이름)
- [ ] Supabase 프로젝트 URL / anon key / service role key 메모
- [ ] Resend 가입 + 도메인 검증 (또는 onboarding@resend.dev로 개발 시작)
- [ ] Resend API Key 메모
- [ ] (도메인 없을 시) 도메인 구매
- [ ] Supabase MCP 설치 (settings.json에 등록) — Claude에 요청
- [ ] Supabase 프로젝트 환경변수에 `RESEND_API_KEY` 추가

---

## 9. 비용 요약 (월)

| 항목 | 무료 시작 | 운영 시 |
|---|---|---|
| Supabase | $0 | $25 (Pro) |
| Resend | $0 | $0 (3K/월 이내) ~ $20 |
| 도메인 | (1회/년 ~2만원) | ~$1.5 |
| **총** | **$0** | **~$26~46** |

batchar-api(Spring + MySQL + Redis 호스팅비)와 비교해도 비슷하거나 저렴. 운영 부담은 현격히 감소.
