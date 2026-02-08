// 상품 목록 더미 데이터

export interface ProductData {
  id: string;
  title: string;
  originalPrice: number;
  currentPrice: number;
  location: string;
  participants: number;
  image: string;
  badge?: 'HOT' | 'NEW';
  deadline?: string;
  isFavorite?: boolean;
  // 상세 페이지용 추가 필드
  images?: string[];
  description?: string;
  sellerName?: string;
  isTrustedSeller?: boolean;
  views?: number;
  endDate?: string;
  remainingTime?: string;
}

export const MOCK_PRODUCTS: ProductData[] = [
  {
    id: '1',
    title: '스팸',
    originalPrice: 3200,
    currentPrice: 5000,
    location: '도서관',
    participants: 12,
    image: 'https://picsum.photos/200/200?random=1',
    badge: 'HOT',
    isFavorite: true,
    images: [
      'https://picsum.photos/400/300?random=1',
      'https://picsum.photos/400/300?random=11',
      'https://picsum.photos/400/300?random=12',
    ],
    description: '유통기한이 넉넉한 스팸입니다. 상태 매우 좋습니다.',
    sellerName: '신뢰판매자',
    isTrustedSeller: true,
    views: 234,
    endDate: '11/14 02:30 오후',
    remainingTime: '2일 8시간',
  },
  {
    id: '2',
    title: '맥북 프로 m4 13인치',
    originalPrice: 820000,
    currentPrice: 1200000,
    location: '산업정보관',
    participants: 8,
    image: 'https://picsum.photos/200/200?random=2',
    deadline: '2시간 남음',
    images: [
      'https://picsum.photos/400/300?random=2',
      'https://picsum.photos/400/300?random=21',
      'https://picsum.photos/400/300?random=22',
    ],
    description: '맥북 프로 M4 13인치입니다. 상태 매우 좋습니다.',
    sellerName: '테크유저',
    isTrustedSeller: true,
    views: 567,
    endDate: '11/10 18:00 오후',
    remainingTime: '2시간',
  },
  {
    id: '3',
    title: '점퍼',
    originalPrice: 200000,
    currentPrice: 140000,
    location: '대학본부',
    participants: 5,
    image: 'https://picsum.photos/200/200?random=3',
    badge: 'NEW',
    images: [
      'https://picsum.photos/400/300?random=3',
      'https://picsum.photos/400/300?random=31',
      'https://picsum.photos/400/300?random=32',
    ],
    description: '브랜드 점퍼입니다. 사이즈 L입니다.',
    sellerName: '패션러버',
    isTrustedSeller: false,
    views: 89,
    endDate: '11/15 12:00 오후',
    remainingTime: '3일 2시간',
  },
  {
    id: '4',
    title: '폭신한 사무용 의자',
    originalPrice: 50000,
    currentPrice: 80000,
    location: '창의혁신관',
    participants: 10,
    image: 'https://picsum.photos/200/200?random=4',
    deadline: '1시간 남음',
    isFavorite: true,
    images: [
      'https://picsum.photos/400/300?random=4',
      'https://picsum.photos/400/300?random=41',
      'https://picsum.photos/400/300?random=42',
    ],
    description:
      '사무실에서 5개월 사용한 의자입니다. 상태 매우 좋고 사용감이 거의 없습니다. 사용 기간 동안 이사한 적이 없어서 깨끗한 상태로 관리되어 있습니다. 직거래 가능합니다. 택배로는 크기가 너무 커서 직접 수령이 필요할 수 도 있습니다.',
    sellerName: '신뢰판매자',
    isTrustedSeller: true,
    views: 234,
    endDate: '11/14 02:30 오후',
    remainingTime: '2일 8시간',
  },
  {
    id: '5',
    title: '콜라 5개',
    originalPrice: 9000,
    currentPrice: 5000,
    location: '공동실습관1',
    participants: 7,
    image: 'https://picsum.photos/200/200?random=5',
    badge: 'HOT',
    images: [
      'https://picsum.photos/400/300?random=5',
      'https://picsum.photos/400/300?random=51',
      'https://picsum.photos/400/300?random=52',
    ],
    description: '콜라 5개 세트입니다.',
    sellerName: '음료판매자',
    isTrustedSeller: false,
    views: 45,
    endDate: '11/12 18:00 오후',
    remainingTime: '1일 4시간',
  },
  {
    id: '6',
    title: '노트북 거치대',
    originalPrice: 35000,
    currentPrice: 25000,
    location: '자동화관',
    participants: 15,
    image: 'https://picsum.photos/200/200?random=6',
    images: [
      'https://picsum.photos/400/300?random=6',
      'https://picsum.photos/400/300?random=61',
      'https://picsum.photos/400/300?random=62',
    ],
    description: '알루미늄 노트북 거치대입니다.',
    sellerName: '가제트샵',
    isTrustedSeller: true,
    views: 123,
    endDate: '11/16 15:00 오후',
    remainingTime: '4일 5시간',
  },
  {
    id: '7',
    title: '무선 키보드',
    originalPrice: 50000,
    currentPrice: 35000,
    location: '공동실습관2',
    participants: 9,
    image: 'https://picsum.photos/200/200?random=7',
    badge: 'NEW',
    deadline: '3시간 남음',
    images: [
      'https://picsum.photos/400/300?random=7',
      'https://picsum.photos/400/300?random=71',
      'https://picsum.photos/400/300?random=72',
    ],
    description: '로지텍 무선 키보드입니다.',
    sellerName: '키보드마니아',
    isTrustedSeller: true,
    views: 178,
    endDate: '11/10 21:00 오후',
    remainingTime: '3시간',
  },
  {
    id: '8',
    title: '블루투스 이어폰',
    originalPrice: 89000,
    currentPrice: 58000,
    location: '남문',
    participants: 20,
    image: 'https://picsum.photos/200/200?random=8',
    isFavorite: true,
    images: [
      'https://picsum.photos/400/300?random=8',
      'https://picsum.photos/400/300?random=81',
      'https://picsum.photos/400/300?random=82',
    ],
    description: '에어팟 프로 2세대입니다.',
    sellerName: '애플러버',
    isTrustedSeller: true,
    views: 456,
    endDate: '11/13 20:00 오후',
    remainingTime: '2일 10시간',
  },
  {
    id: '9',
    title: '스탠드 조명',
    originalPrice: 28000,
    currentPrice: 18000,
    location: '그린에너지관',
    participants: 6,
    image: 'https://picsum.photos/200/200?random=9',
    badge: 'HOT',
    images: [
      'https://picsum.photos/400/300?random=9',
      'https://picsum.photos/400/300?random=91',
      'https://picsum.photos/400/300?random=92',
    ],
    description: 'LED 스탠드 조명입니다.',
    sellerName: '인테리어샵',
    isTrustedSeller: false,
    views: 67,
    endDate: '11/14 10:00 오전',
    remainingTime: '2일 0시간',
  },
  {
    id: '10',
    title: '책상 정리함',
    originalPrice: 32000,
    currentPrice: 22000,
    location: '도서관',
    participants: 11,
    image: 'https://picsum.photos/200/200?random=10',
    deadline: '30분 남음',
    images: [
      'https://picsum.photos/400/300?random=10',
      'https://picsum.photos/400/300?random=101',
      'https://picsum.photos/400/300?random=102',
    ],
    description: '다용도 책상 정리함입니다.',
    sellerName: '정리왕',
    isTrustedSeller: true,
    views: 89,
    endDate: '11/10 10:30 오전',
    remainingTime: '30분',
  },
];

// ID로 상품 찾기
export const getProductById = (id: string): ProductData | undefined => {
  return MOCK_PRODUCTS.find((product) => product.id === id);
};
