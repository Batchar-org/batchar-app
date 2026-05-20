# API 매핑 — 컨트롤러 → Supabase 구성

> Phase 0 산출물 4/5
> 9개 컨트롤러 35+ 엔드포인트를 PostgREST / Edge Function / Storage / Realtime / RPC 중 어느 방식으로 처리할지 결정

---

## 0. 결정 원칙

| 방식 | 적합 케이스 |
|---|---|
| **PostgREST 직접** (supabase-js `from().select/insert/update/delete`) | 단순 CRUD, RLS로 권한 표현 가능, 검증 없음 |
| **RPC** (plpgsql 함수) | 동시성/원자성 필요, 다단계 검증, 단일 트랜잭션 |
| **Edge Function** (Deno/TS) | 외부 호출(메일·Auth admin·Storage 조작 등), 복합 로직 |
| **Storage SDK** | 파일 업로드/다운로드/Presigned |
| **Realtime** | 실시간 구독 (channel.on postgres_changes) |

---

## 1. Auth (`/api/auth/**`) — 모두 Edge Function

batchar-api의 인증 흐름은 Supabase Auth 표준과 다름 (한밭 도메인 검증, 자체 6자리 코드). → **Edge Function으로 래핑**.

| 기존 엔드포인트 | Supabase 구성 | 비고 |
|---|---|---|
| POST `/api/auth/email/send` | Edge Function `send-verify-code` | 도메인 검증 + 코드 생성 + `email_verifications` UPSERT + Resend 호출 |
| POST `/api/auth/email/verify` | Edge Function `verify-code` | 코드 매칭 + verified=true + 만료 갱신 |
| POST `/api/auth/signup` | Edge Function `signup` | verified 확인 + `auth.admin.createUser` (이메일 confirmation 우회) + `public.users` row 생성 + 토큰 발급 |
| POST `/api/auth/login` | supabase-js `auth.signInWithPassword` (앱 직접) | 표준 |
| POST `/api/auth/logout` | supabase-js `auth.signOut` (앱 직접) | 표준 (Refresh Token 자동 관리) |
| POST `/api/auth/refresh` | supabase-js `auth.refreshSession` (앱 직접) | 표준 |
| POST `/api/auth/password/reset` | Edge Function `reset-password` | 임시 비밀번호 생성 + `auth.admin.updateUserById` + Resend 메일 |

**Edge Function 권장 디렉토리 (Supabase 표준)**
```
supabase/functions/
  send-verify-code/index.ts
  verify-code/index.ts
  signup/index.ts
  reset-password/index.ts
  ...
```

각 함수는 SERVICE_ROLE 키로 admin 작업 수행. CORS는 함수 응답 헤더로.

---

## 2. User (`/api/users/**`)

| 기존 엔드포인트 | Supabase 구성 |
|---|---|
| GET `/email/duplicate?email=` | RPC `check_email_available(email)` (단순 SELECT EXISTS 또는 Edge Function) |
| GET `/name/duplicate?name=` | PostgREST: `users.select('id').eq('name', X).maybeSingle()` 또는 RPC |
| GET `/me` | PostgREST: `users.select('*').eq('id', auth.uid()).single()` |
| PATCH `/me` | PostgREST: `users.update({...}).eq('id', auth.uid())` (RLS로 보호) |
| PATCH `/me/profile-image` | Storage upload(`profile-images`) + PostgREST update(`profile_image_url`) + 이전 이미지 Storage 삭제 |
| DELETE `/me/profile-image` | Storage 삭제 + PostgREST update(NULL) |
| DELETE `/me` (회원 탈퇴) | RPC/Edge Function `withdraw_user()` — 진행 중 경매/입찰 검증, 위시 삭제, 프로필 이미지 삭제, `withdraw()` placeholder 적용, `auth.admin.deleteUser` |
| POST `/me/password/verify` | Edge Function `verify-password` (Supabase Auth는 직접 비밀번호 검증 미제공 → re-sign-in 트릭) **또는** 단순히 로그인 재시도로 클라에서 처리 |
| PATCH `/me/password` | Edge Function `change-password` (현재 비밀번호 검증 + `auth.admin.updateUserById`) |

> **비밀번호 검증 우회 옵션**: 클라가 현재 비밀번호로 `signInWithPassword` 호출(추가 세션 무시) → 성공 시 검증 완료. 보안상 차이 없음. 함수 작성 부담 줄임.

---

## 3. Product (`/api/products/**`)

| 기존 엔드포인트 | Supabase 구성 |
|---|---|
| POST `/api/products` | Edge Function `create-product` — multipart 처리 (Storage 업로드 + products INSERT + product_media INSERT) |
| GET `/api/products` (view 모드별) | **RPC** `list_products(view, category, keyword, page, size, user_id)` — 5가지 view 분기 + 위시/입찰 카운트 |
| GET `/api/products/{id}` | RPC `get_product_detail(p_id)` — products + first media + wish/bid count + isTopBidder + isWished |
| PATCH `/api/products/{id}` | Edge Function `update-product` — multipart, 삭제할 미디어 ID, 신규 업로드 처리 |
| DELETE `/api/products/{id}` | RPC `delete_product(p_id)` — 미디어 Storage 삭제(Edge Function 경유 필요) + DB DELETE (FK ON DELETE CASCADE로 자동) |
| POST `/api/products/{id}/close` | RPC `close_auction_manual(p_id)` — seller 검증 + `close_auction` 호출 |

**핵심 RPC: `list_products`**
JPA 5가지 view (`ALL`/`LATEST`/`POPULAR`/`ENDING_SOON`/`MY_PRODUCTS`/`MY_BIDS`)를 plpgsql 함수로:
```sql
CREATE OR REPLACE FUNCTION public.list_products(
  p_view TEXT, p_category TEXT, p_keyword TEXT,
  p_page INT, p_size INT, p_user_id UUID
) RETURNS TABLE(...) AS $$ ... $$;
```

view에 따라 동적 ORDER BY. Slice 페이지네이션 = `LIMIT (size+1) OFFSET (page*size)` 후 has_next 계산.

**미디어 업로드 흐름 (Edge Function)**
1. 앱이 Edge Function `create-product` 호출 (multipart formdata or JSON+이미 업로드된 URL 리스트)
2. **권장 방식**: 앱이 먼저 Storage 직접 업로드 (supabase-js `storage.upload`) → URL/path 수집 → JSON으로 함수 호출
3. 함수: products INSERT, product_media INSERT (URL은 storage publicUrl)

이렇게 하면 multipart 처리가 불필요해져 Edge Function이 단순해짐.

---

## 4. Bid (`/api/products/{id}/bids`)

| 기존 엔드포인트 | Supabase 구성 |
|---|---|
| POST `/api/products/{id}/bids` | **RPC `place_bid(p_product_id, p_price)`** — schema-mapping.md §4.1 |
| GET `/api/products/{id}/bids` | PostgREST: `bids.select('*, bidder:users(name, profile_image_url)').eq('product_id', X).order('price', desc).range(...)` |

**실시간 입찰 구독 (기존 STOMP `/topic/products/{id}`)**
```ts
supabase.channel(`product:${productId}`)
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bids', filter: `product_id=eq.${productId}` }, payload => {...})
  .subscribe();
```
또는 products UPDATE(현재가 변경) 구독.

---

## 5. Wish (`/api/wishes/**`)

| 기존 엔드포인트 | Supabase 구성 |
|---|---|
| POST `/api/wishes/{productId}` | PostgREST: `wishes.insert({ user_id: auth.uid(), product_id })` — UNIQUE 위반 시 409 |
| DELETE `/api/wishes/{productId}` | PostgREST: `wishes.delete().eq('product_id', X).eq('user_id', auth.uid())` |
| GET `/api/wishes` | PostgREST: `wishes.select('*, product:products(*, first_media:product_media!product_id(media_url order by id limit 1))').eq('user_id', auth.uid()).order('created_at', desc).range(...)` |

> `wishes` 조회 JOIN의 첫 미디어 제한이 PostgREST 표현 한계. → **view 또는 RPC `list_my_wishes(page, size)` 사용 권장**.

---

## 6. Chat (`/api/chats/**`)

| 기존 엔드포인트 | Supabase 구성 |
|---|---|
| GET `/api/chats` | **RPC** `list_my_chats()` — 채팅방 + 파트너 정보 + 마지막 메시지 + 안 읽음 수 + 상품 첫 이미지 (복합 JOIN) |
| POST `/api/chats/{chatId}/messages` | PostgREST: `chat_messages.insert({ chat_id, sender_id: auth.uid(), message })` (RLS로 권한 보장) |
| GET `/api/chats/{chatId}/messages` | PostgREST select + 안 읽음 일괄 update (UPDATE는 RPC `enter_chat_room(p_chat_id)` 권장 — select+update 원자 처리) |
| DELETE `/api/chats/{chatId}` | **RPC `delete_chat_room(p_chat_id)`** — schema-mapping.md §4.5 |
| POST `/api/chats/{chatId}/media` | Storage upload(`chat-media`) + PostgREST insert(메시지에 URL) |
| POST `/api/chats/{chatId}/complete` | **RPC `confirm_trade(p_chat_id)`** — schema-mapping.md §4.4 |

**실시간 채팅 구독 (기존 STOMP `/topic/chat/{id}`)**
```ts
supabase.channel(`chat:${chatId}`)
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `chat_id=eq.${chatId}` }, ...)
  .subscribe();
```

**WebSocket Controller (`ChatWebSocketController`) 제거**: REST POST + Realtime 구독 조합으로 충분. 별도 WebSocket 엔드포인트 없음.

---

## 7. Storage (`/api/storage/**`)

| 기존 엔드포인트 | Supabase 구성 |
|---|---|
| POST `/api/storage/presigned-url` | supabase-js `storage.from(bucket).createSignedUploadUrl(path)` (앱 직접) |

→ **엔드포인트 자체 제거 가능**. 클라가 직접 SDK 호출.

---

## 8. Product SSE (`/api/products/{id}/subscribe`) — **제거**

`SseBidEventListener` 주석처리됨, V1 잔재. Realtime이 대체.

---

## 9. WebSocket (`/ws`) — **제거**

STOMP 전체 Realtime 채널로 대체.

---

## 10. 신규/변경 요약

### 10.1 Edge Functions 목록 (총 7개)
```
supabase/functions/
  send-verify-code/    # 한밭 도메인 검증 + 코드 발송
  verify-code/         # 인증 코드 검증
  signup/              # 가입 (auth admin + public.users 생성)
  reset-password/      # 임시 비밀번호 + 메일
  change-password/     # 현재 비밀번호 검증 + 변경
  withdraw-user/       # 탈퇴 (검증 + 데이터 정리 + auth admin)
  create-product/      # 상품 등록 (선택적 — 클라이언트 단순화 위해)
  update-product/      # 상품 수정 (선택적)
```

### 10.2 RPC 함수 목록 (총 ~10개)
```
public.place_bid(p_product_id, p_price)
public.close_auction(p_product_id)
public.close_auction_manual(p_product_id)  -- seller 검증 추가
public.close_expired_auctions()             -- pg_cron용
public.confirm_trade(p_chat_id)
public.delete_chat_room(p_chat_id)
public.enter_chat_room(p_chat_id)          -- 안 읽음 일괄 read
public.list_products(view, category, keyword, page, size, user_id)
public.get_product_detail(p_product_id)
public.list_my_chats()
public.list_my_wishes(page, size)
public.check_name_available(p_name)
```

### 10.3 PostgREST 직접 사용 (CRUD)
- users (read/update)
- products (read만 — 쓰기는 RPC/EF)
- product_media (읽기, 쓰기는 EF/Storage 조합)
- bids (read만 — 쓰기는 RPC)
- wishes (read/insert/delete)
- chat_messages (read/insert — update는 RPC)

### 10.4 Realtime 채널
- `bids` INSERT filter by `product_id` → 입찰 broadcast
- `chat_messages` INSERT filter by `chat_id` → 채팅 broadcast
- `products` UPDATE filter by `id` → 현재가 갱신, 마감 알림

### 10.5 Storage 버킷
- `product-media` (public)
- `profile-images` (public)
- `chat-media` (private, 참여자만)

---

## 11. 클라이언트 영향 요약

| 변경 | 영향도 |
|---|---|
| axios baseURL → supabase-js client | 전체 API 호출 코드 교체 |
| JWT 처리 → Supabase Auth session | 토큰 저장/주입 흐름 전부 변경 |
| STOMP 클라 라이브러리 제거 → supabase realtime | 채팅, 입찰 실시간 코드 교체 |
| SSE 구독 코드 → realtime channel | (앱이 이미 사용 중이면) 제거/교체 |
| multipart 업로드 → supabase storage SDK | 상품/프로필/채팅 미디어 업로드 흐름 단순화 |
| 에러 응답 포맷 차이 | error 추출 헬퍼 작성 (Postgres SQLSTATE / Edge Function 응답 통일) |

→ **앱 측 api/ 디렉토리 전체 재작성 필요**. Phase 3~8에서 점진 진행.

---

## 12. 에러 코드 통일 전략

batchar-api는 한국어 메시지 + HttpStatus 매핑(ErrorCode enum, 30+종).

Supabase 측 에러 표면:
- PostgREST: HTTP status + message
- RPC: `RAISE EXCEPTION` 메시지/code → PostgrestError
- Edge Function: 직접 응답 형식 제어 가능

**권장**: Edge Function 응답 포맷 + RPC EXCEPTION 메시지를 batchar-api `ErrorCode` 이름과 동일하게 통일.
```ts
// Edge Function 응답
return new Response(JSON.stringify({
  code: 'INVALID_EMAIL_DOMAIN',
  message: '한밭대학교 이메일만 가입 가능합니다.'
}), { status: 400, headers: {...} });
```

```sql
-- RPC
RAISE EXCEPTION 'INVALID_BID_PRICE' USING DETAIL = '입찰 금액은 현재 최고가보다 높아야 합니다.';
```

앱에서 `error.code === 'INVALID_BID_PRICE'`로 분기.
