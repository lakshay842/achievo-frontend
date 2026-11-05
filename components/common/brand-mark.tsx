import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

import { AppText } from '@/components/common/app-text';
import { BRAND } from '@/constants/brand';
import { radius } from '@/theme/spacing';

type BrandMarkProps = {
  size?: number;
};

export function BrandMark({ size = 72 }: BrandMarkProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: size * 1.55,
          height: size * 1.55,
          borderRadius: radius.full,
          backgroundColor: BRAND.gradient[0],
          opacity: 0.18,
        }}
      />
      <LinearGradient
        colors={BRAND.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.32,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AppText
          variant="display"
          style={{ fontSize: size * 0.46, lineHeight: size * 0.56, color: BRAND.markInk }}
        >
          A
        </AppText>
      </LinearGradient>
    </View>
  );
}
