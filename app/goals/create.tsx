import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
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

const schema = z.object({
  naturalLanguage: z.string().optional(),
  title: z.string().trim().min(1, 'Title is required').max(200),
  category: z.string().min(1),
  currentLevel: z.string().trim().min(1, 'Current level is required').max(200),
  desiredOutcome: z.string().trim().min(1, 'Target is required').max(2000),
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

    setValue('title', cleaned.slice(0, 200), { shouldValidate: true });
    const days = cleaned.match(/(\d+)\s*days?/i);
    if (days?.[1]) {
      setValue('durationDays', days[1], { shouldValidate: true });
    }
    const hours = cleaned.match(/(\d+(?:\.\d+)?)\s*hours?/i);
    if (hours?.[1]) {
      setValue('availableMinutesPerDay', Math.round(Number(hours[1]) * 60), { shouldValidate: true });
    }
    const beginner = /beginner/i.test(cleaned);
    const advanced = /advanced/i.test(cleaned);
    if (beginner) {
      setValue('currentLevel', 'Beginner', { shouldValidate: true });
    }
    if (advanced) {
      setValue('desiredOutcome', 'Reach an advanced level', { shouldValidate: true });
    } else if (!watch('desiredOutcome')) {
      setValue('desiredOutcome', cleaned, { shouldValidate: true });
    }
  }

  async function onSubmit(values: FormValues) {
    setAnalyzing(true);
    try {
      const description = [values.naturalLanguage?.trim(), values.learningPreference?.trim()]
        .filter(Boolean)
        .join('\n\n');
      const result = await analyzeGoal({
        title: values.title,
        description: description || undefined,
        category: values.category,
        currentLevel: values.currentLevel,
        desiredOutcome: values.desiredOutcome,
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
      description="Describe the goal in a sentence, or fill the fields. Nothing is scheduled until you approve a roadmap."
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
          <TextField label="Goal title" value={value} onBlur={onBlur} onChangeText={onChange} error={errors.title?.message} />
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
