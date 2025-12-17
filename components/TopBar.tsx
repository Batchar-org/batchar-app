import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function TopBar() {
  return (
    <View className="w-full flex-row items-center justify-between bg-white px-5 py-3">
      <Text className="text-2xl font-black text-green-500">밭-찰!</Text>
      <View className="flex-row items-center gap-3">
        <TouchableOpacity>
          <View className="relative h-10 w-10 items-center justify-center rounded-full border-2 border-green-500">
            <Feather name="bell" size={20} color="#12B76A" />
            <View className="absolute -right-1 -top-1 h-4.5 min-w-4.5 items-center justify-center rounded-full bg-red-500">
              <Text className="text-xs font-semibold text-white">2</Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity>
          <View className="h-10 w-10 items-center justify-center rounded-full border-2 border-green-500">
            <Feather name="map-pin" size={20} color="#12B76A" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
