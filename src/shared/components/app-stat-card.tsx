import type { ViewProps } from 'react-native';

import { cn } from '@shared/utils/cn';

import { AppCard } from './app-card';
import { AppText } from './app-text';

const toneStyles = {
  default: '',
  accent: 'border-accent/25 bg-accent-tint',
  signal: 'border-signal/25 bg-signal-tint',
  success: 'border-success/25 bg-success-tint',
} as const;

export type AppStatCardProps = ViewProps & {
  className?: string;
  detail?: string;
  label: string;
  tone?: keyof typeof toneStyles;
  value: string;
};

export function AppStatCard({
  className,
  detail,
  label,
  tone = 'default',
  value,
  ...props
}: AppStatCardProps) {
  return (
    <AppCard className={cn('gap-2', toneStyles[tone], className)} {...props}>
      <AppText tone="muted" variant="label">
        {label}
      </AppText>
      <AppText variant="title">{value}</AppText>
      {detail ? <AppText tone="muted">{detail}</AppText> : null}
    </AppCard>
  );
}
