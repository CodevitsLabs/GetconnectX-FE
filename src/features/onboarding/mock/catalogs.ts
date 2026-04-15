import type {
  LocalizedOnboardingOption,
  LocalizedText,
} from '../types/onboarding.types';

type OptionConfig = {
  group?: LocalizedText | null;
  icon?: string | null;
  subLabel?: LocalizedText | null;
};

export function copy(en: string, id?: string): LocalizedText {
  return {
    en,
    id: id ?? en,
  };
}

export function option(
  id: string,
  value: string,
  label: LocalizedText,
  config: OptionConfig = {}
): LocalizedOnboardingOption {
  return {
    group: config.group ?? null,
    icon: config.icon ?? null,
    id,
    label,
    sub_label: config.subLabel ?? null,
    value,
  };
}

export const yesNoOptions = [
  option('opt_yes', 'yes', copy('Yes', 'Ya')),
  option('opt_no', 'no', copy('No', 'Tidak')),
] satisfies LocalizedOnboardingOption[];

export const genderOptions = [
  option('opt_gender_female', 'female', copy('Female', 'Perempuan'), {
    icon: 'female',
  }),
  option('opt_gender_male', 'male', copy('Male', 'Laki-laki'), {
    icon: 'male',
  }),
] satisfies LocalizedOnboardingOption[];

export const useConnectxOptions = [
  option('opt_builder', 'builder', copy("I'm a Builder", 'Saya seorang Builder'), {
    icon: 'team',
    subLabel: copy(
      'Founder, co-founder, or team member',
      'Founder, co-founder, atau anggota tim'
    ),
  }),
  option('opt_startup', 'startup', copy('I represent a Startup', 'Saya mewakili Startup'), {
    icon: 'rocket',
    subLabel: copy(
      'Building a team or hiring co-founders',
      'Sedang membangun tim atau mencari co-founder'
    ),
  }),
] satisfies LocalizedOnboardingOption[];

export const builderTypeOptions = [
  option('opt_builder_founder', 'founder', copy('Founder', 'Founder'), {
    icon: 'founder_rocket',
    subLabel: copy(
      "I'm building something and looking for people",
      'Saya sedang membangun sesuatu dan mencari orang'
    ),
  }),
  option('opt_builder_cofounder', 'cofounder', copy('Co-Founder', 'Co-Founder'), {
    icon: 'cofounder_handshake',
    subLabel: copy(
      'I want to join a startup as a co-founder',
      'Saya ingin bergabung sebagai co-founder'
    ),
  }),
  option('opt_builder_team_member', 'team_member', copy('Team Member', 'Anggota Tim'), {
    icon: 'team_member_group',
    subLabel: copy('I want to join a startup team', 'Saya ingin bergabung di tim startup'),
  }),
] satisfies LocalizedOnboardingOption[];

export const founderGoalOptions = [
  option('opt_goal_cofounder', 'cofounder', copy('Looking for Co-Founder', 'Mencari Co-Founder')),
  option('opt_goal_team_members', 'team_members', copy('Looking for Team Members', 'Mencari Anggota Tim')),
  option('opt_goal_both', 'both', copy('Looking for Both', 'Mencari Keduanya')),
] satisfies LocalizedOnboardingOption[];

export const startupStageOptions = [
  option('opt_stage_idea', 'idea', copy('Idea', 'Ide')),
  option('opt_stage_mvp', 'mvp', copy('MVP', 'MVP')),
  option('opt_stage_live', 'live', copy('Live', 'Sudah Launching')),
] satisfies LocalizedOnboardingOption[];

export const cityOptions = [
  option('opt_city_jakarta', 'jakarta', copy('Jakarta, Indonesia', 'Jakarta, Indonesia'), {
    group: copy('Indonesia', 'Indonesia'),
  }),
  option('opt_city_bandung', 'bandung', copy('Bandung, Indonesia', 'Bandung, Indonesia'), {
    group: copy('Indonesia', 'Indonesia'),
  }),
  option('opt_city_yogyakarta', 'yogyakarta', copy('Yogyakarta, Indonesia', 'Yogyakarta, Indonesia'), {
    group: copy('Indonesia', 'Indonesia'),
  }),
  option('opt_city_singapore', 'singapore', copy('Singapore, Singapore', 'Singapura, Singapura'), {
    group: copy('Singapore', 'Singapura'),
  }),
  option('opt_city_bangalore', 'bangalore', copy('Bangalore, India', 'Bangalore, India'), {
    group: copy('India', 'India'),
  }),
  option('opt_city_hcmc', 'hcmc', copy('Ho Chi Minh City, Vietnam', 'Ho Chi Minh City, Vietnam'), {
    group: copy('Vietnam', 'Vietnam'),
  }),
  option('opt_city_dubai', 'dubai', copy('Dubai, United Arab Emirates', 'Dubai, Uni Emirat Arab'), {
    group: copy('United Arab Emirates', 'Uni Emirat Arab'),
  }),
] satisfies LocalizedOnboardingOption[];

export const locationBasedOptions = [
  option('opt_location_remote', 'remote', copy('Remote', 'Remote'), {
    group: copy('Flexible', 'Fleksibel'),
  }),
  option('opt_location_anywhere', 'anywhere', copy('Anywhere', 'Di Mana Saja'), {
    group: copy('Flexible', 'Fleksibel'),
  }),
  option('opt_location_jakarta', 'jakarta', copy('Jakarta', 'Jakarta'), {
    group: copy('City Hubs', 'Kota Utama'),
  }),
  option('opt_location_singapore', 'singapore', copy('Singapore', 'Singapura'), {
    group: copy('City Hubs', 'Kota Utama'),
  }),
  option('opt_location_bangalore', 'bangalore', copy('Bangalore', 'Bangalore'), {
    group: copy('City Hubs', 'Kota Utama'),
  }),
  option('opt_location_hcmc', 'hcmc', copy('Ho Chi Minh City', 'Ho Chi Minh City'), {
    group: copy('City Hubs', 'Kota Utama'),
  }),
  option('opt_location_dubai', 'dubai', copy('Dubai', 'Dubai'), {
    group: copy('City Hubs', 'Kota Utama'),
  }),
] satisfies LocalizedOnboardingOption[];

export const remotePreferenceOptions = [
  option('opt_remote_hybrid', 'hybrid', copy('Hybrid', 'Hybrid')),
  option('opt_remote_onsite', 'onsite', copy('Onsite', 'Onsite')),
  option('opt_remote_preferred', 'remote_preferred', copy('Remote preferred', 'Lebih suka remote')),
  option('opt_remote_only', 'remote_only', copy('Remote only', 'Hanya remote')),
] satisfies LocalizedOnboardingOption[];

export const relocateOptions = [
  option('opt_relocate_yes', 'yes', copy('Yes, if the fit is right', 'Ya, jika cocok')),
  option('opt_relocate_maybe', 'maybe', copy('Maybe for the right role', 'Mungkin untuk peran yang tepat')),
  option('opt_relocate_no', 'no', copy('No, I want to stay put', 'Tidak, saya ingin tetap di lokasi sekarang')),
] satisfies LocalizedOnboardingOption[];

export const startupExperienceOptions = [
  option('opt_exp_founded', 'founded', copy('I have founded a startup', 'Saya pernah mendirikan startup')),
  option('opt_exp_built', 'built', copy('I have built products at a startup', 'Saya pernah membangun produk di startup')),
  option('opt_exp_worked', 'worked', copy('I have worked in a startup team', 'Saya pernah bekerja di tim startup')),
  option('opt_exp_none', 'none', copy('No direct startup experience yet', 'Belum punya pengalaman startup langsung')),
] satisfies LocalizedOnboardingOption[];

export const industryOptions = [
  option('opt_industry_saas', 'saas', copy('SaaS', 'SaaS'), { icon: 'target' }),
  option('opt_industry_fintech', 'fintech', copy('Fintech', 'Fintech'), { icon: 'target' }),
  option('opt_industry_ecommerce', 'ecommerce', copy('E-Commerce', 'E-Commerce'), { icon: 'target' }),
  option('opt_industry_healthtech', 'healthtech', copy('Health Tech', 'Health Tech'), { icon: 'target' }),
  option('opt_industry_edtech', 'edtech', copy('EdTech', 'EdTech'), { icon: 'target' }),
  option('opt_industry_ai_ml', 'ai_ml', copy('AI / ML', 'AI / ML'), { icon: 'target' }),
  option('opt_industry_climate', 'climate', copy('Climate Tech', 'Climate Tech'), { icon: 'target' }),
  option('opt_industry_social', 'social', copy('Social Impact', 'Social Impact'), { icon: 'target' }),
] satisfies LocalizedOnboardingOption[];

export const availabilityOptions = [
  option('opt_availability_full_time', 'full_time', copy('Full-time', 'Full-time')),
  option('opt_availability_part_time', 'part_time', copy('Part-time', 'Part-time')),
  option('opt_availability_flexible', 'flexible', copy('Flexible', 'Fleksibel')),
] satisfies LocalizedOnboardingOption[];

export const primaryRoleOptions = [
  option('opt_role_ceo', 'ceo', copy('Founder / CEO', 'Founder / CEO'), {
    group: copy('Leadership & Strategy', 'Leadership & Strategy'),
  }),
  option('opt_role_cpo', 'cpo', copy('Product Lead', 'Product Lead'), {
    group: copy('Product & Design', 'Product & Design'),
  }),
  option('opt_role_designer', 'designer', copy('Product Designer', 'Product Designer'), {
    group: copy('Product & Design', 'Product & Design'),
  }),
  option('opt_role_engineer', 'engineer', copy('Full-Stack Engineer', 'Full-Stack Engineer'), {
    group: copy('Engineering & Data', 'Engineering & Data'),
  }),
  option('opt_role_data', 'data', copy('Data / AI Builder', 'Data / AI Builder'), {
    group: copy('Engineering & Data', 'Engineering & Data'),
  }),
  option('opt_role_growth', 'growth', copy('Growth / GTM', 'Growth / GTM'), {
    group: copy('Growth & Revenue', 'Growth & Revenue'),
  }),
  option('opt_role_operations', 'operations', copy('Operations', 'Operations'), {
    group: copy('Operations & Finance', 'Operations & Finance'),
  }),
  option('opt_role_finance', 'finance', copy('Finance', 'Finance'), {
    group: copy('Operations & Finance', 'Operations & Finance'),
  }),
] satisfies LocalizedOnboardingOption[];

export const cofounderTypeOptions = [
  option('opt_cofounder_technical', 'technical', copy('Technical Co-Founder', 'Co-Founder Teknis'), {
    subLabel: copy('Engineering, architecture, or AI', 'Engineering, arsitektur, atau AI'),
  }),
  option('opt_cofounder_business', 'business', copy('Business Co-Founder', 'Co-Founder Bisnis'), {
    subLabel: copy('Sales, fundraising, or operations', 'Sales, fundraising, atau operasional'),
  }),
  option('opt_cofounder_product', 'product', copy('Product Co-Founder', 'Co-Founder Produk'), {
    subLabel: copy('Product strategy and execution', 'Strategi dan eksekusi produk'),
  }),
  option('opt_cofounder_growth', 'growth', copy('Growth Co-Founder', 'Co-Founder Growth'), {
    subLabel: copy('Distribution, marketing, and partnerships', 'Distribusi, marketing, dan partnership'),
  }),
] satisfies LocalizedOnboardingOption[];

export const teamRoleOptions = [
  option('opt_team_cto', 'cto', copy('CTO / Technical Lead', 'CTO / Technical Lead')),
  option('opt_team_fullstack', 'fullstack_engineer', copy('Full-Stack Engineer', 'Full-Stack Engineer')),
  option('opt_team_frontend', 'frontend_engineer', copy('Frontend Engineer', 'Frontend Engineer')),
  option('opt_team_product_designer', 'product_designer', copy('Product Designer', 'Product Designer')),
  option('opt_team_growth_marketer', 'growth_marketer', copy('Growth Marketer', 'Growth Marketer')),
  option('opt_team_ops', 'operations_lead', copy('Operations Lead', 'Operations Lead')),
  option('opt_team_revenue', 'bizdev', copy('Business Development', 'Business Development')),
] satisfies LocalizedOnboardingOption[];

export const skillsetOptions = [
  option('opt_skill_product', 'product', copy('Product & Strategy', 'Product & Strategy')),
  option('opt_skill_design', 'design', copy('Design', 'Design')),
  option('opt_skill_fullstack', 'fullstack', copy('Full-Stack Engineering', 'Full-Stack Engineering')),
  option('opt_skill_backend', 'backend', copy('Backend Engineering', 'Backend Engineering')),
  option('opt_skill_mobile', 'mobile', copy('Mobile Engineering', 'Mobile Engineering')),
  option('opt_skill_growth', 'growth', copy('Growth & Marketing', 'Growth & Marketing')),
  option('opt_skill_sales', 'sales', copy('Sales & Partnerships', 'Sales & Partnerships')),
  option('opt_skill_ops', 'ops', copy('Operations', 'Operations')),
] satisfies LocalizedOnboardingOption[];

export const equityExpectationOptions = [
  option('opt_equity_cash', 'cash_only', copy('Cash only', 'Hanya cash')),
  option('opt_equity_balanced', 'balanced', copy('Balanced cash + equity', 'Cash + equity seimbang')),
  option('opt_equity_equity_heavy', 'equity_heavy', copy('Equity-heavy', 'Lebih berat di equity')),
] satisfies LocalizedOnboardingOption[];

export const salaryPreferenceOptions = [
  option('opt_salary_strict', 'strict', copy('Strict minimum', 'Minimum yang tegas')),
  option('opt_salary_flexible', 'flexible', copy('Flexible for the right fit', 'Fleksibel untuk peluang yang tepat')),
  option('opt_salary_none', 'no_minimum', copy('No minimum for now', 'Belum ada minimum')),
] satisfies LocalizedOnboardingOption[];

export const currencyOptions = [
  option('opt_currency_idr', 'IDR', copy('IDR', 'IDR')),
  option('opt_currency_usd', 'USD', copy('USD', 'USD')),
  option('opt_currency_sgd', 'SGD', copy('SGD', 'SGD')),
] satisfies LocalizedOnboardingOption[];

export const startupLookingForOptions = [
  option('opt_startup_hire_cofounder', 'hire_cofounder', copy('A co-founder', 'Seorang co-founder')),
  option('opt_startup_hire_team', 'hire_team', copy('Core team members', 'Anggota tim inti')),
  option('opt_startup_hire_advisors', 'hire_advisors', copy('Advisors or specialists', 'Advisor atau spesialis')),
] satisfies LocalizedOnboardingOption[];

