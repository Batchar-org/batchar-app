import { View } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { IMAGE_TRANSITION_MS, IMAGE_PLACEHOLDER } from '@/lib/expo-image-setup';
import { COLORS } from '@/constants/theme';

type Props = {
  uri?: string | null;
  size?: number;
  backgroundColor?: string;
  iconColor?: string;
  iconSize?: number;
};

export default function ProfileAvatar({
  uri,
  size = 36,
  backgroundColor = COLORS.primary,
  iconColor = 'white',
  iconSize,
}: Props) {
  'use memo';

  const resolvedIconSize = iconSize ?? Math.round(size * 0.6);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
      {uri ? (
        <Image
          source={{ uri }}
          className="h-full w-full"
          contentFit="cover"
          transition={IMAGE_TRANSITION_MS}
          placeholder={IMAGE_PLACEHOLDER}
        />
      ) : (
        <MaterialCommunityIcons
          name="account"
          size={resolvedIconSize}
          color={iconColor}
          style={{ marginTop: -Math.round(resolvedIconSize * 0.15) }}
        />
      )}
    </View>
  );
}
