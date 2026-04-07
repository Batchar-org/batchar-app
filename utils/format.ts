// 가격 포맷팅 유틸리티
// 여러 컴포넌트에서 공통으로 사용

export const formatPrice = (price: number): string => {
  return price.toLocaleString();
};
