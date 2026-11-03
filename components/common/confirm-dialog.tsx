import { Modal, Pressable, View } from 'react-native';

import { AppText } from '@/components/common/app-text';
import { useTheme } from '@/hooks/use-theme';
import { radius, spacing } from '@/theme/spacing';

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  destructive = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { colors } = useTheme();
  const confirmColor = destructive ? colors.coral : colors.primary;
  const confirmText = destructive ? colors.coral : colors.onPrimary;
  const confirmBg = destructive ? colors.errorSoft : colors.primary;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.62)',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: spacing.xl,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss dialog"
          onPress={onCancel}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
          }}
        />

        <View
          style={{
            width: '100%',
            maxWidth: 380,
            borderRadius: radius.xl,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 22,
            gap: 18,
            zIndex: 1,
          }}
        >
          <View style={{ gap: 8 }}>
            <AppText variant="heading">{title}</AppText>
            <AppText variant="body" tone="muted">
              {message}
            </AppText>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
              onPress={onCancel}
              style={({ pressed }) => ({
                flex: 1,
                minHeight: 48,
                borderRadius: radius.full,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: pressed ? colors.secondarySoft : colors.background,
              })}
            >
              <AppText variant="label">{cancelLabel}</AppText>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
              onPress={onConfirm}
              style={({ pressed }) => ({
                flex: 1,
                minHeight: 48,
                borderRadius: radius.full,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: `${confirmColor}66`,
                backgroundColor: pressed ? `${confirmColor}33` : confirmBg,
              })}
            >
              <AppText variant="label" style={{ color: destructive ? confirmText : colors.onPrimary }}>
                {confirmLabel}
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
