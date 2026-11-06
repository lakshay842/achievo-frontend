import { LinearGradient } from 'expo-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/common/app-text';
import { BRAND } from '@/constants/brand';
import { useTheme } from '@/hooks/use-theme';
import { radius, touchTarget } from '@/theme/spacing';

type Option<T extends string> = {
  value: T;
  label: string;
  icon?: LucideIcon;
};

type SegmentedControlProps<T extends string> = {
  label: string;
  value: T;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({ label, value, options, onChange }: SegmentedControlProps<T>) {
  const { colors, scheme } = useTheme();

  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={{ flexDirection: 'row', gap: 8 }}>
      {options.map((option) => {
        const selected = option.value === value;
        const Icon = option.icon;
        const fg = selected ? BRAND.markInk : colors.text;
        const idleBg = scheme === 'dark' ? '#1F1F1F' : colors.card;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.88 : 1 })}
          >
            {selected ? (
              <LinearGradient
                colors={[...BRAND.gradient]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={{
                  minHeight: touchTarget,
                  borderRadius: radius.md,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  paddingHorizontal: 8,
                  elevation: 3,
                }}
              >
                {Icon ? <Icon color={fg} size={16} strokeWidth={2.2} /> : null}
                <AppText variant="caption" style={{ color: fg, fontWeight: '700' }}>
                  {option.label}
                </AppText>
              </LinearGradient>
            ) : (
              <View
                style={{
                  minHeight: touchTarget,
                  borderRadius: radius.md,
                  borderWidth: 2,
                  borderColor: colors.inputBorder,
                  backgroundColor: idleBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  paddingHorizontal: 8,
                }}
              >
                {Icon ? <Icon color={fg} size={16} strokeWidth={2.2} /> : null}
                <AppText variant="caption" style={{ color: fg, fontWeight: '500' }}>
                  {option.label}
                </AppText>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
