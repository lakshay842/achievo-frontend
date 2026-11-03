import { View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type StepIndicatorProps = {
  step: number;
  total: number;
};

export function StepIndicator({ step, total }: StepIndicatorProps) {
  const { colors } = useTheme();

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`Step ${step} of ${total}`}
      className="flex-row"
      style={{ gap: 8 }}
    >
      {Array.from({ length: total }, (_, index) => {
        const active = index < step;
        return (
          <View
            key={index}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 999,
              backgroundColor: active ? colors.primary : colors.border,
            }}
          />
        );
      })}
    </View>
  );
}
