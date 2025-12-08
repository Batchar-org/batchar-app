import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopBar from '../components/TopBar';
import SearchBar from '../components/SearchBar';

export default function Home() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <TopBar />
      <SearchBar />
      <View className="flex-1 px-5" />
    </SafeAreaView>
  );
}
