import type { ProductCategory } from '@/types';

// 상품 카테고리 단일 출처. 등록/수정 폼과 카테고리 탐색 화면이 공유한다.
// 대학생·대학원생·교수·학내 구성원이 실제로 자주 거래하는 항목 위주(저작권·위생상 애매한 항목 제외).
export const PRODUCT_CATEGORIES: ProductCategory[] = [
  // 학업
  { label: '전공교재/도서', icon: 'book-open-variant' },
  { label: '어학/수험서', icon: 'book-multiple' },
  { label: '공학용계산기/제도', icon: 'calculator' },
  { label: '문구/사무용품', icon: 'pencil-outline' },
  // 디지털/가전
  { label: '노트북/태블릿', icon: 'laptop' },
  { label: '전자기기/주변기기', icon: 'headphones' },
  { label: '가전제품', icon: 'washing-machine' },
  // 자취/생활
  { label: '자취/생활용품', icon: 'home-outline' },
  { label: '가구/인테리어', icon: 'sofa' },
  { label: '주방용품', icon: 'silverware-fork-knife' },
  // 패션/뷰티
  { label: '패션/의류', icon: 'tshirt-crew' },
  { label: '패션잡화', icon: 'bag-personal-outline' },
  { label: '뷰티/미용', icon: 'lipstick' },
  // 캠퍼스/이동
  { label: '과잠/학과굿즈', icon: 'school-outline' },
  { label: '자전거/킥보드', icon: 'bike' },
  { label: '자동차/오토바이', icon: 'car' },
  // 취미/기타
  { label: '스포츠/레저', icon: 'basketball' },
  { label: '게임/취미', icon: 'gamepad-variant' },
  { label: '기프티콘/티켓', icon: 'wallet-giftcard' },
  { label: '기타', icon: 'dots-horizontal' },
];

// 등록/수정 모달에서 라벨만 필요할 때 사용한다.
export const CATEGORY_LABELS: string[] = PRODUCT_CATEGORIES.map((category) => category.label);
