import {View, TextInput, TouchableOpacity} from 'react-native';
import {Feather} from '@expo/vector-icons';

export default function SearchBar() {
    return (
        <View className="px-5 py-2">
            <View className="h-12 flex-row items-center rounded-3xl border-2 border-green-500/40 bg-white px-4">
                <Feather name="search" size={20} color="#9CA3AF"/>
                <TextInput
                    placeholder="검색하기"
                    placeholderTextColor="#9CA3AF"
                    className="ml-3 flex-1 text-base"
                />
                <TouchableOpacity>
                    <Feather name="camera" size={20} color="#12B76A"/>
                </TouchableOpacity>
            </View>
        </View>
    );
}
