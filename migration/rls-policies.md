# RLS 정책 설계

> Phase 0 산출물 3/5
> 기반: domain-analysis.md §7 권한 매트릭스 + schema-mapping.md 테이블 구조
> Phase 2 후반에 적용

---

## 0. 기본 전략

### 0.1 Supabase 표준 패턴
- 모든 `public.*` 테이블에 `ENABLE ROW LEVEL SECURITY`
- 정책은 행위(SELECT/INSERT/UPDATE/DELETE) 단위 분리
- 식별: `auth.uid()` — JWT의 sub (UUID)
- 익명 접근 허용은 `anon` role, 인증 사용자는 `authenticated` role

### 0.2 복잡 로직은 RLS가 아닌 RPC/Edge Function
RLS는 **선언적 권한**에 강하고, **다단계 검증·동시성 제어**에는 약함.
- 입찰, 경매 마감, 거래 완료, 채팅방 나가기, 회원 탈퇴 → `SECURITY DEFINER` 함수로 처리 (schema-mapping.md §4)
- RLS는 **READ + 단순 INSERT/UPDATE/DELETE 대상 행 자격 검증**만 담당

### 0.3 함수 검증과 RLS 검증의 중복 허용
SECURITY DEFINER 함수가 권한 검증을 이미 한다고 해서 RLS를 느슨하게 두지 않음. 직접 테이블 접근(예: PostgREST UPDATE) 시에도 안전해야 함.

---

## 1. 테이블별 RLS

### 1.1 `public.users`

```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- READ: 누구나(닉네임/프로필 이미지 표시 위해)
CREATE POLICY users_select_all ON public.users
  FOR SELECT TO anon, authenticated USING (true);

-- INSERT: 본인 row만 (auth.users 생성 후 트리거나 Edge Function에서)
CREATE POLICY users_insert_self ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- UPDATE: 본인 row만
CREATE POLICY users_update_self ON public.users
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- DELETE: 직접 DELETE 금지 (탈퇴는 함수 경유)
-- 정책 미정의 → 기본 거부
```

> **자동 생성 트리거**: `auth.users` INSERT 시 `public.users` row 생성 (별도 trigger 또는 Edge Function). 가입 절차 검증(한밭 도메인 등)은 그 전에 Edge Function이 차단.

### 1.2 `public.products`

```sql
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- READ: 누구나
CREATE POLICY products_select_all ON public.products
  FOR SELECT TO anon, authenticated USING (true);

-- INSERT: seller_id = 본인
CREATE POLICY products_insert_own ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (seller_id = auth.uid());

-- UPDATE: seller 본인 + ON_SALE 상태 (마감 후 일반 수정 차단)
-- (winner_id/status 갱신은 close_auction 함수의 SECURITY DEFINER 권한으로 우회)
CREATE POLICY products_update_seller_onsale ON public.products
  FOR UPDATE TO authenticated
  USING (seller_id = auth.uid() AND status = 'ON_SALE')
  WITH CHECK (seller_id = auth.uid());

-- DELETE: seller 본인 + ON_SALE 상태
CREATE POLICY products_delete_seller_onsale ON public.products
  FOR DELETE TO authenticated
  USING (seller_id = auth.uid() AND status = 'ON_SALE');
```

> **참고**: `current_price` 직접 UPDATE는 RLS 통과돼도 비즈니스 규칙(증가만) 보장 안 됨. **클라는 항상 `place_bid` RPC 사용**. 코드 리뷰에서 직접 UPDATE 차단.

### 1.3 `public.product_media`

```sql
ALTER TABLE public.product_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY product_media_select_all ON public.product_media
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY product_media_insert_seller ON public.product_media
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_id AND p.seller_id = auth.uid()
  ));

CREATE POLICY product_media_delete_seller ON public.product_media
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_id AND p.seller_id = auth.uid()
  ));
```

### 1.4 `public.bids`

```sql
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- READ: 누구나
CREATE POLICY bids_select_all ON public.bids
  FOR SELECT TO anon, authenticated USING (true);

-- INSERT/UPDATE: 직접 차단 (place_bid 함수만 허용)
-- 정책 미정의 → 기본 거부

-- 단, RPC 함수는 SECURITY DEFINER + 함수 내부에서 owner 권한으로 INSERT
-- → RLS 우회됨. 함수 자체가 검증 책임.
```

> **중요**: `bids` 직접 INSERT 차단으로 `place_bid` 사용 강제. 클라가 직접 INSERT 시도하면 거부됨.

### 1.5 `public.wishes`

```sql
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY wishes_select_own ON public.wishes
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY wishes_insert_own ON public.wishes
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY wishes_delete_own ON public.wishes
  FOR DELETE TO authenticated USING (user_id = auth.uid());
```

> **위시 카운트 노출**: 다른 유저의 위시 row를 직접 못 보지만, `count(*)` 집계는 별도 RPC (`get_product_wish_count(p_product_id)`) 또는 `products` 테이블에 비정규화 컬럼(`wish_count`) 추가 + trigger 갱신 권장.

### 1.6 `public.chat_rooms`

```sql
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

-- READ: 참여자만 + 내 쪽이 안 지운 상태
CREATE POLICY chat_rooms_select_participant ON public.chat_rooms
  FOR SELECT TO authenticated USING (
    (seller_id = auth.uid() AND seller_deleted = FALSE)
    OR (buyer_id = auth.uid() AND buyer_deleted = FALSE)
  );

-- INSERT/UPDATE/DELETE: 직접 차단 (close_auction / confirm_trade / delete_chat_room 함수 경유)
-- 정책 미정의 → 기본 거부
```

### 1.7 `public.chat_messages`

```sql
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- READ: 채팅방 참여자만 + 내 쪽 안 지운 채팅
CREATE POLICY chat_messages_select_participant ON public.chat_messages
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms r
      WHERE r.id = chat_id
        AND ((r.seller_id = auth.uid() AND r.seller_deleted = FALSE)
          OR (r.buyer_id = auth.uid() AND r.buyer_deleted = FALSE))
    )
  );

-- INSERT: 채팅방 참여자 + 본인이 sender
CREATE POLICY chat_messages_insert_participant ON public.chat_messages
  FOR INSERT TO authenticated WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.chat_rooms r
      WHERE r.id = chat_id
        AND ((r.seller_id = auth.uid() AND r.seller_deleted = FALSE)
          OR (r.buyer_id = auth.uid() AND r.buyer_deleted = FALSE))
    )
  );

-- UPDATE: 읽음 처리 — 내가 받은 메시지(sender_id ≠ auth.uid())의 is_read만
CREATE POLICY chat_messages_update_read ON public.chat_messages
  FOR UPDATE TO authenticated USING (
    sender_id <> auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.chat_rooms r
      WHERE r.id = chat_id
        AND (r.seller_id = auth.uid() OR r.buyer_id = auth.uid())
    )
  );
```

> **WITH CHECK 미지정** = USING과 동일 행 자격. is_read 외 다른 컬럼 변경은 비즈니스적으로 의미 없으므로 컬럼 권한은 별도로 좁히지 않음 (필요 시 컬럼 GRANT 추가).

### 1.8 `public.email_verifications`

```sql
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;
-- 클라 직접 접근 금지. Edge Function (SERVICE_ROLE)만 사용.
-- 정책 미정의 → anon/authenticated 모두 차단
```

---

## 2. Realtime 권한

Supabase Realtime은 RLS를 그대로 따름.
- `public.bids` INSERT 이벤트 구독 → 누구나 (READ 정책이 all)
- `public.chat_messages` INSERT 이벤트 구독 → 참여자만 자동 필터링
- `public.products` UPDATE(현재가 변경) 구독 → 누구나

별도 publication 추가 필요:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
```

---

## 3. Storage 정책

Supabase Storage 버킷 단위 RLS (`storage.objects`).

### 3.1 버킷 구성
| 버킷 | 용도 | 공개여부 |
|---|---|---|
| `product-media` | 상품 이미지/영상 | public read (URL 노출됨) |
| `profile-images` | 프로필 이미지 | public read |
| `chat-media` | 채팅 첨부 | **참여자만 read** (signed URL 또는 private) |

### 3.2 정책 예시

**product-media (public read, seller write)**
```sql
CREATE POLICY product_media_storage_read ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'product-media');

CREATE POLICY product_media_storage_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-media' AND owner = auth.uid());

CREATE POLICY product_media_storage_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-media' AND owner = auth.uid());
```

**profile-images (public read, 본인 write)**
```sql
CREATE POLICY profile_images_storage_read ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'profile-images');

CREATE POLICY profile_images_storage_write ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profile-images' AND owner = auth.uid());

CREATE POLICY profile_images_storage_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'profile-images' AND owner = auth.uid());
```

**chat-media (참여자만)**
참여자 검증은 path 기반: 파일명 `{chatId}/{uuid}{ext}`
```sql
CREATE POLICY chat_media_storage_read ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'chat-media'
    AND EXISTS (
      SELECT 1 FROM public.chat_rooms r
      WHERE r.id::text = split_part(name, '/', 1)
        AND (r.seller_id = auth.uid() OR r.buyer_id = auth.uid())
    )
  );

CREATE POLICY chat_media_storage_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'chat-media'
    AND EXISTS (
      SELECT 1 FROM public.chat_rooms r
      WHERE r.id::text = split_part(name, '/', 1)
        AND (r.seller_id = auth.uid() OR r.buyer_id = auth.uid())
    )
  );
```

> **참고**: batchar-api는 채팅 미디어를 일반 S3 public URL로 사용. 더 강한 권한을 원하면 위처럼 private + signed URL. 일단 V1은 batchar-api 동일하게 public으로 가도 무방.

---

## 4. Auth Hook (한밭대 도메인 차단)

Supabase는 다음 Auth Hook을 지원:
- **Send Email Hook** — 이메일 발송 직전 가로채기
- **Before User Created Hook** (또는 Custom Access Token Hook 조합) — 가입 직전 검증

batchar는 이미 자체 인증코드 흐름을 가지므로 **Supabase Auth 표준 가입을 사용하지 않음**. 대신:
- 회원가입은 **Edge Function `signup` 으로 단일화**
- 함수 내부에서 도메인 검증 + `email_verifications` verified 확인 후 `supabase.auth.admin.createUser` 호출
- 즉, Hook이 없어도 차단 가능

→ Auth Hook은 옵션. **Edge Function 경유로 단순화 권장**. (api-mapping.md 참조)

---

## 5. 권한 검증 체크리스트 (Phase 2 끝나기 전 확인)

- [ ] 모든 `public.*` 테이블에 RLS ENABLED
- [ ] `anon`은 products/product_media/bids/users만 SELECT 가능
- [ ] `authenticated`는 본인 자원만 INSERT/UPDATE/DELETE
- [ ] `bids` 직접 INSERT 차단 (place_bid RPC만)
- [ ] `chat_rooms` 직접 INSERT/UPDATE/DELETE 차단 (함수만)
- [ ] `email_verifications`는 클라 접근 0
- [ ] Realtime publication에 bids/chat_messages/products 등록
- [ ] Storage 정책 적용 (product-media, profile-images, chat-media)

---

## 6. 흔한 함정

| 함정 | 대처 |
|---|---|
| `auth.uid()`가 trigger 내부에서 NULL | trigger 함수는 `SECURITY DEFINER`로 두지 말고, RPC에서 `auth.uid()` 캡처해 인자로 넘김 |
| SECURITY DEFINER 함수가 RLS 우회 → 검증 누락 | 함수 첫 줄에서 `IF auth.uid() IS NULL THEN ...` |
| 누락된 정책으로 사일런트 거부 | Supabase 대시보드의 RLS 시뮬레이터로 행별 테스트 |
| Realtime이 RLS 적용 안 되는 듯 보임 | publication 등록 확인, anon/authenticated 키 사용 확인 |
| Storage 정책의 `owner` NULL | `owner_id` 필드는 Supabase가 자동 설정. signed upload 시 NULL일 수 있음 — `(metadata ->> 'owner')::uuid` 등 대안 검토 |
