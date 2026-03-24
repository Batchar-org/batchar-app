// 채팅 목록 더미 데이터

export interface ChatData {
  id: string;
  name: string;
  message: string;
  date: string;
  unreadCount: number;
  avatarColor: string;
  thumbnail: string | null;
  // 채팅 상세 페이지용 필드
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  lastActiveTime: string;
}

export const MOCK_CHATS: ChatData[] = [
  {
    id: '1',
    name: '학생F',
    message: '학생F 님과 경매에 대한 어쩌구...',
    date: '오늘',
    unreadCount: 2,
    avatarColor: '#6B7280',
    thumbnail: null,
    productId: '4',
    productName: '의자',
    productPrice: 80000,
    productImage: 'https://picsum.photos/200/200?random=4',
    lastActiveTime: '3시간 전 접속',
  },
  {
    id: '2',
    name: '학생3',
    message: '학생3 님과 경매에 대한 어쩌구...',
    date: '11월3일',
    unreadCount: 0,
    avatarColor: '#F59E0B',
    thumbnail: 'https://picsum.photos/100/100?random=1',
    productId: '2',
    productName: '맥북 프로 m4 13인치',
    productPrice: 1200000,
    productImage: 'https://picsum.photos/200/200?random=2',
    lastActiveTime: '1일 전 접속',
  },
  {
    id: '3',
    name: '학생ㄱ',
    message: '학생ㄱ 님과 경매에 대한 어쩌구...',
    date: '10월26일',
    unreadCount: 0,
    avatarColor: '#22C55E',
    thumbnail: 'https://picsum.photos/100/100?random=2',
    productId: '3',
    productName: '점퍼',
    productPrice: 140000,
    productImage: 'https://picsum.photos/200/200?random=3',
    lastActiveTime: '2일 전 접속',
  },
];

// ID로 채팅 찾기
export const getChatById = (id: string): ChatData | undefined => {
  return MOCK_CHATS.find((chat) => chat.id === id);
};
