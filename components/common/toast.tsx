import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/common/app-text';
import { useTheme } from '@/hooks/use-theme';
import { radius } from '@/theme/spacing';

type ToastTone = 'info' | 'success' | 'error';

type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  showToast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback((message: string, tone: ToastTone = 'info') => {
    const id = ++idRef.current;
    setToasts((current) => [...current.slice(-2), { id, message, tone }]);
    setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3200);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          left: 16,
          right: 16,
          top: insets.top + 8,
          gap: 8,
          zIndex: 100,
        }}
      >
        {toasts.map((toast) => {
          const background =
            toast.tone === 'success'
              ? colors.successSoft
              : toast.tone === 'error'
                ? colors.errorSoft
                : colors.notice;
          const textColor =
            toast.tone === 'success'
              ? colors.success
              : toast.tone === 'error'
                ? colors.error
                : colors.primary;

          return (
            <Animated.View key={toast.id} entering={FadeInUp} exiting={FadeOutUp}>
              <Pressable
                onPress={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
                style={{
                  backgroundColor: background,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: radius.md,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                }}
              >
                <AppText variant="label" style={{ color: textColor }}>
                  {toast.message}
                </AppText>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return value;
}
