import { View } from 'react-native';
import Product from './Product';
import { MOCK_PRODUCTS } from '../mocks/product';

export default function ProductList() {
  return (
    <View className="py-2">
      {MOCK_PRODUCTS.map((product) => (
        <Product
          key={product.id}
          {...product}
          onPress={() => console.log('상품 클릭:', product.title)}
          onFavoritePress={() => console.log('찜 클릭:', product.title)}
        />
      ))}
    </View>
  );
}
