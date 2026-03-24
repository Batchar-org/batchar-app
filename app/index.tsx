import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import TopBar from '../components/layout/TopBar';
import SearchBar from '../components/layout/SearchBar';
import CategoryBar from '../components/layout/CategoryBar';
import ProductList from '../components/product/ProductList';
import TabBar from '../components/layout/TabBar';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="bg-white">
        <TopBar />
        <SearchBar />
        <CategoryBar activeCategory={activeCategory} onCategoryPress={setActiveCategory} />
      </View>
      <ScrollView
        className="flex-1 bg-gray-50 px-5"
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}>
        <ProductList />
      </ScrollView>
      <TabBar />
    </SafeAreaView>
  );
}
