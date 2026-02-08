## Batchar (한밭대 경매 앱)

---

Batchar는 한밭대학교 구성원들을 위한 안전하고 투명한 모바일 경매 애플리케이션입니다.
`Expo Router`를 기반으로 하며, 최신 React Native 기술 스택을 사용하여 구축되었습니다.

</br>
</br>

### Members

---

| 이름 | Role | GitHub       |
| --- | --- |--------------|
| 강은현 | Frontend | [@kaeuhy](https://github.com/kaeuhy)  |
| 박예은 | Frontend | [@yeen322](https://github.com/yeen322) |

</br>
</br>

### Main Features

---

- **학교 인증**: 한밭대 이메일 인증을 통한 신뢰할 수 있는 사용자 확보
- **경매 시스템**: 실시간 입찰, 상한가 설정, 낙찰 알림 기능
- **카테고리**: 전공 서적, 자취 용품, 전자기기 등 맞춤 분류
- **실시간 채팅**: 낙찰자와 판매자 간의 안전한 1:1 대화
- **관심 상품**: 찜하기 및 경매 마감 임박 알림

</br>
</br>

### Tech Stack

---

- **React: 18.3.1**
- **React Native: 0.76.9**
- **TypeScript: ~5.5.0**
- **Expo SDK: 52**
- **expo-router: 4.0.9**
- **NativeWind: 2.0.11**
- **TailwindCSS: 3.3.2**

</br>
</br>

### Project Structure

---

```bash
batchar-app/
├── app/                 # Expo Router 페이지 및 라우트
│   ├── (tabs)/          # 탭 네비게이션 그룹 (메인 화면)
│   ├── modal/           # 모달 스택 화면
│   ├── [dynamic]/       # 동적 라우트 (상세 페이지 등)
│   ├── _layout.tsx      # 전역 레이아웃 및 Provider 설정
│   └── index.tsx        # 앱 진입점
│
├── components/          # 재사용 가능한 UI 컴포넌트
├── hooks/               # 커스텀 React Hooks
├── providers/           # Context Providers (QueryClientProvider 등)
├── apis/            # API 호출 및 외부 서비스 로직
├── store/              # 전역 상태 관리 (Zustand)
├── types/               # TypeScript 인터페이스 및 타입 정의
├── utils/               # 유틸리티 함수 (Formatters, Validators)
├── assets/              # 이미지, 폰트, 아이콘 등 정적 파일
├── tailwind.config.js   # NativeWind 설정
└── app.json             # Expo 설정 파일
```

</br>
</br>

### Contributing

---

- 이 프로젝트를 Fork 합니다.
- 새로운 Feature 브랜치를 생성합니다.
- 변경 사항을 Commit 합니다.
- 브랜치에 Push 합니다.
- Pull Request를 요청합니다.


</br>
