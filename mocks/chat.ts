// 채팅 목록 더미 데이터

export interface ChatData {
  id: string;
  name: string;
  message: string;
  date: string;
  unreadCount: number;
  avatarColor: string;
  thumbnail: string | null;
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
  },
  {
    id: '2',
    name: '학생3',
    message: '학생3 님과 경매에 대한 어쩌구...',
    date: '11월3일',
    unreadCount: 0,
    avatarColor: '#F59E0B',
    thumbnail: 'https://picsum.photos/100/100?random=1',
  },
  {
    id: '3',
    name: '학생ㄱ',
    message: '학생ㄱ 님과 경매에 대한 어쩌구...',
    date: '10월26일',
    unreadCount: 0,
    avatarColor: '#22C55E',
    thumbnail: 'https://picsum.photos/100/100?random=2',
  },
];
