import type { LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/common/app-text';
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
  const { colors } = useTheme();

  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} className="flex-row" style={{ gap: 8 }}>
      {options.map((option) => {
        const selected = option.value === value;
        const Icon = option.icon;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={{
              flex: 1,
              minHeight: touchTarget,
              borderRadius: radius.md,
              borderWidth: 1.5,
              borderColor: selected ? colors.buttonBorder : colors.inputBorder,
              backgroundColor: selected ? `${colors.primary}22` : colors.card,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              paddingHorizontal: 8,
            }}
          >
            {Icon ? <Icon color={selected ? colors.primaryText : colors.iconMuted} size={16} strokeWidth={2} /> : null}
            <AppText variant="caption" tone={selected ? 'primary' : 'muted'}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
