import type { ReactNode } from 'react';
import { useRef } from 'react';
import { ScrollView, View, type ScrollViewInstance } from 'react-native';
import type { Edges } from 'react-native-safe-area-context';

import { AppText } from '@/components/common/app-text';
import { Screen } from '@/components/common/screen';
import { FlowNavBar } from '@/components/navigation/header-nav';
import { useTheme } from '@/hooks/use-theme';
import { spacing } from '@/theme/spacing';

type FlowScreenProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  edges?: Edges;
  /** Keep newest content visible when the page grows. */
  stickToEnd?: boolean;
  /** Fixed Back / Home bar at the very top of the screen. */
  showNav?: boolean;
  showBack?: boolean;
  showHome?: boolean;
};

export function FlowScreen({
  eyebrow,
  title,
  description,
  children,
  footer,
  edges,
  stickToEnd = true,
  showNav = false,
  showBack = true,
  showHome = true,
}: FlowScreenProps) {
  const { colors } = useTheme();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const shouldStick = useRef(true);
  const lastHeight = useRef(0);

  function scrollToLatest(animated = true) {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated });
    });
  }

  return (
    <Screen edges={edges}>
      {showNav ? (
        <View
          style={{
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.sm,
            paddingBottom: spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
          }}
        >
          <FlowNavBar showBack={showBack} showHome={showHome} />
        </View>
      ) : null}
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.lg,
          paddingBottom: spacing.lg,
          gap: spacing.lg,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onContentSizeChange={(_width, height) => {
          if (!stickToEnd) return;

          const grew = height > lastHeight.current + 24;
          if (lastHeight.current > 0 && grew && shouldStick.current) {
            scrollToLatest(true);
          }
          lastHeight.current = height;
        }}
        onScrollBeginDrag={() => {
          shouldStick.current = false;
        }}
        onMomentumScrollEnd={(event) => {
          if (!stickToEnd) return;
          const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
          const distanceFromEnd = contentSize.height - (layoutMeasurement.height + contentOffset.y);
          shouldStick.current = distanceFromEnd < 80;
        }}
      >
        {eyebrow ? <AppText variant="kicker" tone="primary">{eyebrow}</AppText> : null}
        {title ? <AppText variant="title">{title}</AppText> : null}
        {description ? <AppText variant="body" tone="muted">{description}</AppText> : null}
        {children}
      </ScrollView>
      {footer ? (
        <View
          style={{
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.md,
            paddingBottom: spacing.xl,
            gap: spacing.md,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
          }}
        >
          {footer}
        </View>
      ) : null}
    </Screen>
  );
}
