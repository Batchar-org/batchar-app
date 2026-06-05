import { View, Text } from 'react-native';

type ProductStatusOverlayProps = {
  status?: string;
  size?: 'card' | 'detail';
};

const STATUS_LABELS: Record<string, string> = {
  ENDED: '진행 중',
  TRADED: '종료',
};

export default function ProductStatusOverlay({ status, size = 'card' }: ProductStatusOverlayProps) {
  if (!status || !STATUS_LABELS[status]) return null;

  const isCompleted = status === 'TRADED';
  const isDetail = size === 'detail';

  return (
    <View
      pointerEvents="none"
      className="absolute inset-0 z-10 items-center justify-center"
      style={{ backgroundColor: isCompleted ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.38)' }}>
      <Text
        className={`${isDetail ? 'text-2xl' : 'text-sm'} font-bold text-white`}
        style={{
          textShadowColor: 'rgba(0,0,0,0.45)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 3,
        }}>
        {STATUS_LABELS[status]}
      </Text>
    </View>
  );
}
