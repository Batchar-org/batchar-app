import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import TopBar from '../components/TopBar';
import SearchBar from '../components/SearchBar';
import CategoryBar from '../components/CategoryBar';
import TabBar from '../components/TabBar';

export default function Home() {
    const [activeTab, setActiveTab] = useState('home');
    const [activeCategory, setActiveCategory] = useState('all');

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
            <TopBar />
            <SearchBar />
            <CategoryBar activeCategory={activeCategory} onCategoryPress={setActiveCategory} />
            <ScrollView className="flex-1 px-5" scrollEventThrottle={16}>
                {/* 메인 콘텐츠 */}
            </ScrollView>
            <TabBar activeTab={activeTab} onTabPress={setActiveTab} />
        </SafeAreaView>
    );
}