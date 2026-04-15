import { builderFlowSteps } from './builder-flows';
import {
  availabilityStep,
  builderIdentityDetailsStep,
  dataDiriStep,
  experienceStep,
  founderGoalStep,
  industriesInterestStep,
  locationPreferencesStep,
  primaryRoleStep,
  startupIdentityDetailsStep,
  useConnectxStep,
  welcomeStep,
} from './common-steps';
import { startupFinishStep, startupMatchingStep } from './startup-flow';
import type {
  LocalizedOnboardingOption,
  LocalizedOnboardingQuestion,
  LocalizedOnboardingStepTemplate,
  LocalizedText,
  OnboardingAnswerValue,
  OnboardingAnswers,
  OnboardingFlowKey,
  OnboardingLocale,
  OnboardingQuestion,
  OnboardingStep,
  OnboardingStepId,
} from '../types/onboarding.types';

export const ONBOARDING_STEP_ORDER: OnboardingStepId[] = [
  'step_welcome',
  'step_data_diri',
  'step_use_connectx',
  'step_identity_details',
  'step_founder_goal',
  'step_location_preferences',
  'step_experience',
  'step_industries_interest',
  'step_availability',
  'step_primary_role',
  'step_matching_preferences',
  'step_compensation_and_profile_finish',
];

export function getEffectiveStepOrder(answers: OnboardingAnswers): OnboardingStepId[] {
  const isFounderPath =
    answers.q_use_connectx === 'builder' && answers.q_builder_type === 'founder';

  return ONBOARDING_STEP_ORDER.filter((stepId) => {
    if (stepId === 'step_founder_goal') {
      return isFounderPath;
    }
    return true;
  });
}

function localizeText(value: LocalizedText | null | undefined, locale: OnboardingLocale) {
  if (!value) {
    return null;
  }

  return value[locale];
}

function localizeOption(option: LocalizedOnboardingOption, locale: OnboardingLocale) {
  return {
    group: localizeText(option.group ?? null, locale),
    icon: option.icon ?? null,
    id: option.id,
    label: option.label[locale],
    sub_label: localizeText(option.sub_label ?? null, locale),
    value: option.value,
  };
}

function localizeQuestion(
  question: LocalizedOnboardingQuestion,
  locale: OnboardingLocale
): OnboardingQuestion {
  return {
    depends_on: question.depends_on,
    helper_text: localizeText(question.helper_text ?? null, locale),
    id: question.id,
    label: question.label[locale],
    meta: question.meta,
    options: question.options?.map((option) => localizeOption(option, locale)),
    placeholder: localizeText(question.placeholder ?? null, locale),
    required: question.required,
    sub_label: localizeText(question.sub_label ?? null, locale),
    type: question.type,
    validation: question.validation,
  };
}

export function resolveFlowKey(answers: OnboardingAnswers): OnboardingFlowKey | null {
  const useConnectx = answers.q_use_connectx;

  if (useConnectx === 'startup') {
    return 'startup_representative';
  }

  const builderType = answers.q_builder_type;

  if (builderType === 'cofounder') {
    return 'builder_cofounder';
  }

  if (builderType === 'team_member') {
    return 'builder_team_member';
  }

  if (builderType !== 'founder') {
    return null;
  }

  const founderGoal = answers.q_founder_goal;

  if (founderGoal === 'cofounder') {
    return 'builder_founder_cofounder';
  }

  if (founderGoal === 'team_members') {
    return 'builder_founder_team_members';
  }

  if (founderGoal === 'both') {
    return 'builder_founder_both';
  }

  return null;
}

function getMatchingStep(flowKey: OnboardingFlowKey | null): LocalizedOnboardingStepTemplate {
  if (flowKey === 'startup_representative') {
    return startupMatchingStep;
  }

  if (
    flowKey &&
    flowKey !== 'common_data_diri' &&
    flowKey in builderFlowSteps
  ) {
    return builderFlowSteps[flowKey].matching;
  }

  return builderFlowSteps.builder_founder_cofounder.matching;
}

function getFinishStep(flowKey: OnboardingFlowKey | null): LocalizedOnboardingStepTemplate {
  if (flowKey === 'startup_representative') {
    return startupFinishStep;
  }

  if (
    flowKey &&
    flowKey !== 'common_data_diri' &&
    flowKey in builderFlowSteps
  ) {
    return builderFlowSteps[flowKey].finish;
  }

  return builderFlowSteps.builder_founder_cofounder.finish;
}

export function getStepTemplate(
  stepId: OnboardingStepId,
  answers: OnboardingAnswers
): LocalizedOnboardingStepTemplate {
  switch (stepId) {
    case 'step_welcome':
      return welcomeStep;
    case 'step_data_diri':
      return dataDiriStep;
    case 'step_use_connectx':
      return useConnectxStep;
    case 'step_identity_details':
      return answers.q_use_connectx === 'startup'
        ? startupIdentityDetailsStep
        : builderIdentityDetailsStep;
    case 'step_founder_goal':
      return founderGoalStep;
    case 'step_location_preferences':
      return locationPreferencesStep;
    case 'step_experience':
      return experienceStep;
    case 'step_industries_interest':
      return industriesInterestStep;
    case 'step_availability':
      return availabilityStep;
    case 'step_primary_role':
      return primaryRoleStep;
    case 'step_matching_preferences':
      return getMatchingStep(resolveFlowKey(answers));
    case 'step_compensation_and_profile_finish':
      return getFinishStep(resolveFlowKey(answers));
    default:
      return welcomeStep;
  }
}

export function materializeStep(
  stepId: OnboardingStepId,
  answers: OnboardingAnswers,
  locale: OnboardingLocale
): OnboardingStep {
  const template = getStepTemplate(stepId, answers);
  const flowKey = resolveFlowKey(answers) ?? 'common_data_diri';
  const effectiveOrder = getEffectiveStepOrder(answers);
  const effectiveIndex = effectiveOrder.indexOf(stepId);
  const total = effectiveOrder.length;
  const current = effectiveIndex >= 0 ? effectiveIndex + 1 : template.overall_progress.current;

  return {
    can_go_back: template.can_go_back,
    cta: {
      enabled_when: template.cta.enabled_when,
      label: template.cta.label[locale],
    },
    flow_key: flowKey,
    id: template.id,
    overall_progress: { current, total },
    questions: template.questions.map((question) => localizeQuestion(question, locale)),
    section: template.section[locale],
    section_progress: template.section_progress,
    subtitle: localizeText(template.subtitle ?? null, locale),
    title: template.title[locale],
  };
}

export function getStepIndex(stepId: OnboardingStepId, answers: OnboardingAnswers) {
  return getEffectiveStepOrder(answers).indexOf(stepId);
}

export function getNextStepId(stepId: OnboardingStepId, answers: OnboardingAnswers) {
  const order = getEffectiveStepOrder(answers);
  const currentIndex = order.indexOf(stepId);

  if (currentIndex < 0 || currentIndex >= order.length - 1) {
    return null;
  }

  return order[currentIndex + 1];
}

export function getPreviousStepId(stepId: OnboardingStepId, answers: OnboardingAnswers) {
  const order = getEffectiveStepOrder(answers);
  const currentIndex = order.indexOf(stepId);

  if (currentIndex <= 0) {
    return null;
  }

  return order[currentIndex - 1];
}

function asArray(value: OnboardingAnswerValue | undefined) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string' && value.length > 0) {
    return [value];
  }

  return [];
}

export function evaluateCondition(
  questionValue: OnboardingAnswerValue | undefined,
  operator: string,
  expectedValue?: OnboardingAnswerValue
) {
  switch (operator) {
    case 'equals':
      return questionValue === expectedValue;
    case 'not_equals':
      return questionValue !== expectedValue;
    case 'in':
      return Array.isArray(expectedValue) ? expectedValue.includes(questionValue as never) : false;
    case 'not_in':
      return Array.isArray(expectedValue) ? !expectedValue.includes(questionValue as never) : true;
    case 'contains':
      return asArray(questionValue).includes(expectedValue as string);
    case 'exists':
      return questionValue !== null && questionValue !== undefined && questionValue !== '';
    default:
      return false;
  }
}

export function getVisibleQuestions(step: OnboardingStep, answers: OnboardingAnswers) {
  return step.questions.filter((question) => {
    if (!question.depends_on) {
      return true;
    }

    return evaluateCondition(
      answers[question.depends_on.question_id],
      question.depends_on.operator,
      question.depends_on.value
    );
  });
}

