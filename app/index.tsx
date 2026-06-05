import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import TopBar from '@/components/layout/TopBar';
import SearchBar from '@/components/layout/SearchBar';
import CategoryBar from '@/components/layout/CategoryBar';
import ProductList from '@/components/product/ProductList';
import TabBar from '@/components/layout/TabBar';
import { ProductViewType } from '@/api/types';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<ProductViewType>('ALL');
  const [keyword, setKeyword] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['products'] });
    await queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    setRefreshing(false);
  }, [queryClient]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="bg-white">
        <TopBar />
        <SearchBar onSubmit={setKeyword} />
        <CategoryBar activeCategory={activeCategory} onCategoryPress={setActiveCategory} />
      </View>
      <ProductList
        viewType={activeCategory}
        keyword={keyword}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
      <TabBar />
    </SafeAreaView>
  );
}
