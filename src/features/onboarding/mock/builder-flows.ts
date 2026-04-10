import { copy, cofounderTypeOptions, equityExpectationOptions, skillsetOptions, teamRoleOptions } from './catalogs';
import { sharedCompensationQuestions } from './common-steps';
import type {
  LocalizedOnboardingStepTemplate,
  OnboardingFlowKey,
} from '../types/onboarding.types';

const matchingSection = copy('What you are looking for', 'Apa yang sedang kamu cari');
const finalizeSection = copy('Finish your profile', 'Selesaikan profilmu');
const continueCta = {
  enabled_when: 'valid',
  label: copy('Continue', 'Lanjut'),
} as const;

type BuilderFlowTemplateSet = {
  finish: LocalizedOnboardingStepTemplate;
  matching: LocalizedOnboardingStepTemplate;
};

function createFounderFinishStep(titleEn: string, titleId: string): LocalizedOnboardingStepTemplate {
  return {
    can_go_back: true,
    cta: continueCta,
    id: 'step_compensation_and_profile_finish',
    overall_progress: { current: 9, total: 9 },
    questions: [
      sharedCompensationQuestions.founderSummary,
      {
        id: 'q_contact_email',
        label: copy('Contact email for introductions', 'Email kontak untuk perkenalan'),
        placeholder: copy('you@startup.com', 'you@startup.com'),
        required: true,
        type: 'email',
        validation: { max_length: 120, min_length: 5 },
      },
    ],
    section: finalizeSection,
    section_progress: '1/1',
    subtitle: copy(
      'This will be used to generate your first mock profile.',
      'Ini akan digunakan untuk membuat profil mock pertamamu.'
    ),
    title: copy(titleEn, titleId),
  };
}

export const builderFlowSteps: Record<
  Exclude<OnboardingFlowKey, 'common_data_diri' | 'startup_representative'>,
  BuilderFlowTemplateSet
> = {
  builder_cofounder: {
    finish: {
      can_go_back: true,
      cta: continueCta,
      id: 'step_compensation_and_profile_finish',
      overall_progress: { current: 9, total: 9 },
      questions: [
        sharedCompensationQuestions.minSalaryPreference,
        sharedCompensationQuestions.minSalary,
        {
          id: 'q_profile_summary',
          label: copy('Why would you be a strong early co-founder?', 'Mengapa kamu akan menjadi co-founder awal yang kuat?'),
          placeholder: copy(
            'Share your strengths, values, and what kind of founder you want to work with.',
            'Ceritakan kekuatanmu, nilai yang kamu pegang, dan tipe founder yang ingin kamu ajak bekerja sama.'
          ),
          required: true,
          type: 'textarea',
          validation: { max_length: 500, min_length: 30 },
        },
      ],
      section: finalizeSection,
      section_progress: '1/1',
      subtitle: copy(
        'Set expectations up front so matching feels more serious.',
        'Tetapkan ekspektasi sejak awal agar proses matching terasa lebih serius.'
      ),
      title: copy('Compensation and profile summary', 'Kompensasi dan ringkasan profil'),
    },
    matching: {
      can_go_back: true,
      cta: continueCta,
      id: 'step_matching_preferences',
      overall_progress: { current: 8, total: 9 },
      questions: [
        {
          id: 'q_cofounder_type',
          label: copy('What type of co-founder are you?', 'Kamu tipe co-founder seperti apa?'),
          options: cofounderTypeOptions,
          required: true,
          type: 'single_select_card',
          validation: { min_length: 1 },
        },
        {
          ...sharedCompensationQuestions.cashEquityExpectation,
          options: equityExpectationOptions,
        },
      ],
      section: matchingSection,
      section_progress: '1/1',
      subtitle: copy(
        'Help founders understand how you want to contribute.',
        'Bantu founder memahami bagaimana kamu ingin berkontribusi.'
      ),
      title: copy('Your co-founder profile', 'Profil co-founder kamu'),
    },
  },
  builder_founder_both: {
    finish: createFounderFinishStep('Describe the opportunity clearly', 'Jelaskan peluangnya dengan jelas'),
    matching: {
      can_go_back: true,
      cta: continueCta,
      id: 'step_matching_preferences',
      overall_progress: { current: 8, total: 9 },
      questions: [
        {
          id: 'q_cofounder_type',
          label: copy('What kind of co-founder do you need?', 'Co-founder seperti apa yang kamu butuhkan?'),
          options: cofounderTypeOptions,
          required: true,
          type: 'single_select_card',
          validation: { min_length: 1 },
        },
        {
          id: 'q_roles_needed',
          label: copy('Which team roles do you want to hire first?', 'Peran tim apa yang ingin kamu rekrut lebih dulu?'),
          options: teamRoleOptions,
          required: true,
          type: 'multi_select_card',
          validation: { max_selections: 4, min_selections: 1 },
        },
      ],
      section: matchingSection,
      section_progress: '1/1',
      subtitle: copy(
        'You can select both a co-founder gap and early team priorities.',
        'Kamu bisa memilih kebutuhan co-founder sekaligus prioritas tim awal.'
      ),
      title: copy('Who do you need around you?', 'Siapa yang kamu butuhkan di sekitarmu?'),
    },
  },
  builder_founder_cofounder: {
    finish: createFounderFinishStep('Describe the opportunity clearly', 'Jelaskan peluangnya dengan jelas'),
    matching: {
      can_go_back: true,
      cta: continueCta,
      id: 'step_matching_preferences',
      overall_progress: { current: 8, total: 9 },
      questions: [
        {
          id: 'q_cofounder_type',
          label: copy('What kind of co-founder do you need?', 'Co-founder seperti apa yang kamu butuhkan?'),
          meta: {
            auto_advance: true,
          },
          options: cofounderTypeOptions,
          required: true,
          type: 'single_select_card',
          validation: { min_length: 1 },
        },
      ],
      section: matchingSection,
      section_progress: '1/1',
      subtitle: copy(
        'Pick the founding gap that matters most right now.',
        'Pilih kekosongan peran founder yang paling penting saat ini.'
      ),
      title: copy('Your ideal co-founder', 'Co-founder idealmu'),
    },
  },
  builder_founder_team_members: {
    finish: createFounderFinishStep('Describe the opportunity clearly', 'Jelaskan peluangnya dengan jelas'),
    matching: {
      can_go_back: true,
      cta: continueCta,
      id: 'step_matching_preferences',
      overall_progress: { current: 8, total: 9 },
      questions: [
        {
          id: 'q_roles_needed',
          label: copy('Which roles do you need most?', 'Peran apa yang paling kamu butuhkan?'),
          options: teamRoleOptions,
          required: true,
          type: 'multi_select_card',
          validation: { max_selections: 4, min_selections: 1 },
        },
      ],
      section: matchingSection,
      section_progress: '1/1',
      subtitle: copy(
        'Choose the first roles that would unlock momentum.',
        'Pilih peran pertama yang paling bisa membuka momentum.'
      ),
      title: copy('Your first team priorities', 'Prioritas tim pertamamu'),
    },
  },
  builder_team_member: {
    finish: {
      can_go_back: true,
      cta: continueCta,
      id: 'step_compensation_and_profile_finish',
      overall_progress: { current: 9, total: 9 },
      questions: [
        sharedCompensationQuestions.minSalaryPreference,
        sharedCompensationQuestions.minSalary,
        {
          id: 'q_profile_summary',
          label: copy('What kind of startup environment helps you do your best work?', 'Lingkungan startup seperti apa yang membuatmu bekerja paling baik?'),
          placeholder: copy(
            'Share what you want to build, how you like to work, and what stage fits you.',
            'Ceritakan apa yang ingin kamu bangun, cara kerja yang kamu sukai, dan tahap startup yang cocok untukmu.'
          ),
          required: true,
          type: 'textarea',
          validation: { max_length: 500, min_length: 30 },
        },
      ],
      section: finalizeSection,
      section_progress: '1/1',
      subtitle: copy(
        'These details make your expectations explicit for founders.',
        'Detail ini membuat ekspektasimu lebih jelas bagi founder.'
      ),
      title: copy('Compensation and profile summary', 'Kompensasi dan ringkasan profil'),
    },
    matching: {
      can_go_back: true,
      cta: continueCta,
      id: 'step_matching_preferences',
      overall_progress: { current: 8, total: 9 },
      questions: [
        {
          id: 'q_skillset',
          label: copy('What is your strongest skillset?', 'Skillset terkuatmu apa?'),
          options: skillsetOptions,
          required: true,
          type: 'multi_select_card',
          validation: { max_selections: 3, min_selections: 1 },
        },
        {
          ...sharedCompensationQuestions.cashEquityExpectation,
          options: equityExpectationOptions,
        },
      ],
      section: matchingSection,
      section_progress: '1/1',
      subtitle: copy(
        'Tell startups what you can bring to an early team.',
        'Beritahu startup apa yang bisa kamu bawa ke tim awal mereka.'
      ),
      title: copy('Your team member profile', 'Profil anggota tim kamu'),
    },
  },
};

