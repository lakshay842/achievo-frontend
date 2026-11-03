import { Tabs } from 'expo-router';
import { House, Sparkles, Target, TrendingUp, UserRound } from 'lucide-react-native';
import type { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { fontFamily } from '@/theme/typography';
import { radius } from '@/theme/spacing';

const tabs = {
  index: { label: 'Home', icon: House },
  goals: { label: 'My Goals', icon: Target },
  coach: { label: 'AI Coach', icon: Sparkles },
  progress: { label: 'Progress', icon: TrendingUp },
  profile: { label: 'Profile', icon: UserRound },
} as const;

type TabName = keyof typeof tabs;

function isTabName(name: string): name is TabName {
  return name in tabs;
}

type AppTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

export function AppTabBar({ state, descriptors, emitter, navigateToTab, insets }: AppTabBarProps) {
  const { colors, fontsReady } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.tabBar,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 8,
        paddingBottom: Math.max(insets.bottom, 10),
      }}
    >
      <View className="flex-row">
        {state.routes.map((route, index) => {
          if (!isTabName(route.name)) {
            return null;
          }

          const tab = tabs[route.name];
          const focused = state.index === index;
          const descriptor = descriptors[route.key];
          const Icon = tab.icon;
          const color = focused ? colors.primary : colors.iconMuted;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityLabel={descriptor?.options.tabBarAccessibilityLabel ?? tab.label}
              accessibilityState={{ selected: focused }}
              onPress={() => {
                const event = emitter.emit({
                  type: 'tabPress',
                  target: route.key,
                  data: undefined,
                  canPreventDefault: true,
                });

                if (!focused && !event.defaultPrevented) {
                  navigateToTab(route.key);
                }
              }}
              onLongPress={() => {
                emitter.emit({
                  type: 'tabLongPress',
                  target: route.key,
                  data: undefined,
                });
              }}
              style={{ flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 2 }}
            >
              <View
                style={{
                  minWidth: 44,
                  minHeight: 32,
                  borderRadius: radius.full,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 10,
                  backgroundColor: focused ? `${colors.primary}22` : 'transparent',
                }}
              >
                <Icon color={color} size={22} strokeWidth={focused ? 2.4 : 2} />
              </View>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                style={{
                  color,
                  fontSize: 11,
                  lineHeight: 14,
                  ...(fontsReady ? { fontFamily: fontFamily.medium } : {}),
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
