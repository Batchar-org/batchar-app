import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import SearchBar from '@/components/layout/SearchBar';
import CategoryBar from '@/components/layout/CategoryBar';
import ProductList from '@/components/product/ProductList';
import TabBar from '@/components/layout/TabBar';
import { ProductViewType } from '@/types';
import { useIsGuest } from '@/store/useAuthStore';
import { useRefreshHome } from '@/hooks/useRefreshHome';
import { promptLogin } from '@/lib/promptLogin';

// 로그인이 필요한 뷰 타입 (서버의 requiresAuth와 동기화)
const AUTH_REQUIRED_VIEWS = new Set<ProductViewType>(['MY_ACTIVE_BIDS', 'MY_BIDS', 'MY_PRODUCTS']);

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<ProductViewType>('ALL');
  const [keyword, setKeyword] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const refreshHome = useRefreshHome();
  const isGuest = useIsGuest();

  const handleCategoryPress = useCallback(
    (category: ProductViewType) => {
      if (isGuest && AUTH_REQUIRED_VIEWS.has(category)) {
        promptLogin('한밭대학교 구성원만 이용할 수 있는 기능이에요.');
        return;
      }
      setActiveCategory(category);
    },
    [isGuest]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshHome();
    setRefreshing(false);
  }, [refreshHome]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="bg-white">
        <TopBar />
        <SearchBar onSubmit={setKeyword} />
        <CategoryBar activeCategory={activeCategory} onCategoryPress={handleCategoryPress} />
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
