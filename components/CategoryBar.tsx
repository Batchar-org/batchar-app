import {View, Text, TouchableOpacity, ScrollView} from 'react-native';

interface CategoryBarProps {
    activeCategory: string;
    onCategoryPress: (category: string) => void;
}

const CATEGORIES = [
    {id: 'all', label: '전체'},
    {id: 'participating', label: '참여중'},
    {id: 'popular', label: '인기'},
    {id: 'deadline', label: '마감임박'},
    {id: 'latest', label: '최신'},
] as const;

export default function CategoryBar({activeCategory, onCategoryPress}: CategoryBarProps) {
    const isActive = (id: string) => activeCategory === id;

    return (
        <View className="w-full bg-white px-5 py-2">
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{gap: 6, paddingRight: 20}}
            >
                {CATEGORIES.map(({id, label}) => (
                    <TouchableOpacity
                        key={id}
                        onPress={() => onCategoryPress(id)}
                        className={`rounded-full px-4 py-2 ${
                            isActive(id) ? 'bg-green-500' : 'border border-gray-300 bg-white'
                        }`}
                    >
                        <Text
                            className={`text-sm font-semibold ${
                                isActive(id) ? 'text-white' : 'text-gray-600'
                            }`}
                        >
                            {label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}