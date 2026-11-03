import type { ReactNode } from 'react';
import { View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edges } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';

type ScreenProps = {
  children: ReactNode;
  edges?: Edges;
  style?: StyleProp<ViewStyle>;
};

export function Screen({ children, edges = ['top', 'right', 'bottom', 'left'], style }: ScreenProps) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  return (
    <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor: colors.background }, style]}>
      <View className="w-full flex-1 self-center" style={{ maxWidth: width >= 768 ? 640 : '100%' }}>
        {children}
      </View>
    </SafeAreaView>
  );
}
