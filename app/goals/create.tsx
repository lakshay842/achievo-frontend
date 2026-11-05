import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

import { AppText } from '@/components/common/app-text';
import { Button } from '@/components/common/button';
import { ChoiceChip } from '@/components/common/choice-chip';
import { FlowScreen } from '@/components/common/flow-screen';
import { TextField } from '@/components/common/text-field';
import { useToast } from '@/components/common/toast';
import { DAILY_TIME_OPTIONS, GOAL_CATEGORIES } from '@/constants/goals';
import { analyzeGoal } from '@/services/api/ai.api';
import { useGoalStore } from '@/store/goal.store';
import { useOnboardingStore } from '@/store/onboarding.store';
import { getErrorMessage } from '@/utils/errors';

const FILLER_PREFIX =
  /^(i\s+want\s+to|i'd\s+like\s+to|i\s+would\s+like\s+to|i\s+need\s+to|i\s+hope\s+to|help\s+me\s+to|help\s+me|my\s+goal\s+is\s+to|my\s+goal\s+is)\s+/i;

const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'to',
  'in',
  'on',
  'for',
  'of',
  'and',
  'or',
  'with',
  'from',
  'my',
  'me',
  'i',
  'can',
  'will',
  'would',
  'that',
  'this',
  'it',
  'as',
  'at',
  'by',
  'is',
  'be',
  'am',
  'are',
  'daily',
  'study',
  'studying',
  'hours',
  'hour',
  'days',
  'day',
  'minutes',
  'minute',
]);

/** Short goal title from free text — max 5 words, never the full sentence. */
function deriveShortTitle(text: string): string {
  const firstSentence = text.trim().split(/[.!?\n]/)[0]?.trim() ?? '';
  if (firstSentence.length < 8) {
    return '';
  }

  const withoutPrefix = firstSentence.replace(FILLER_PREFIX, '').trim() || firstSentence;
  const tokens = withoutPrefix
    .split(/[^a-zA-Z0-9+#]+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => !STOP_WORDS.has(token.toLowerCase()) && !/^\d+$/.test(token) && token.length > 1);

  const words = (tokens.length > 0 ? tokens : withoutPrefix.split(/\s+/).filter((w) => w.length > 1)).slice(0, 5);
  if (words.length === 0) {
    return '';
  }

  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .slice(0, 80);
}

const schema = z.object({
  naturalLanguage: z.string().optional(),
  title: z.string().trim().min(1, 'Title is required').max(200),
  category: z.string().min(1),
  currentLevel: z.string().trim().min(1, 'Current level is required').max(200),
  desiredOutcome: z.string().trim().max(2000).optional(),
  availableMinutesPerDay: z.number().int().min(15).max(480),
  durationDays: z
    .string()
    .trim()
    .regex(/^\d+$/, 'Enter a whole number of days')
    .refine((value) => {
      const days = Number(value);
      return days >= 1 && days <= 180;
    }, 'Use 1 to 180 days'),
  learningPreference: z.string().trim().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CreateGoalScreen() {
  const { showToast } = useToast();
  const setDraft = useGoalStore((state) => state.setDraft);
  const dailyMinutes = useOnboardingStore((state) => state.dailyMinutes);
  const interests = useOnboardingStore((state) => state.interests);
  const [analyzing, setAnalyzing] = useState(false);
  const titleEditedByUser = useRef(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      naturalLanguage: '',
      title: '',
      category: interests[0] ?? 'personal',
      currentLevel: 'Beginner',
      desiredOutcome: '',
      availableMinutesPerDay: dailyMinutes,
      durationDays: '30',
      learningPreference: '',
    },
  });

  const category = watch('category');
  const minutes = watch('availableMinutesPerDay');

  function applyNaturalLanguage(text: string) {
    const cleaned = text.trim();
    if (!cleaned) {
      return;
    }

    if (!titleEditedByUser.current) {
      const shortTitle = deriveShortTitle(cleaned);
      if (shortTitle) {
        setValue('title', shortTitle, { shouldValidate: true });
      }
    }

    const days = cleaned.match(/(\d+)\s*days?/i);
    if (days?.[1]) {
      setValue('durationDays', days[1], { shouldValidate: true });
    }
    const hours = cleaned.match(/(\d+(?:\.\d+)?)\s*hours?/i);
    if (hours?.[1]) {
      setValue('availableMinutesPerDay', Math.round(Number(hours[1]) * 60), { shouldValidate: true });
    }
    if (/beginner/i.test(cleaned)) {
      setValue('currentLevel', 'Beginner', { shouldValidate: true });
    }
  }

  async function onSubmit(values: FormValues) {
    setAnalyzing(true);
    try {
      const description = [values.naturalLanguage?.trim(), values.learningPreference?.trim()]
        .filter(Boolean)
        .join('\n\n');
      const nl = values.naturalLanguage?.trim() ?? '';
      const desiredOutcome =
        values.desiredOutcome?.trim() ||
        (/advanced/i.test(nl) ? 'Reach an advanced level' : '') ||
        deriveShortTitle(nl) ||
        values.title;
      const result = await analyzeGoal({
        title: values.title,
        description: description || undefined,
        category: values.category,
        currentLevel: values.currentLevel,
        desiredOutcome,
        availableMinutesPerDay: values.availableMinutesPerDay,
        durationDays: Number(values.durationDays),
      });
      setDraft(result);
      showToast(
        result.assessment.status === 'ready' ? 'Goal is ready for a roadmap' : 'A few questions next',
        'success',
      );
      router.push({
        pathname: '/goals/clarification',
        params: { goalId: result.goal.id },
      });
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <FlowScreen
      showNav edges={['top', 'bottom', 'left', 'right']}
      description="Describe what you want to learn or change. Achievo builds daily tasks from it, so you do not have to hunt across platforms."
      footer={
        <Button label="Continue with AI" loading={analyzing} onPress={() => void handleSubmit(onSubmit)()} />
      }
    >
      <Controller
        control={control}
        name="naturalLanguage"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Natural language"
            placeholder='I want to learn Java from beginner to advanced in 38 days. I can study 2 hours daily.'
            multiline
            value={value}
            onBlur={onBlur}
            onChangeText={(text) => {
              onChange(text);
              applyNaturalLanguage(text);
            }}
          />
        )}
      />

      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Goal title"
            placeholder="Auto from your description, or type your own"
            value={value}
            onBlur={onBlur}
            onChangeText={(text) => {
              titleEditedByUser.current = true;
              onChange(text);
            }}
            error={errors.title?.message}
          />
        )}
      />

      <View style={{ gap: 8 }}>
        <AppText variant="label">Category</AppText>
        <View className="flex-row flex-wrap" style={{ gap: 8 }}>
          {GOAL_CATEGORIES.map((option) => (
            <ChoiceChip
              key={option.value}
              label={option.label}
              selected={category === option.value}
              onPress={() => setValue('category', option.value, { shouldValidate: true })}
            />
          ))}
        </View>
      </View>

      <Controller
        control={control}
        name="currentLevel"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Current level"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.currentLevel?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="desiredOutcome"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Target level / outcome"
            placeholder="Optional — e.g. Reach an advanced level"
            multiline
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.desiredOutcome?.message}
          />
        )}
      />

      <View style={{ gap: 8 }}>
        <AppText variant="label">Daily available time</AppText>
        <View className="flex-row flex-wrap" style={{ gap: 8 }}>
          {DAILY_TIME_OPTIONS.map((option) => (
            <ChoiceChip
              key={option.value}
              label={option.label}
              selected={minutes === option.value}
              onPress={() => setValue('availableMinutesPerDay', option.value, { shouldValidate: true })}
            />
          ))}
        </View>
      </View>

      <Controller
        control={control}
        name="durationDays"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Duration (days)"
            keyboardType="number-pad"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.durationDays?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="learningPreference"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Learning preference"
            placeholder="Projects, reading, practice problems…"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
          />
        )}
      />
    </FlowScreen>
  );
}
