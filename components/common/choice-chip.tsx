import { Pressable } from 'react-native';

import { AppText } from '@/components/common/app-text';
import { useTheme } from '@/hooks/use-theme';
import { radius, touchTarget } from '@/theme/spacing';

type ChoiceChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function ChoiceChip({ label, selected = false, onPress }: ChoiceChipProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        minHeight: touchTarget - 8,
        paddingHorizontal: 14,
        borderRadius: radius.full,
        borderWidth: 1.5,
        borderColor: selected ? colors.buttonBorder : colors.inputBorder,
        backgroundColor: selected ? `${colors.primary}22` : colors.card,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AppText variant="caption" tone={selected ? 'primary' : 'muted'}>
        {label}
      </AppText>
    </Pressable>
  );
}
