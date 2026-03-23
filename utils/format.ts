// 가격 포맷팅 유틸리티
// 여러 컴포넌트에서 공통으로 사용

export const formatPrice = (price: number): string => {
  if (price >= 1000000) {
    const man = Math.floor(price / 10000);
    return `${man}만`;
  }
  return `${price.toLocaleString()}`;
};
