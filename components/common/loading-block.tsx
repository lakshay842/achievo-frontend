import { View } from 'react-native';

import { Skeleton } from '@/components/common/skeleton';

export function LoadingBlock({ rows = 3 }: { rows?: number }) {
  return (
    <View style={{ gap: 12 }}>
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} height={index === 0 ? 88 : 64} />
      ))}
    </View>
  );
}
