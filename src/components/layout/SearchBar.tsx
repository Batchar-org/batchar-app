import { View, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

type Props = { onSubmit: (keyword: string) => void };

export default function SearchBar({ onSubmit }: Props) {
  return (
    <View className="px-5 py-2">
      <View
        className="h-12 flex-row items-center rounded-3xl border-2 bg-white px-4"
        style={{ borderColor: `${COLORS.primary}66` }}>
        <Feather name="search" size={20} color={COLORS.textMuted} />
        <TextInput
          onSubmitEditing={(e) => onSubmit(e.nativeEvent.text.trim())}
          returnKeyType="search"
          placeholder="검색하기"
          placeholderTextColor={COLORS.textMuted}
          className="ml-3 flex-1 text-base"
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>
    </View>
  );
}
