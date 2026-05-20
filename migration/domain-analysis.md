# batchar-api 도메인 분석

> Phase 0 산출물 1/5
> 원본 코드 위치: `/Users/eunhyeonkang/project/batchar-api/`
> 작성 기준: 정적 코드 분석 (실행/DB 스냅샷 미포함)

---

## 1. 스택 개요

| 구분 | 값 |
|---|---|
| 언어/런타임 | Java 21 |
| 프레임워크 | Spring Boot 3.5.7 |
| 빌드 | Gradle |
| DB | MySQL 8 (운영), H2 (테스트) |
| 캐시/이벤트 | Redis (StringRedisTemplate, Keyspace Notifications) |
| 메시징 | Spring WebSocket + STOMP (SimpleBroker) |
| 메일 | Spring Mail + Gmail SMTP |
| 파일 | AWS S3 SDK v2 (직접 업로드 + Presigned URL) |
| 보안 | Spring Security (Stateless) + JJWT (HS256) + BCrypt |
| 문서 | springdoc-openapi 2.8 (`/swagger-ui.html`, `/v3/api-docs`) |
| 자바 파일 수 | 109개 (도메인 8 + global 1) |

## 2. 인프라/외부 의존성

| 외부 시스템 | 사용처 | Supabase 대응 |
|---|---|---|
| MySQL | 모든 도메인 영속 | Postgres (Supabase 기본) |
| Redis | 이메일 인증 코드(5분), 이메일 verified 플래그(10분), Refresh Token, 경매 TTL+Keyspace Notification | Postgres 테이블 + pg_cron, RefreshToken은 Supabase Auth가 대체 |
| AWS S3 | 상품 이미지/영상, 프로필, 채팅 미디어 | Supabase Storage |
| Gmail SMTP | 이메일 인증 코드, 임시 비밀번호 | Resend / Postmark / Supabase Auth 메일 |

### 환경변수 (application.yaml 기준)
- `MAIL_USERNAME`, `MAIL_PASSWORD`
- `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_REGION`, `S3_PRESIGNED_EXPIRATION`
- `JWT_SECRET`, `JWT_ACCESS_EXPIRATION`, `JWT_REFRESH_EXPIRATION`
- `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`

---

## 3. 도메인 정리

### 3.1 User (`user/`)
**엔티티 `users`**
- `id` (PK, IDENTITY)
- `email` UNIQUE, NOT NULL
- `password` NOT NULL (BCrypt)
- `name` UNIQUE, NOT NULL (닉네임)
- `address` NOT NULL
- `profile_image_url` nullable
- `created_at`, `updated_at` (BaseEntity)

**상태 변경 메서드**
- `updateName`, `updateAddress`, `updateProfileImage`, `updatePassword`
- `withdraw()` — soft delete: 이메일을 `withdrawn_{id}@deleted.com`, 이름을 `탈퇴한 사용자{id}`, 주소/비밀번호 공란화

**비즈니스 규칙**
- 회원 탈퇴 시: ON_SALE 상품 있으면 차단 / 진행 중 입찰 있으면 차단
- 비밀번호 변경: 현재 비밀번호 검증 후 새 비밀번호 BCrypt 인코딩

### 3.2 Auth (`auth/`)
**엔드포인트 (`/api/auth/**`)**
| Method | Path | 인증 | 설명 |
|---|---|---|---|
| POST | /signup | X | 회원가입 (사전 이메일 인증 필수) |
| POST | /login | X | 로그인 → access+refresh |
| POST | /logout | O | Refresh Token 무효화 |
| POST | /refresh | X | Refresh Token으로 새 토큰 |
| POST | /password/reset | X | 임시 비밀번호 메일 |
| POST | /email/send | X | 인증 코드 발송 (한밭대 도메인만) |
| POST | /email/verify | X | 인증 코드 검증 |

**이메일 인증 흐름**
1. 허용 도메인: `edu.hanbat.ac.kr`, `o365.hanbat.ac.kr` (`EmailService:31-34`)
2. 6자리 코드 생성 (SecureRandom) → Redis `email:verify:{email}` 5분 TTL
3. 코드 검증 성공 → Redis `email:verified:{email}` 10분 TTL
4. 회원가입 시 `email:verified:{email}` 존재 확인 → 없으면 `EMAIL_NOT_VERIFIED`
5. 가입 성공 후 verified 키 삭제

**JWT 구조**
- 알고리즘: HS256 (Base64 디코딩된 `JWT_SECRET`)
- subject = userId (Long → String)
- access / refresh 별도 만료
- Refresh Token은 Redis `rt:{token}` 에 저장 (값=userId)
- Refresh 시 기존 토큰 삭제 후 신규 발급 (회전)

### 3.3 Product (`product/`)
**엔티티 `products`**
- `id` PK
- `seller_id` FK→users NOT NULL (ManyToOne, LAZY)
- `winner_id` FK→users nullable (낙찰자)
- `title`, `description` (TEXT), `category`
- `start_price`, `current_price` (Long)
- `status` ENUM('ON_SALE','ENDED','FAILED','CANCELED','TRADED')
- `start_time`, `end_time` (LocalDateTime)
- `created_at`, `updated_at`

**엔티티 `product_media`**
- `id` PK, `product_id` FK→products NOT NULL
- `media_url`, `media_type` ENUM('IMAGE','VIDEO')
- 확장자 자동 판별 (`ProductMediaType.from`): jpg/jpeg/png/gif/webp / mp4/mov/avi/webm
- 최소 1개 이상 필수 (수정 시도 보장)

**API (`/api/products`)**
| Method | Path | 인증 | 권한 |
|---|---|---|---|
| POST | / | O | 누구나 (로그인) |
| GET | / | X | 누구나 (MY_PRODUCTS/MY_BIDS view는 인증) |
| GET | /{id} | X | 누구나 |
| PATCH | /{id} | O | seller 본인 |
| DELETE | /{id} | O | seller 본인 |
| POST | /{id}/close | O | seller 본인 (수동 마감) |

**조회 모드 `ProductViewType`**
- `ALL` / `LATEST`: ON_SALE, createdAt DESC
- `POPULAR`: ON_SALE, 위시카운트 DESC, createdAt DESC
- `ENDING_SOON`: ON_SALE, endTime ASC
- `MY_PRODUCTS`: seller.id = userId (모든 상태)
- `MY_BIDS`: 본인 입찰 + ON_SALE만, DISTINCT

**키워드 검색**: `LOWER(title) LIKE LOWER(?)` (공백 → `%`로 치환, 다중 키워드 AND)

**상태 전이 메서드**
- `raisePriceTo(newPrice)` — 입찰 시 현재가 갱신
- `closeAsFailed()` — 마감 시 입찰 없음
- `closeWithWinner(winner)` — 마감 시 낙찰자
- `markAsTraded()` — 양쪽 거래완료 확정

### 3.4 Bid (`bid/`)
**엔티티 `bids`**
- `id`, `product_id` FK, `bidder_id` FK, `price` Long, `status` ENUM('ACTIVE','WON')

**API (`/api/products/{productId}/bids`)**
| Method | Path | 권한 |
|---|---|---|
| POST | / | 인증, seller 아님, ON_SALE만, currentPrice < price |
| GET | / | 누구나 |

**동시성**
- 입찰 시 `productRepository.findByIdWithLock(productId)` — Pessimistic Write 락
- 같은 트랜잭션에서 `product.raisePriceTo(price)` + bid 저장

### 3.5 Wish (`wish/`)
**엔티티 `wishes`**
- `id`, `user_id` FK, `product_id` FK
- UNIQUE(`user_id`, `product_id`)

**API (`/api/wishes`)**
| Method | Path | 권한 |
|---|---|---|
| POST | /{productId} | 인증, 중복 차단 |
| DELETE | /{productId} | 인증, 본인 찜만 |
| GET | / | 인증, 본인 목록 |

### 3.6 Chat (`chat/`)
**엔티티 `chat_room`**
- `id`, `product_id` FK (OneToOne), `seller_id` FK, `buyer_id` FK
- `status` ENUM('ACTIVE','CLOSED')
- `seller_confirmed`, `buyer_confirmed` — 거래 완료 확정 플래그
- `seller_deleted`, `buyer_deleted` — 소프트 삭제 플래그

**엔티티 `chat_message`**
- `id`, `chat_id` FK, `sender_id` FK, `message` TEXT, `is_read` boolean

**API (`/api/chats`, 모두 인증 필수)**
| Method | Path | 권한 |
|---|---|---|
| GET | / | 내가 참여 + 내가 안 지운 채팅 목록 |
| POST | /{chatId}/messages | 참여자만 |
| GET | /{chatId}/messages | 참여자만, 내가 받은 안 읽음 메시지 일괄 read |
| DELETE | /{chatId} | 참여자만, 양쪽 모두 삭제 시 채팅+메시지 완전 삭제 |
| POST | /{chatId}/media | 참여자만, S3 업로드 URL을 메시지로 저장 |
| POST | /{chatId}/complete | 참여자만, product ENDED → 양쪽 confirm 시 TRADED |

**WebSocket (`/ws`)**
- STOMP, SimpleBroker `/topic`, app prefix `/app`
- 인증: CONNECT 시 `Authorization: Bearer {jwt}` → userId를 Principal로 저장
- `MessageMapping("/chat/{chatId}")` → `ChatService.sendMessage`
- 브로드캐스트 토픽:
  - `/topic/chat/{chatId}` — 새 메시지 (TransactionalEventListener AFTER_COMMIT)
  - `/topic/products/{productId}` — 새 입찰 (TransactionalEventListener AFTER_COMMIT)

**채팅방 자동 생성**: 경매 마감 시 낙찰자가 있으면 `ChatService.generateChatRoom` 호출됨

### 3.7 Storage (`storage/`)
**API (`/api/storage`, 인증 필수)**
| Method | Path | 설명 |
|---|---|---|
| POST | /presigned-url | S3 PUT용 Presigned URL 발급 |

**서버 직접 업로드도 존재** (`StorageService.upload`)
- 상품 미디어 저장: `ProductMediaService.saveMedia`
- 채팅 미디어: `ChatService.sendMedia`
- 프로필 이미지: `UserService.updateProfileImage`

**키 규칙**: `{YYYY-MM-DD}/{UUID}{ext}` → URL = `{endpoint}/{bucket}/{key}`

### 3.8 Auction (마감 처리, `auction/`)
**이중 안전장치**:
1. **즉시 마감 (primary)**: Redis Keyspace Notification
   - 상품 등록/수정 시 `AuctionRegisteredEvent` → `AuctionRegistrationListener` → `auctionRedisService.registerTtl(productId, endTime)` → Redis `auction:{id}` 키에 TTL
   - Redis가 키 만료 시 `__keyevent@0__:expired` 발행
   - `AuctionExpiredListener.onMessage` → `closeAuction(productId)`
2. **백업 cron**: `AuctionCloseScheduler` 5분마다 (`@Scheduled(cron = "0 */5 * * * *")`)
   - `ProductRepository.findAllByStatusAndEndTimeBefore(ON_SALE, now)` 일괄 마감

**`closeAuction` 로직** (`AuctionCloseManager`, REQUIRES_NEW 트랜잭션)
1. `productRepository.findByIdWithLock` — Pessimistic Write
2. status ≠ ON_SALE 이면 중복 마감 방지 (조용히 return)
3. 최고가 입찰 조회 `bidRepository.findTopByProductIdOrderByPriceDesc`
4. 없으면 → `closeAsFailed()`
5. 있으면 → `closeWithWinner(bidder)` + `winningBid.closeAsWon()` + `chatService.generateChatRoom`

**수동 마감** (`closeAuction(productId, sellerId)`): seller 검증 추가 락 조회

**Redis 설정 요구**: `notify-keyspace-events Ex` (서버 측 설정 필요)

---

## 4. 이벤트 시스템

| Event | Publisher | Listener | Phase | 효과 |
|---|---|---|---|---|
| `AuctionRegisteredEvent` | ProductService (생성/수정) | AuctionRegistrationListener | AFTER_COMMIT | Redis TTL 등록 |
| `BidPlaceEvent` | BidService.placeBid | BidEventListener | AFTER_COMMIT | STOMP `/topic/products/{id}` broadcast |
| `BidPlaceEvent` | 〃 | SseBidEventListener | — | **주석처리됨 (V1, deprecated)** |
| `ChatMessageSentEvent` | ChatService (send/media) | ChatEventListener | AFTER_COMMIT | STOMP `/topic/chat/{id}` broadcast |
| `ProfileImageDeletedEvent` | UserService (update/delete/withdraw) | ProfileImageEventListener | AFTER_COMMIT | S3 객체 삭제 |
| (Redis pub/sub) | Redis 자체 | AuctionExpiredListener | — | 경매 즉시 마감 |

> 모든 비즈니스 리스너는 `@TransactionalEventListener(AFTER_COMMIT)` — DB 커밋 후 외부 작업 (이메일/메시지/S3) 보장.

---

## 5. 동시성 / 락 정책

| 작업 | 방식 |
|---|---|
| 입찰 (price 갱신) | `findByIdWithLock` (Pessimistic Write) — 동시 입찰 직렬화 |
| 자동 마감 | `findByIdWithLock` + REQUIRES_NEW 트랜잭션, status 재확인으로 중복 방지 |
| 수동 마감 | `findByIdAndSellerIdWithLock` + 동일 패턴 |

**중요**: 경매 마감은 자동(Redis) + cron(5분) + 수동 3 경로 → 모두 락+status 체크로 중복 방지

---

## 6. WebSocket / STOMP 구조

```
클라이언트
  CONNECT /ws  (Authorization: Bearer <jwt>)
       ↓ StompChannelInterceptor 가 토큰 파싱 → Principal 저장
       ↓
  SUBSCRIBE /topic/chat/{chatId}      ← 채팅 수신
  SUBSCRIBE /topic/products/{prodId}  ← 입찰 수신
  SEND /app/chat/{chatId}             ← ChatWebSocketController
```

SEND 시 Principal null이면 `UNAUTHORIZED` 예외.

---

## 7. 권한 매트릭스 요약

| 자원 | 비인증 | 인증 | 본인만 |
|---|---|---|---|
| auth/** (logout 제외) | ✅ | — | — |
| users/email,name/duplicate | ✅ | — | — |
| users/me/** | — | — | ✅ |
| products (조회) | ✅ | — | — |
| products (등록/수정/삭제/마감) | — | seller만 | ✅ |
| products/{id}/bids POST | — | ✅ (seller 아님) | — |
| wishes | — | 본인 | ✅ |
| chats | — | 참여자(seller/buyer) | ✅ |
| storage/presigned-url | — | ✅ | — |
| /ws (CONNECT) | ✅ 통과, SEND 시 JWT 필수 | — | — |

---

## 8. 에러 카탈로그

`ErrorCode` 30+종 (HttpStatus + 메시지 매핑). Supabase Edge Function/PostgREST 응답 포맷 통일을 위해 동일 코드 체계 유지 권장.

주요 그룹:
- Common: INVALID_INPUT_VALUE, UNAUTHORIZED, INTERNAL_SERVER_ERROR ...
- User: USER_NOT_FOUND, DUPLICATE_EMAIL/NAME, INVALID_CREDENTIALS, HAS_ACTIVE_AUCTION/BID, INVALID_PASSWORD
- Email: INVALID_EMAIL_DOMAIN ("한밭대학교 이메일만 가입 가능합니다."), INVALID_VERIFICATION_CODE, EMAIL_NOT_VERIFIED
- Product: PRODUCT_NOT_FOUND, PRODUCT_UPDATE/DELETE/CLOSE_FORBIDDEN, AUCTION_ALREADY_CLOSED, PRODUCT_MEDIA_REQUIRED
- Bid: INVALID_BID_PRICE, AUCTION_CLOSED, SELF_BID_NOT_ALLOWED
- Storage: FILE_UPLOAD_FAILED, UNSUPPORTED_MEDIA_TYPE
- Wish: WISH_NOT_FOUND, WISH_ALREADY_EXISTS
- Chat: CHAT_ACCESS_DENIED, CHATROOM_NOT_FOUND, TRADE_NOT_AVAILABLE, ALREADY_CONFIRMED

---

## 9. Supabase 옮길 때 핵심 주의점

| 항목 | 주의 |
|---|---|
| 이메일 인증 | Supabase Auth 표준 메일이 아닌 **커스텀 흐름 유지** (도메인 검증 + 자체 6자리 코드). Auth Hook + Edge Function 필요. |
| JWT | Supabase Auth가 발급하는 JWT는 sub=UUID. 기존 sub=userId(Long) 호환 불가 → 앱 토큰 처리 전부 교체. |
| Refresh Token | Supabase Auth가 자동 처리. 별도 Redis 저장 불필요. |
| BCrypt 비밀번호 | Supabase Auth는 bcrypt 호환. 다만 이관 데이터 없으므로 신규 가입자만 고려. |
| 경매 즉시 마감 | Redis Keyspace Notification 대응 없음. **pg_cron 1분 간격으로 단순화 권장** (1분 지연 수용). |
| 비관적 락 | Postgres `SELECT ... FOR UPDATE` 가능. plpgsql function 또는 Edge Function + RPC로 입찰 원자성 보장. |
| STOMP 채팅 | Realtime broadcast (또는 Postgres Changes로 chat_message INSERT 구독). 클라이언트 채팅 모듈 재작성. |
| SSE | `ProductSseController` 존재하나 SseBidEventListener는 주석처리 → **deprecated로 보고 제거 가능**. |
| 입찰 SSE/STOMP | Postgres Changes로 bids 테이블 INSERT 구독으로 통일 권장 (단순화). |
| 트랜잭션 이벤트 | AFTER_COMMIT 패턴은 Postgres trigger AFTER INSERT/UPDATE로 대응. 외부 호출은 pg_net 또는 Edge Function. |
| 채팅방 OR 쿼리 | `seller=user AND sellerDeleted=false OR buyer=user AND buyerDeleted=false` — PostgREST에서는 RPC 또는 view 권장. |
| 키워드 LIKE | `LOWER LIKE` → Postgres는 `ILIKE` 또는 `pg_trgm` 인덱스 고려. |
| S3 키 형식 | `{date}/{uuid}{ext}` → Supabase Storage 객체 키도 동일 패턴 유지 가능. |
| 미사용 코드 | `SseEmitterManager`, `ProductSseController`, `SseBidEventListener`(주석) — V1 잔재. 마이그레이션에서 제외. |

---

## 10. 디렉토리 트리 (도메인 계층)

```
io.github.wisoft.batchar_api
├── auction/        마감 처리 (이벤트, 리스너, 스케줄러, Redis TTL 서비스)
├── auth/           가입/로그인/JWT/이메일 인증
├── bid/            입찰 (락 + 이벤트)
├── chat/           채팅 (REST + WebSocket + 미디어)
├── global/         설정, 예외, 공통 DTO, BaseEntity
├── product/        상품 + 미디어 + SSE(deprecated)
├── storage/        S3 직접 업로드 + Presigned URL
├── user/           프로필 + 비밀번호 변경 + 탈퇴
└── wish/           찜
```
