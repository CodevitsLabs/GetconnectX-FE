import { View, type ViewProps } from 'react-native';

import { cn } from '@shared/utils/cn';

import { AppText } from './app-text';

const toneStyles = {
  default: 'border-border bg-surface',
  accent: 'border-accent/20 bg-accent-tint',
  signal: 'border-signal/25 bg-signal-tint',
  success: 'border-success/25 bg-success-tint',
  neutral: 'border-border-strong bg-surface-muted',
} as const;

export type AppPillProps = ViewProps & {
  className?: string;
  label: string;
  tone?: keyof typeof toneStyles;
};

export function AppPill({ className, label, tone = 'default', ...props }: AppPillProps) {
  return (
    <View
      className={cn('rounded-full border px-3 py-1.5', toneStyles[tone], className)}
      {...props}>
      <AppText variant="label">{label}</AppText>
    </View>
  );
}
