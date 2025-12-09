import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import TopBar from '../components/TopBar';
import SearchBar from '../components/SearchBar';
import TabBar from '../components/TabBar';

export default function Home() {
    const [activeTab, setActiveTab] = useState('home');

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
            <TopBar />
            <SearchBar />
            <ScrollView className="flex-1 px-5" scrollEventThrottle={16}>
                {/* 콘텐츠가 여기에 들어갑니다 */}
            </ScrollView>
            <TabBar activeTab={activeTab} onTabPress={setActiveTab} />
        </SafeAreaView>
    );
}