// 공통 포맷팅 유틸리티

export const formatPrice = (price: number): string => {
  if (price >= 1000000) {
    const man = (price / 10000).toFixed(1).replace(/\.0$/, '');
    return `${man}만`;
  }
  return price.toLocaleString();
};

export function formatRemainingTime(endTimeStr: string): string {
  const end = new Date(endTimeStr);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  if (diff <= 0) return '마감됨';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}일 ${hours}시간`;
  if (hours > 0) return `${hours}시간 ${minutes}분`;
  return `${minutes}분`;
}
