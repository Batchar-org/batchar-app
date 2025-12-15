import { View, Text, Image, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ProductProps {
    id: string;
    title: string;
    originalPrice: number;
    currentPrice: number;
    location: string;
    participants: number;
    image: string;
    badge?: 'HOT' | 'NEW';
    deadline?: string;
    isFavorite?: boolean;
    onPress?: () => void;
    onFavoritePress?: () => void;
}

const formatPrice = (price: number): string => {
    if (price >= 1000000) {
        const man = Math.floor(price / 10000);
        return `${man}만`;
    }
    return `${price.toLocaleString()}`;
};

export default function Product({
    title,
    originalPrice,
    currentPrice,
    location,
    participants,
    image,
    badge,
    deadline,
    isFavorite = false,
    onPress,
    onFavoritePress,
}: ProductProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="mb-4 rounded-2xl bg-white p-3"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 3,
            }}
        >
            <View className="flex-row">
                {/* 상품 이미지 */}
                <View className="relative mr-3 h-24 w-24 overflow-hidden rounded-xl bg-gray-100">
                    {badge && (
                        <View
                            className={`absolute left-2 top-2 z-10 rounded px-1.5 py-1 ${
                                badge === 'HOT' ? 'bg-orange-500' : 'bg-green-500'
                            }`}
                        >
                            <Text className="text-xs font-bold text-white">{badge}</Text>
                        </View>
                    )}
                    {deadline && (
                        <View className="absolute bottom-2 left-2 z-10 flex-row items-center rounded bg-black/70 px-1.5 py-0.5">
                            <MaterialCommunityIcons name="clock-outline" size={10} color="white" />
                            <Text className="ml-1 text-xs font-semibold text-white">{deadline}</Text>
                        </View>
                    )}
                    <Image source={{ uri: image }} className="h-full w-full" resizeMode="cover" />
                </View>

                {/* 상품 정보 */}
                <View className="flex-1">
                    <Text
                        className="mb-1 text-base font-bold text-gray-900"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {title.length > 10 ? `${title.substring(0, 10)}...` : title}
                    </Text>
                    <View className="mb-3 flex-row items-center">
                        <MaterialCommunityIcons name="map-marker-outline" size={12} color="#9CA3AF" />
                        <Text className="ml-1 text-xs text-gray-500">{location}</Text>
                    </View>

                    {/* 가격 정보 */}
                    <View className="flex-row items-center gap-2">
                        {/* 시작가 */}
                        <TouchableOpacity
                            activeOpacity={0.7}
                            className="flex-1 items-center rounded-lg bg-gray-100 px-2.5 py-1.5"
                            style={{
                                ...(Platform.OS === 'web' && {
                                    cursor: 'pointer',
                                }),
                            }}
                        >
                            <Text className="text-xs text-gray-500">시작가</Text>
                            <Text className="text-xs font-bold text-gray-700">
                                {formatPrice(originalPrice)}원
                            </Text>
                        </TouchableOpacity>

                        {/* 현재가 */}
                        <TouchableOpacity
                            activeOpacity={0.7}
                            className="flex-1 items-center rounded-lg bg-green-500 px-2.5 py-1.5"
                            style={{
                                ...(Platform.OS === 'web' && {
                                    cursor: 'pointer',
                                }),
                            }}
                        >
                            <Text className="text-xs text-white">현재가</Text>
                            <Text className="text-xs font-bold text-white">
                                {formatPrice(currentPrice)}원
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 찜 버튼 */}
                <TouchableOpacity
                    onPress={onFavoritePress}
                    activeOpacity={0.7}
                    className="ml-2"
                >
                    <MaterialCommunityIcons
                        name={isFavorite ? 'heart' : 'heart-outline'}
                        size={24}
                        color={isFavorite ? '#12B76A' : '#D1D5DB'}
                    />
                </TouchableOpacity>
            </View>

            {/* 참여자 수 */}
            <View className="mt-2 flex-row items-center pl-1">
                <MaterialCommunityIcons name="account-outline" size={14} color="#9CA3AF" />
                <Text className="ml-1 text-xs text-gray-500">{participants}명 참여중</Text>
            </View>
        </TouchableOpacity>
    );
}