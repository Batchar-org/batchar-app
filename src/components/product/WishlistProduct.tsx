import Product from './Product';

interface WishlistProductProps {
  productId: number;
  title: string;
  startPrice: number;
  currentPrice: number;
  bidCount: number;
  status?: string;
  endTime: string;
  image: string;
  onPress?: () => void;
  onWishRemove?: () => void;
}

export default function WishlistProduct({
  productId,
  title,
  startPrice,
  currentPrice,
  bidCount,
  status,
  endTime,
  image,
  onPress,
  onWishRemove,
}: WishlistProductProps) {
  return (
    <Product
      id={String(productId)}
      title={title}
      originalPrice={startPrice}
      currentPrice={currentPrice}
      location=""
      participants={bidCount}
      image={image}
      status={status}
      endTime={endTime}
      isFavorite
      onPress={onPress}
      onFavoritePress={onWishRemove}
    />
  );
}
