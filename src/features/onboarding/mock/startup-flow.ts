import { copy, equityExpectationOptions, industryOptions, startupLookingForOptions } from './catalogs';
import type { LocalizedOnboardingStepTemplate } from '../types/onboarding.types';

const continueCta = {
  enabled_when: 'valid',
  label: copy('Continue', 'Lanjut'),
} as const;

export const startupMatchingStep = {
  can_go_back: true,
  cta: continueCta,
  id: 'step_matching_preferences',
  overall_progress: { current: 8, total: 9 },
  questions: [
    {
      id: 'q_looking_for',
      label: copy('What are you looking for?', 'Apa yang sedang kamu cari?'),
      options: startupLookingForOptions,
      required: true,
      type: 'multi_select_card',
      validation: { max_selections: 3, min_selections: 1 },
    },
    {
      id: 'q_startup_industry',
      label: copy('What industry is your startup in?', 'Startupmu bergerak di industri apa?'),
      options: industryOptions,
      required: true,
      type: 'multi_select_chip',
      validation: { max_selections: 3, min_selections: 1 },
    },
  ],
  section: copy('What you are looking for', 'Apa yang sedang kamu cari'),
  section_progress: '1/1',
  subtitle: copy(
    'Clarify the type of people and support your startup needs.',
    'Perjelas tipe orang dan dukungan yang dibutuhkan startupmu.'
  ),
  title: copy('Hiring goals', 'Tujuan perekrutan'),
} satisfies LocalizedOnboardingStepTemplate;

export const startupFinishStep = {
  can_go_back: true,
  cta: continueCta,
  id: 'step_compensation_and_profile_finish',
  overall_progress: { current: 9, total: 9 },
  questions: [
    {
      id: 'q_cash_equity_offered',
      label: copy('How do you plan to structure cash and equity?', 'Bagaimana rencanamu menyusun cash dan equity?'),
      options: equityExpectationOptions,
      required: true,
      type: 'segmented',
      validation: { min_length: 1 },
    },
    {
      id: 'q_min_salary_offered',
      label: copy('Minimum salary offered', 'Minimum gaji yang ditawarkan'),
      meta: {
        amount_label: 'Amount',
        amount_placeholder: '8000',
        currency_label: 'Currency',
      },
      options: [
        {
          group: null,
          icon: null,
          id: 'opt_currency_idr',
          label: copy('IDR', 'IDR'),
          sub_label: null,
          value: 'IDR',
        },
        {
          group: null,
          icon: null,
          id: 'opt_currency_usd',
          label: copy('USD', 'USD'),
          sub_label: null,
          value: 'USD',
        },
        {
          group: null,
          icon: null,
          id: 'opt_currency_sgd',
          label: copy('SGD', 'SGD'),
          sub_label: null,
          value: 'SGD',
        },
      ],
      required: true,
      type: 'currency_amount',
    },
    {
      id: 'q_startup_description',
      label: copy('Describe your startup in a few sentences.', 'Jelaskan startupmu dalam beberapa kalimat.'),
      placeholder: copy(
        'Share the mission, traction, and what makes your team exciting.',
        'Ceritakan misi, traction, dan apa yang membuat timmu menarik.'
      ),
      required: true,
      type: 'textarea',
      validation: { max_length: 500, min_length: 30 },
    },
  ],
  section: copy('Finish your profile', 'Selesaikan profilmu'),
  section_progress: '1/1',
  subtitle: copy(
    'Give candidates enough context to decide if they want to engage.',
    'Berikan kandidat konteks yang cukup untuk memutuskan apakah mereka ingin terhubung.'
  ),
  title: copy('Offer details and startup profile', 'Detail penawaran dan profil startup'),
} satisfies LocalizedOnboardingStepTemplate;

