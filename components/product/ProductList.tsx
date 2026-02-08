import { View } from 'react-native';
import { useRouter } from 'expo-router';
import Product from './Product';
import { MOCK_PRODUCTS } from '../../mocks/product';

export default function ProductList() {
  const router = useRouter();

  return (
    <View className="py-2">
      {MOCK_PRODUCTS.map((product) => (
        <Product
          key={product.id}
          {...product}
          onPress={() => router.push(`/product/${product.id}`)}
          onFavoritePress={() => console.log('찜 클릭:', product.title)}
        />
      ))}
    </View>
  );
}
