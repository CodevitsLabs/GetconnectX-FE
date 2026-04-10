import {
  availabilityOptions,
  builderTypeOptions,
  cityOptions,
  copy,
  currencyOptions,
  founderGoalOptions,
  genderOptions,
  industryOptions,
  locationBasedOptions,
  primaryRoleOptions,
  relocateOptions,
  remotePreferenceOptions,
  salaryPreferenceOptions,
  startupExperienceOptions,
  startupStageOptions,
  useConnectxOptions,
  yesNoOptions,
} from './catalogs';
import type {
  LocalizedOnboardingQuestion,
  LocalizedOnboardingStepTemplate,
} from '../types/onboarding.types';

const continueCta = {
  enabled_when: 'valid',
  label: copy('Continue', 'Lanjut'),
} as const;

function question<TQuestion extends LocalizedOnboardingQuestion>(value: TQuestion) {
  return value;
}

export const personalNameStep = {
  can_go_back: false,
  cta: continueCta,
  id: 'step_personal_name',
  overall_progress: { current: 1, total: 9 },
  questions: [
    question({
      id: 'q_first_name',
      label: copy('First Name', 'Nama Depan'),
      placeholder: copy('Your first name', 'Nama depan kamu'),
      required: true,
      type: 'text',
      validation: { max_length: 50, min_length: 1 },
    }),
    question({
      helper_text: copy(
        'Last name is optional and shared only after a connection.',
        'Nama belakang opsional dan hanya dibagikan setelah terkoneksi.'
      ),
      id: 'q_last_name',
      label: copy('Last Name', 'Nama Belakang'),
      placeholder: copy('Your last name', 'Nama belakang kamu'),
      required: false,
      type: 'text',
      validation: { max_length: 50 },
    }),
  ],
  section: copy("Let's build your general profile", 'Mari bangun profil umum kamu'),
  section_progress: '1/3',
  subtitle: copy(
    'Start with the basics so we can personalize your journey.',
    'Mulai dari data dasar agar perjalananmu bisa dipersonalisasi.'
  ),
  title: copy("What's your name?", 'Siapa namamu?'),
} satisfies LocalizedOnboardingStepTemplate;

export const useConnectxStep = {
  can_go_back: true,
  cta: continueCta,
  id: 'step_use_connectx',
  overall_progress: { current: 2, total: 9 },
  questions: [
    question({
      helper_text: copy(
        'This choice shapes the rest of your onboarding.',
        'Pilihan ini menentukan sisa alur onboardingmu.'
      ),
      id: 'q_use_connectx',
      label: copy('How do you want to use ConnectX?', 'Bagaimana kamu ingin menggunakan ConnectX?'),
      meta: {
        auto_advance: true,
        layout: 'list',
      },
      options: useConnectxOptions,
      required: true,
      sub_label: copy('Pick the path that best matches today.', 'Pilih jalur yang paling sesuai saat ini.'),
      type: 'single_select_card',
      validation: { min_length: 1 },
    }),
  ],
  section: copy("Let's build your general profile", 'Mari bangun profil umum kamu'),
  section_progress: '2/3',
  subtitle: copy(
    'This shapes your entire experience.',
    'Ini akan membentuk seluruh pengalamanmu.'
  ),
  title: copy('How do you want to use ConnectX?', 'Bagaimana kamu ingin menggunakan ConnectX?'),
} satisfies LocalizedOnboardingStepTemplate;

export const builderIdentityDetailsStep = {
  can_go_back: true,
  cta: continueCta,
  id: 'step_identity_details',
  overall_progress: { current: 3, total: 9 },
  questions: [
    question({
      id: 'q_builder_type',
      label: copy('Which builder path fits you best?', 'Jalur builder mana yang paling cocok untukmu?'),
      meta: {
        layout: 'list',
      },
      options: builderTypeOptions,
      required: true,
      type: 'single_select_card',
      validation: { min_length: 1 },
    }),
    question({
      depends_on: {
        operator: 'equals',
        question_id: 'q_builder_type',
        value: 'founder',
      },
      helper_text: copy(
        'Pick the most urgent hiring need for your company.',
        'Pilih kebutuhan rekrutmen yang paling mendesak untuk startupmu.'
      ),
      id: 'q_founder_goal',
      label: copy('What are you looking for right now?', 'Saat ini kamu sedang mencari apa?'),
      meta: {
        auto_advance: true,
        layout: 'list',
      },
      options: founderGoalOptions,
      required: true,
      type: 'single_select_card',
      validation: { min_length: 1 },
    }),
  ],
  section: copy("Let's build your general profile", 'Mari bangun profil umum kamu'),
  section_progress: '3/3',
  subtitle: copy(
    'We will tailor the rest of the questions to your path.',
    'Kami akan menyesuaikan pertanyaan selanjutnya dengan jalurmu.'
  ),
  title: copy('Tell us your role in the ecosystem', 'Ceritakan peranmu di ekosistem startup'),
} satisfies LocalizedOnboardingStepTemplate;

export const startupIdentityDetailsStep = {
  can_go_back: true,
  cta: continueCta,
  id: 'step_identity_details',
  overall_progress: { current: 3, total: 9 },
  questions: [
    question({
      id: 'q_startup_name',
      label: copy("What's your startup called?", 'Apa nama startupmu?'),
      placeholder: copy('Startup name', 'Nama startup'),
      required: true,
      type: 'text',
      validation: { max_length: 80, min_length: 2 },
    }),
    question({
      id: 'q_startup_stage',
      label: copy('What stage is your startup in?', 'Startupmu sedang ada di tahap apa?'),
      options: startupStageOptions,
      placeholder: copy('Select a stage', 'Pilih tahap'),
      required: true,
      type: 'dropdown',
      validation: { min_length: 1 },
    }),
    question({
      id: 'q_startup_contact_email',
      label: copy('Which email should candidates use to reach you?', 'Email mana yang sebaiknya digunakan kandidat untuk menghubungimu?'),
      placeholder: copy('founder@startup.com', 'founder@startup.com'),
      required: true,
      type: 'email',
      validation: { max_length: 120, min_length: 5 },
    }),
  ],
  section: copy("Let's build your general profile", 'Mari bangun profil umum kamu'),
  section_progress: '3/3',
  subtitle: copy(
    'These details help us represent your company clearly.',
    'Detail ini membantu kami merepresentasikan perusahaanmu dengan jelas.'
  ),
  title: copy('Tell us about your startup', 'Ceritakan tentang startupmu'),
} satisfies LocalizedOnboardingStepTemplate;

export const personalBasicsStep = {
  can_go_back: true,
  cta: continueCta,
  id: 'step_personal_basics',
  overall_progress: { current: 4, total: 9 },
  questions: [
    question({
      id: 'q_date_of_birth',
      label: copy("When's your date of birth?", 'Kapan tanggal lahirmu?'),
      placeholder: copy('YYYY-MM-DD', 'YYYY-MM-DD'),
      required: true,
      type: 'date',
      validation: { min_length: 10 },
    }),
    question({
      id: 'q_gender',
      label: copy('Gender', 'Gender'),
      options: genderOptions,
      required: true,
      type: 'segmented',
      validation: { min_length: 1 },
    }),
    question({
      helper_text: copy(
        'Use the number you want to share with future matches.',
        'Gunakan nomor yang ingin kamu bagikan ke match di masa depan.'
      ),
      id: 'q_contact_phone',
      label: copy('Best phone number', 'Nomor telepon terbaik'),
      placeholder: copy('+62 812 3456 7890', '+62 812 3456 7890'),
      required: true,
      type: 'phone',
      validation: { min_length: 10 },
    }),
  ],
  section: copy('How and where you work', 'Bagaimana dan di mana kamu bekerja'),
  section_progress: '1/3',
  subtitle: copy(
    'We use this to match you more accurately.',
    'Kami menggunakan ini untuk mencocokkanmu dengan lebih akurat.'
  ),
  title: copy('A few personal details', 'Beberapa detail personal'),
} satisfies LocalizedOnboardingStepTemplate;

export const locationPreferencesStep = {
  can_go_back: true,
  cta: continueCta,
  id: 'step_location_preferences',
  overall_progress: { current: 5, total: 9 },
  questions: [
    question({
      id: 'q_city',
      label: copy('Where are you based right now?', 'Saat ini kamu berbasis di mana?'),
      meta: {
        searchable: true,
      },
      options: cityOptions,
      placeholder: copy('Search a city', 'Cari kota'),
      required: true,
      type: 'searchable_dropdown',
      validation: { min_length: 1 },
    }),
    question({
      id: 'q_location_based',
      label: copy('Which location setup works best for you?', 'Pengaturan lokasi kerja mana yang paling cocok untukmu?'),
      options: locationBasedOptions,
      required: true,
      type: 'grouped_list',
      validation: { min_length: 1 },
    }),
    question({
      id: 'q_open_to_remote',
      label: copy('Are you open to remote work?', 'Apakah kamu terbuka untuk kerja remote?'),
      options: yesNoOptions,
      required: true,
      type: 'segmented',
      validation: { min_length: 1 },
    }),
    question({
      depends_on: {
        operator: 'equals',
        question_id: 'q_open_to_remote',
        value: 'yes',
      },
      id: 'q_remote_preference',
      label: copy('What is your remote work preference?', 'Apa preferensi kerjamu untuk remote?'),
      options: remotePreferenceOptions,
      placeholder: copy('Select a preference', 'Pilih preferensi'),
      required: true,
      type: 'dropdown',
      validation: { min_length: 1 },
    }),
    question({
      id: 'q_willing_to_relocate',
      label: copy('Would you relocate for the right opportunity?', 'Apakah kamu bersedia relokasi untuk peluang yang tepat?'),
      options: relocateOptions,
      required: true,
      type: 'single_select_radio',
      validation: { min_length: 1 },
    }),
  ],
  section: copy('How and where you work', 'Bagaimana dan di mana kamu bekerja'),
  section_progress: '2/3',
  subtitle: copy(
    'This helps us surface roles and people in the right markets.',
    'Ini membantu kami menampilkan peran dan orang di market yang tepat.'
  ),
  title: copy('Location preferences', 'Preferensi lokasi'),
} satisfies LocalizedOnboardingStepTemplate;

export const experienceAndIndustriesStep = {
  can_go_back: true,
  cta: continueCta,
  id: 'step_experience_and_industries',
  overall_progress: { current: 6, total: 9 },
  questions: [
    question({
      id: 'q_startup_experience',
      label: copy('How much startup experience do you have?', 'Seberapa besar pengalaman startupmu?'),
      options: startupExperienceOptions,
      required: true,
      type: 'single_select_radio',
      validation: { min_length: 1 },
    }),
    question({
      helper_text: copy(
        'Choose up to five industries that genuinely excite you.',
        'Pilih maksimal lima industri yang benar-benar membuatmu tertarik.'
      ),
      id: 'q_industries_interest',
      label: copy('Which industries are you most interested in?', 'Industri apa yang paling kamu minati?'),
      options: industryOptions,
      required: true,
      type: 'multi_select_chip',
      validation: { max_selections: 5, min_selections: 1 },
    }),
    question({
      id: 'q_availability',
      label: copy('What availability are you aiming for?', 'Availability seperti apa yang kamu incar?'),
      options: availabilityOptions,
      placeholder: copy('Select availability', 'Pilih availability'),
      required: true,
      type: 'dropdown',
      validation: { min_length: 1 },
    }),
  ],
  section: copy('How and where you work', 'Bagaimana dan di mana kamu bekerja'),
  section_progress: '3/3',
  subtitle: copy(
    'This sharpens the quality of the opportunities we show you.',
    'Ini mempertajam kualitas peluang yang kami tampilkan untukmu.'
  ),
  title: copy('Experience and interests', 'Pengalaman dan minat'),
} satisfies LocalizedOnboardingStepTemplate;

export const primaryRoleStep = {
  can_go_back: true,
  cta: continueCta,
  id: 'step_primary_role',
  overall_progress: { current: 7, total: 9 },
  questions: [
    question({
      id: 'q_primary_role',
      label: copy('Which role best describes you primarily?', 'Peran mana yang paling menggambarkanmu saat ini?'),
      options: primaryRoleOptions,
      required: true,
      type: 'grouped_list',
      validation: { min_length: 1 },
    }),
    question({
      id: 'q_years_experience',
      label: copy('Years of experience', 'Jumlah tahun pengalaman'),
      placeholder: copy('3', '3'),
      required: true,
      type: 'number',
      validation: { max: 40, min: 0 },
    }),
    question({
      id: 'q_linkedin_url',
      label: copy('LinkedIn URL', 'URL LinkedIn'),
      placeholder: copy('https://linkedin.com/in/your-name', 'https://linkedin.com/in/namamu'),
      required: true,
      type: 'url',
      validation: { max_length: 200, min_length: 10 },
    }),
  ],
  section: copy('Your role and credibility', 'Peran dan kredibilitasmu'),
  section_progress: '1/1',
  subtitle: copy(
    'This gives others a fast read on where you fit best.',
    'Ini memberi orang lain gambaran cepat tentang kecocokanmu.'
  ),
  title: copy('Your primary role', 'Peran utamamu'),
} satisfies LocalizedOnboardingStepTemplate;

export const sharedCompensationQuestions = {
  cashEquityExpectation: question({
    id: 'q_cash_equity_expectation',
    label: copy('What is your cash-equity expectation?', 'Bagaimana ekspektasimu untuk cash dan equity?'),
    options: [
      {
        ...currencyOptions[0],
        id: 'opt_comp_cash_first',
        label: copy('Cash first', 'Utamakan cash'),
        value: 'cash_first',
      },
      {
        ...currencyOptions[1],
        id: 'opt_comp_balanced',
        label: copy('Balanced', 'Seimbang'),
        value: 'balanced',
      },
      {
        ...currencyOptions[2],
        id: 'opt_comp_equity_first',
        label: copy('Equity first', 'Utamakan equity'),
        value: 'equity_first',
      },
    ],
    required: true,
    type: 'segmented',
    validation: { min_length: 1 },
  }),
  founderSummary: question({
    id: 'q_founder_summary',
    label: copy('Describe what you are building and who would thrive with you.', 'Jelaskan apa yang sedang kamu bangun dan siapa yang akan cocok bergabung denganmu.'),
    placeholder: copy(
      'We are building an AI workflow product for operations teams...',
      'Kami sedang membangun produk workflow AI untuk tim operasional...'
    ),
    required: true,
    type: 'textarea',
    validation: { max_length: 500, min_length: 30 },
  }),
  minSalary: question({
    depends_on: {
      operator: 'in',
      question_id: 'q_min_salary_preference',
      value: ['strict', 'flexible'],
    },
    id: 'q_min_salary',
    label: copy('Minimum salary expectation', 'Ekspektasi minimum gaji'),
    meta: {
      amount_label: 'Amount',
      amount_placeholder: '5000',
      currency_label: 'Currency',
    },
    options: currencyOptions,
    required: true,
    type: 'currency_amount',
  }),
  minSalaryPreference: question({
    id: 'q_min_salary_preference',
    label: copy('What is your minimum salary preference?', 'Bagaimana preferensi minimum gajimu?'),
    options: salaryPreferenceOptions,
    required: true,
    type: 'single_select_radio',
    validation: { min_length: 1 },
  }),
  startupDescription: question({
    id: 'q_startup_description',
    label: copy('Describe your startup in a few sentences.', 'Jelaskan startupmu dalam beberapa kalimat.'),
    placeholder: copy(
      'What problem do you solve, and what kind of people do you want to attract?',
      'Masalah apa yang kamu selesaikan, dan orang seperti apa yang ingin kamu tarik?'
    ),
    required: true,
    type: 'textarea',
    validation: { max_length: 500, min_length: 30 },
  }),
} as const;
