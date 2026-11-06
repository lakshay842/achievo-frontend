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
  const { colors, scheme } = useTheme();
  const confirmBg = destructive ? colors.error : colors.primary;
  const confirmLabelColor = destructive ? '#FFFFFF' : colors.onPrimary;
  const cancelBg = scheme === 'dark' ? '#242424' : colors.card;

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
            borderWidth: 2,
            borderColor: colors.inputBorder,
            padding: 22,
            gap: 18,
            zIndex: 1,
            elevation: 8,
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
              style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.88 : 1 })}
            >
              <View
                style={{
                  minHeight: 48,
                  borderRadius: radius.full,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: colors.inputBorder,
                  backgroundColor: cancelBg,
                }}
              >
                <AppText variant="label" style={{ fontWeight: '700' }}>
                  {cancelLabel}
                </AppText>
              </View>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
              onPress={onConfirm}
              style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.88 : 1 })}
            >
              <View
                style={{
                  minHeight: 48,
                  borderRadius: radius.full,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: confirmBg,
                  backgroundColor: confirmBg,
                  elevation: 3,
                }}
              >
                <AppText variant="label" style={{ color: confirmLabelColor, fontWeight: '700' }}>
                  {confirmLabel}
                </AppText>
              </View>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
