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
  },
  {
    id: '4',
    title: '창의혁신관',
    originalPrice: 8000,
    currentPrice: 4000,
    location: '강소',
    participants: 10,
    image: 'https://picsum.photos/200/200?random=4',
    deadline: '1시간 남음',
    isFavorite: true,
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
  },
  {
    id: '6',
    title: '노트북 거치대',
    originalPrice: 35000,
    currentPrice: 25000,
    location: '자동화관',
    participants: 15,
    image: 'https://picsum.photos/200/200?random=6',
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
  },
];
