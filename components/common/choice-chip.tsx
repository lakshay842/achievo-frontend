import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/common/app-text';
import { BRAND } from '@/constants/brand';
import { useTheme } from '@/hooks/use-theme';
import { radius, touchTarget } from '@/theme/spacing';

type ChoiceChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function ChoiceChip({ label, selected = false, onPress }: ChoiceChipProps) {
  const { colors, scheme } = useTheme();
  const idleBg = scheme === 'dark' ? '#1F1F1F' : colors.card;
  const labelColor = selected ? BRAND.markInk : colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
    >
      {selected ? (
        <LinearGradient
          colors={[...BRAND.gradient]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{
            minHeight: touchTarget - 8,
            paddingHorizontal: 14,
            borderRadius: radius.full,
            alignItems: 'center',
            justifyContent: 'center',
            elevation: 3,
          }}
        >
          <AppText variant="caption" style={{ color: labelColor, fontWeight: '700' }}>
            {label}
          </AppText>
        </LinearGradient>
      ) : (
        <View
          style={{
            minHeight: touchTarget - 8,
            paddingHorizontal: 14,
            borderRadius: radius.full,
            borderWidth: 2,
            borderColor: colors.inputBorder,
            backgroundColor: idleBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AppText variant="caption" style={{ color: labelColor, fontWeight: '500' }}>
            {label}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}
