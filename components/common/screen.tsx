import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edges } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';

type ScreenProps = {
  children: ReactNode;
  edges?: Edges;
  style?: StyleProp<ViewStyle>;
  /** Keep focused inputs above the software keyboard (default true). */
  keyboardAvoiding?: boolean;
  keyboardVerticalOffset?: number;
};

export function Screen({
  children,
  edges = ['top', 'right', 'bottom', 'left'],
  style,
  keyboardAvoiding = true,
  keyboardVerticalOffset = 0,
}: ScreenProps) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const content = (
    <View className="w-full flex-1 self-center" style={{ maxWidth: width >= 768 ? 640 : '100%' }}>
      {children}
    </View>
  );

  return (
    <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor: colors.background }, style]}>
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior="padding"
          keyboardVerticalOffset={keyboardVerticalOffset}
          // Expo Android is edge-to-edge — window does not resize; padding is required.
          enabled={Platform.OS !== 'web'}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}
