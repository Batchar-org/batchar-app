import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PILL_HEIGHT = 66;
const OUTER_PADDING_TOP = 8;

export function useTabBarInset() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8);
  return OUTER_PADDING_TOP + PILL_HEIGHT + bottomPadding;
}
