import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import TopBar from '../components/TopBar';
import SearchBar from '../components/SearchBar';
import CategoryBar from '../components/CategoryBar';
import ProductList from '../components/ProductList';
import TabBar from '../components/TabBar';

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'bottom']}>
      <TopBar />
      <SearchBar />
      <CategoryBar activeCategory={activeCategory} onCategoryPress={setActiveCategory} />
      <ScrollView className="flex-1 px-5" scrollEventThrottle={16} showsVerticalScrollIndicator={false}>
        <ProductList />
      </ScrollView>
      <TabBar activeTab={activeTab} onTabPress={setActiveTab} />
    </SafeAreaView>
  );
}