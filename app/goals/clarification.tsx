import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/common/app-text';
import { Button } from '@/components/common/button';
import { Card } from '@/components/common/card';
import { FlowScreen } from '@/components/common/flow-screen';
import { InlineNotice } from '@/components/common/inline-notice';
import { TextField } from '@/components/common/text-field';
import { useToast } from '@/components/common/toast';
import { LoadingBlock } from '@/components/common/loading-block';
import { clarifyGoal, generateRoadmap } from '@/services/api/ai.api';
import { getAssessment, getGoal } from '@/services/api/goals.api';
import { useGoalStore } from '@/store/goal.store';
import { getErrorMessage } from '@/utils/errors';
import { readParam } from '@/utils/params';

export default function ClarificationScreen() {
  const params = useLocalSearchParams<{ goalId?: string | string[] }>();
  const goalId = readParam(params.goalId);
  const assessment = useGoalStore((state) => state.assessment);
  const draftGoal = useGoalStore((state) => state.draftGoal);
  const setDraft = useGoalStore((state) => state.setDraft);
  const setDraftRoadmap = useGoalStore((state) => state.setDraftRoadmap);
  const { showToast } = useToast();
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);

  const remoteGoal = useQuery({
    queryKey: ['goal', goalId, 'clarification'],
    queryFn: () => getGoal(goalId!),
    enabled: Boolean(goalId) && !draftGoal,
  });
  const remoteAssessment = useQuery({
    queryKey: ['assessment', goalId],
    queryFn: () => getAssessment(goalId!),
    enabled: Boolean(goalId) && !assessment,
  });

  useEffect(() => {
    if (remoteGoal.data && remoteAssessment.data) {
      setDraft({ goal: remoteGoal.data, assessment: remoteAssessment.data });
    }
  }, [remoteAssessment.data, remoteGoal.data, setDraft]);

  const unanswered = useMemo(
    () => assessment?.clarificationQuestions.filter((item) => !item.answer?.trim()) ?? [],
    [assessment],
  );
  const current = unanswered[0];

  useEffect(() => {
    setAnswer('');
  }, [current?.id, current?.question]);

  async function continueFlow() {
    if (!goalId || !assessment || !draftGoal) {
      showToast('Start by creating a goal first', 'error');
      router.replace('/goals/create');
      return;
    }

    setBusy(true);
    try {
      let nextAssessment = assessment;
      let nextGoal = draftGoal;

      const stillNeedsAnswers =
        assessment.status === 'needs_clarification' &&
        assessment.clarificationQuestions.some((item) => !item.answer?.trim());

      if (stillNeedsAnswers) {
        if (!current || !answer.trim()) {
          showToast('Answer the question to continue', 'error');
          return;
        }

        // Send every known answer so earlier replies are never dropped.
        const answers = assessment.clarificationQuestions
          .map((item) => {
            if (item.id === current.id || item.question === current.question) {
              return {
                questionId: item.id,
                question: item.question,
                answer: answer.trim(),
              };
            }
            return {
              questionId: item.id,
              question: item.question,
              answer: item.answer?.trim() || '',
            };
          })
          .filter((item) => item.answer);

        const result = await clarifyGoal({ goalId, answers });
        nextAssessment = result.assessment;
        nextGoal = result.goal;
        setDraft(result);
        setAnswer('');

        const remaining = result.assessment.clarificationQuestions.filter((item) => !item.answer?.trim()).length;
        if (remaining > 0) {
          showToast('Thanks — next question', 'success');
          return;
        }
      }

      showToast('Building your roadmap…', 'info');
      const roadmap = await generateRoadmap(nextGoal.id);
      setDraftRoadmap(roadmap);
      showToast('Roadmap ready for review', 'success');
      router.push({
        pathname: '/goals/roadmap-preview',
        params: { goalId: nextGoal.id, roadmapId: roadmap.id },
      });
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  if ((!assessment || !draftGoal) && (remoteGoal.isLoading || remoteAssessment.isLoading)) {
    return (
      <FlowScreen showNav edges={['top', 'bottom', 'left', 'right']}>
        <LoadingBlock rows={4} />
      </FlowScreen>
    );
  }

  if (!assessment || !draftGoal) {
    return (
      <FlowScreen
        showNav edges={['top', 'bottom', 'left', 'right']}
        description="Open a goal from Create Goal so Achievo can ask clarifying questions."
        footer={<Button label="Create a goal" onPress={() => router.replace('/goals/create')} />}
      >
        <InlineNotice title="No draft found" message="Analyze a goal first." tone="warning" />
      </FlowScreen>
    );
  }

  return (
    <FlowScreen
      showNav edges={['top', 'bottom', 'left', 'right']}
      description="Answer a few questions so the plan matches your level, time, and the way you like to learn."
      footer={
        <Button
          label={assessment.status === 'ready' || !current ? 'Generate roadmap' : 'Send answer'}
          loading={busy}
          onPress={() => void continueFlow()}
        />
      }
    >
      <Card>
        <AppText variant="kicker" tone="primary">
          {draftGoal.title}
        </AppText>
        <AppText variant="body" tone="muted">
          {assessment.summary || 'Clarifying your goal with Achievo.'}
        </AppText>
      </Card>

      {assessment.status === 'ready' ? (
        <InlineNotice
          title="Ready for a roadmap"
          message="Your answers are enough. Generate a draft next — it stays inactive until you approve it."
          tone="success"
        />
      ) : current ? (
        <Card>
          <AppText variant="label">Achievo</AppText>
          <AppText variant="heading">{current.question}</AppText>
          <TextField
            label="Your answer"
            multiline
            value={answer}
            onChangeText={setAnswer}
            placeholder="Type your reply"
          />
          <View>
            <AppText variant="caption" tone="muted">
              {unanswered.length} question{unanswered.length === 1 ? '' : 's'} left in this round
            </AppText>
          </View>
        </Card>
      ) : (
        <InlineNotice
          title="Ready for a roadmap"
          message="All questions are answered. Tap Generate roadmap to continue."
          tone="success"
        />
      )}
    </FlowScreen>
  );
}
