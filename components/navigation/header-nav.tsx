import { router, useNavigation } from 'expo-router';
import { ArrowLeft, Home } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/common/app-text';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/store/auth.store';
import { radius, touchTarget } from '@/theme/spacing';

type NavChipProps = {
  label: string;
  icon: typeof ArrowLeft;
  onPress: () => void;
};

function NavChip({ label, icon: Icon, onPress }: NavChipProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="link"
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: touchTarget - 8,
        paddingHorizontal: 10,
        borderRadius: radius.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: pressed ? colors.secondarySoft : colors.card,
        borderWidth: 1,
        borderColor: colors.border,
      })}
    >
      <Icon color={colors.text} size={16} strokeWidth={2.2} />
      <AppText variant="caption">{label}</AppText>
    </Pressable>
  );
}

function goHome() {
  const status = useAuthStore.getState().status;
  if (status === 'authenticated') {
    router.replace('/(tabs)');
    return;
  }
  router.replace('/(auth)/login');
}

export function HeaderBackButton() {
  const navigation = useNavigation();

  return (
    <View style={{ marginLeft: 4 }}>
      <NavChip
        label="Back"
        icon={ArrowLeft}
        onPress={() => {
          if (navigation.canGoBack()) {
            router.back();
            return;
          }
          goHome();
        }}
      />
    </View>
  );
}

export function HeaderHomeButton() {
  return (
    <View style={{ marginRight: 4 }}>
      <NavChip label="Home" icon={Home} onPress={goHome} />
    </View>
  );
}

type FlowNavBarProps = {
  showBack?: boolean;
  showHome?: boolean;
  onBack?: () => void;
  onHome?: () => void;
};

/** Inline Back / Home row for screens that hide the native stack header. */
export function FlowNavBar({
  showBack = true,
  showHome = true,
  onBack,
  onHome,
}: FlowNavBarProps) {
  const navigation = useNavigation();

  if (!showBack && !showHome) return null;

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
      {showBack ? (
        <NavChip
          label="Back"
          icon={ArrowLeft}
          onPress={() => {
            if (onBack) {
              onBack();
              return;
            }
            if (navigation.canGoBack()) {
              router.back();
              return;
            }
            goHome();
          }}
        />
      ) : (
        <View />
      )}
      {showHome ? <NavChip label="Home" icon={Home} onPress={onHome ?? goHome} /> : null}
    </View>
  );
}
