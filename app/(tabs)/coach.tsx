import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { router } from 'expo-router';
import { Home } from 'lucide-react-native';

import { AppText } from '@/components/common/app-text';
import { Button } from '@/components/common/button';
import { IconButton } from '@/components/common/icon-button';
import { Screen } from '@/components/common/screen';
import { ScreenHeading } from '@/components/common/screen-heading';
import { TextField } from '@/components/common/text-field';
import { useToast } from '@/components/common/toast';
import { queryKeys } from '@/constants/query-keys';
import { useTheme } from '@/hooks/use-theme';
import { coachChat, getCoachHistory, getMotivation } from '@/services/api/coach.api';
import { radius, spacing } from '@/theme/spacing';
import { formatChatDay, formatChatTime } from '@/utils/date';
import { getErrorMessage } from '@/utils/errors';
import { toPlainText } from '@/utils/plain-text';

type ChatMessage = {
  id: string;
  role: 'user' | 'ai';
  text: string;
  createdAt: string;
  dayLabel?: string;
};

const suggestions = ['Help me start today', 'Break my next task down', 'I missed yesterday'];

export default function CoachScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const stickToEnd = useRef(true);

  function scrollChatToEnd(animated = true) {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated });
    });
  }

  const motivationQuery = useQuery({
    queryKey: queryKeys.motivation,
    queryFn: getMotivation,
  });

  const historyQuery = useQuery({
    queryKey: queryKeys.coachHistory,
    queryFn: () => getCoachHistory(),
  });

  useEffect(() => {
    if (!historyQuery.data) return;

    const nextConversationId = historyQuery.data.conversationId ?? undefined;
    setConversationId(nextConversationId);

    let lastDay = '';
    const nextMessages = historyQuery.data.messages.map((item, index) => {
      const dayLabel = formatChatDay(item.createdAt);
      const showDay = dayLabel !== lastDay;
      lastDay = dayLabel;
      return {
        id: `${item.createdAt}-${item.role}-${index}`,
        role: item.role === 'assistant' ? ('ai' as const) : ('user' as const),
        text: item.role === 'assistant' ? toPlainText(item.content) : item.content,
        createdAt: item.createdAt,
        dayLabel: showDay ? dayLabel : undefined,
      };
    });
    setMessages(nextMessages);
    stickToEnd.current = true;
    if (nextMessages.length) {
      scrollChatToEnd(false);
    }
  }, [historyQuery.data]);

  const chatMutation = useMutation({
    mutationFn: coachChat,
    onSuccess: async (data, variables) => {
      setConversationId(data.conversationId);
      setInput('');
      stickToEnd.current = true;
      await queryClient.invalidateQueries({ queryKey: queryKeys.coachHistory });
      scrollChatToEnd(true);
      void variables;
    },
    onError: (error) => {
      setMessages((current) => current.filter((item) => !item.id.startsWith('pending-')));
      showToast(getErrorMessage(error), 'error');
    },
  });

  useEffect(() => {
    if (!stickToEnd.current) return;
    scrollChatToEnd(true);
  }, [messages.length, chatMutation.isPending]);

  const empty = useMemo(() => messages.length === 0 && !historyQuery.isLoading, [messages.length, historyQuery.isLoading]);

  function send(message: string) {
    const trimmed = message.trim();
    if (!trimmed || chatMutation.isPending) {
      return;
    }

    const now = new Date().toISOString();
    stickToEnd.current = true;
    setMessages((current) => {
      const lastDay = current.length ? formatChatDay(current[current.length - 1]!.createdAt) : '';
      const dayLabel = formatChatDay(now);
      return [
        ...current,
        {
          id: `pending-${now}`,
          role: 'user',
          text: trimmed,
          createdAt: now,
          dayLabel: dayLabel !== lastDay ? dayLabel : undefined,
        },
      ];
    });
    chatMutation.mutate({ message: trimmed, conversationId });
    scrollChatToEnd(true);
  }

  return (
    <Screen edges={['top', 'left', 'right']}>
      <View style={{ flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.lg, gap: spacing.md }}>
        <ScreenHeading
          title="AI Coach"
          subtitle="Questions, practice, and a push"
          trailing={<IconButton icon={Home} label="Home" onPress={() => router.replace('/(tabs)')} />}
        />
        {motivationQuery.data ? (
          <AppText variant="caption" tone="muted">
            {motivationQuery.data.message}
          </AppText>
        ) : null}

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 12, paddingBottom: 12, flexGrow: 1 }}
          onContentSizeChange={() => {
            if (stickToEnd.current) scrollChatToEnd(true);
          }}
          onScrollBeginDrag={() => {
            stickToEnd.current = false;
          }}
          onMomentumScrollEnd={(event) => {
            const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
            const distanceFromEnd = contentSize.height - (layoutMeasurement.height + contentOffset.y);
            stickToEnd.current = distanceFromEnd < 80;
          }}
          ListEmptyComponent={
            empty ? (
              <View style={{ gap: 12, paddingVertical: 24 }}>
                <AppText variant="body" tone="muted">
                  Ask about a task, ask for practice, or ask for motivation. Messages go through Achievo — never to a model from this phone.
                </AppText>
                <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                  {suggestions.map((suggestion) => (
                    <Pressable
                      key={suggestion}
                      onPress={() => send(suggestion)}
                      style={{
                        borderRadius: radius.full,
                        borderWidth: 1,
                        borderColor: colors.border,
                        backgroundColor: colors.card,
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                      }}
                    >
                      <AppText variant="caption">{suggestion}</AppText>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : undefined
          }
          renderItem={({ item }) => (
            <View style={{ gap: 8 }}>
              {item.dayLabel ? (
                <AppText variant="caption" tone="muted" style={{ alignSelf: 'center' }}>
                  {item.dayLabel}
                </AppText>
              ) : null}
              <View
                style={{
                  alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '88%',
                  backgroundColor: item.role === 'user' ? colors.primary : colors.card,
                  borderColor: colors.border,
                  borderWidth: item.role === 'user' ? 0 : 1,
                  borderRadius: radius.lg,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  gap: 6,
                }}
              >
                <AppText variant="body" tone={item.role === 'user' ? 'inverse' : 'default'}>
                  {item.text}
                </AppText>
                <AppText
                  variant="caption"
                  tone={item.role === 'user' ? 'inverse' : 'muted'}
                  style={{ alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start', opacity: 0.8 }}
                >
                  {formatChatTime(item.createdAt)}
                </AppText>
              </View>
            </View>
          )}
          ListFooterComponent={
            chatMutation.isPending ? (
              <AppText variant="caption" tone="muted">
                Coach is typing…
              </AppText>
            ) : undefined
          }
        />

        <View style={{ gap: 10, paddingBottom: Math.max(insets.bottom, 8) }}>
          <TextField
            label="Message"
            value={input}
            onChangeText={setInput}
            placeholder="Ask your coach"
            multiline
            style={{ minHeight: 88 }}
          />
          <Button label="Send" loading={chatMutation.isPending} onPress={() => send(input)} />
        </View>
      </View>
    </Screen>
  );
}
