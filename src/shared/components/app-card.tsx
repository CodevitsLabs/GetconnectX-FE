import { View, type ViewProps } from 'react-native';

import { Shadows } from '@shared/theme';
import { cn } from '@shared/utils/cn';

const toneStyles = {
  default: 'border-border bg-surface',
  muted: 'border-border bg-background',
  accent: 'border-accent/20 bg-accent-tint',
  signal: 'border-signal/25 bg-signal-tint',
  success: 'border-success/25 bg-success-tint',
} as const;

export type AppCardProps = ViewProps & {
  className?: string;
  tone?: keyof typeof toneStyles;
};

export function AppCard({ className, style, tone = 'default', ...props }: AppCardProps) {
  return (
    <View
      className={cn('rounded-[20px] border p-4', toneStyles[tone], className)}
      style={[Shadows.card, style]}
      {...props}
    />
  );
}
