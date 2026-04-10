import { AntDesign } from '@expo/vector-icons';
import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';

import { useAuth, getRouteForAuthPhase } from '@features/auth';
import { AppButton, AppText } from '@shared/components';
import { cn } from '@shared/utils/cn';

import { useOnboardingSession } from '../hooks/use-onboarding-session';
import { validateStepAnswers, resolveDeviceOnboardingLocale } from '../services/onboarding-session-service';
import type {
  OnboardingAnswerValue,
  OnboardingMode,
  OnboardingNextStepResponse,
  OnboardingQuestion,
  OnboardingValidationErrorResponse,
} from '../types/onboarding.types';
import { QuestionRenderer } from './question-renderer';

function isCompletedResponse(
  response:
    | OnboardingNextStepResponse
    | OnboardingValidationErrorResponse
    | null
    | undefined
): response is OnboardingNextStepResponse & { completed: true; redirect_to?: string } {
  return Boolean(response && 'completed' in response && response.completed);
}

function getCompletionRoute(mode: OnboardingMode, redirectTo?: string) {
  if (redirectTo === '/login') {
    return '/login' as const;
  }

  if (redirectTo === '/(tabs)') {
    return '/(tabs)' as const;
  }

  return mode === 'preview' ? '/login' as const : '/(tabs)' as const;
}

function ProgressBar({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <AppText tone="muted" variant="label">
          Progress
        </AppText>
        <AppText tone="muted" variant="bodyStrong">
          {current} of {total}
        </AppText>
      </View>
      <View className="flex-row gap-2">
        {Array.from({ length: total }).map((_, index) => (
          <View
            key={index}
            className={cn(
              'h-[6px] flex-1 rounded-full',
              index < current ? 'bg-[#FF9A3E]' : 'bg-surface-muted'
            )}
          />
        ))}
      </View>
    </View>
  );
}

function LoadingState() {
  return (
    <View className="flex-1 items-center justify-center bg-canvas">
      <ActivityIndicator color="#FF9A3E" />
    </View>
  );
}

export function OnboardingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const mode: OnboardingMode = params.mode === 'preview' ? 'preview' : 'post_auth';
  const { authPhase, completeOnboarding, isHydrated, session } = useAuth();
  const locale = React.useMemo(
    () =>
      resolveDeviceOnboardingLocale(
        Intl.DateTimeFormat().resolvedOptions().locale
      ),
    []
  );

  const actorKey = mode === 'preview'
    ? 'preview-entry'
    : session?.user?.id ?? session?.email ?? 'post-auth-entry';
  const onboardingEnabled =
    mode === 'preview' ||
    Boolean(
      session &&
      (authPhase === 'pending_onboarding' || authPhase === 'authenticated')
    );

  const {
    canSubmit,
    currentStep,
    draftAnswers,
    fieldErrors,
    goBack,
    isGoingBack,
    isLoading,
    isSubmitting,
    mergedAnswers,
    statusMessage,
    submitStep,
    updateAnswer,
    visibleQuestions,
  } = useOnboardingSession({
    actorKey,
    enabled: onboardingEnabled,
    locale,
    mode,
  });

  const handleAnswerChange = React.useCallback(
    async (question: OnboardingQuestion, value: OnboardingAnswerValue) => {
      const nextDraftAnswers = {
        ...draftAnswers,
        [question.id]: value,
      };

      updateAnswer(question, value);

      if (!currentStep || !question.meta?.auto_advance || question.type !== 'single_select_card') {
        return;
      }

      const nextValidationErrors = validateStepAnswers(
        currentStep,
        {
          ...mergedAnswers,
          [question.id]: value,
        },
        locale
      );

      if (Object.keys(nextValidationErrors).length > 0) {
        return;
      }

      const response = await submitStep(nextDraftAnswers);

      if (isCompletedResponse(response)) {
        if (mode === 'post_auth') {
          await completeOnboarding();
        }

        router.replace(getCompletionRoute(mode, response.redirect_to));
      }
    },
    [
      completeOnboarding,
      currentStep,
      draftAnswers,
      locale,
      mergedAnswers,
      mode,
      router,
      submitStep,
      updateAnswer,
    ]
  );

  const handleContinue = React.useCallback(async () => {
    const response = await submitStep();

    if (!isCompletedResponse(response)) {
      return;
    }

    if (mode === 'post_auth') {
      await completeOnboarding();
    }

    router.replace(getCompletionRoute(mode, response.redirect_to));
  }, [completeOnboarding, mode, router, submitStep]);

  const handleBackPress = React.useCallback(() => {
    if (currentStep?.can_go_back) {
      void goBack();
      return;
    }

    if (mode === 'preview') {
      router.replace('/login');
    }
  }, [currentStep?.can_go_back, goBack, mode, router]);

  if (!isHydrated) {
    return null;
  }

  if (mode === 'post_auth' && !session) {
    return <Redirect href="/login" />;
  }

  if (
    mode === 'post_auth' &&
    authPhase !== 'pending_onboarding' &&
    authPhase !== 'authenticated'
  ) {
    return <Redirect href={getRouteForAuthPhase(authPhase)} />;
  }

  if (isLoading || !currentStep) {
    return <LoadingState />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-canvas">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 bg-canvas">
        <View className="px-5 pt-16 pb-6">
          <View className="gap-5">
            <View className="flex-row items-center justify-between">
              <Pressable
                className={cn(
                  'h-12 w-12 items-center justify-center rounded-[16px] border border-border bg-surface',
                  !currentStep.can_go_back && mode !== 'preview' && 'opacity-35'
                )}
                disabled={!currentStep.can_go_back && mode !== 'preview'}
                onPress={handleBackPress}>
                <AntDesign color="#FFFFFF" name="arrow-left" size={20} />
              </Pressable>
              <View className="min-w-[72px] items-end">
                <AppText tone="muted" variant="bodyStrong">
                  {currentStep.overall_progress.current} of {currentStep.overall_progress.total}
                </AppText>
              </View>
            </View>
            <ProgressBar
              current={currentStep.overall_progress.current}
              total={currentStep.overall_progress.total}
            />
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-8 px-5 pb-28"
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled">
          <View className="gap-3 pt-2">
            <AppText tone="accent" variant="label">
              {currentStep.section} · {currentStep.section_progress}
            </AppText>
            <AppText variant="hero" className="text-[34px] leading-[40px]">
              {currentStep.title}
            </AppText>
            {currentStep.subtitle ? (
              <AppText tone="muted" className="text-lg">
                {currentStep.subtitle}
              </AppText>
            ) : null}
          </View>

          <View className="gap-6">
            {visibleQuestions.map((question) => (
              <QuestionRenderer
                key={question.id}
                error={fieldErrors[question.id]}
                onChange={(value) => {
                  void handleAnswerChange(question, value);
                }}
                question={question}
                value={mergedAnswers[question.id]}
              />
            ))}
          </View>

          {statusMessage ? (
            <AppText selectable tone="danger">
              {statusMessage}
            </AppText>
          ) : null}
        </ScrollView>

        <View className="border-t border-border bg-canvas px-5 pt-4 pb-8">
          <AppButton
            disabled={!canSubmit || isSubmitting || isGoingBack}
            label={isSubmitting ? 'Saving...' : currentStep.cta.label}
            onPress={() => {
              void handleContinue();
            }}
            size="lg"
            className="w-full bg-[#0066FF] border-none"
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
