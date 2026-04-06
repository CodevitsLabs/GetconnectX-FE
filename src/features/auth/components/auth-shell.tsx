import React from 'react';
import { ScrollView, View } from 'react-native';

import { AppCard, AppListItem, AppPill, AppText } from '@shared/components';

const defaultHighlights = [
  {
    description: 'Keep the most confident next action obvious from the first second.',
    title: 'Focused entry',
  },
  {
    description: 'Email verification is staged now so the backend contract can drop in later.',
    title: 'Mock-ready flow',
  },
  {
    description: 'Developer bypass keeps the rest of the product unblocked during backend setup.',
    title: 'Dev-friendly access',
  },
] as const;

type AuthShellProps = React.PropsWithChildren<{
  description: string;
  footer?: React.ReactNode;
  highlights?: readonly {
    description: string;
    title: string;
  }[];
  pill: string;
  title: string;
}>;

export function AuthShell({
  children,
  description,
  footer,
  highlights = defaultHighlights,
  pill,
  title,
}: AuthShellProps) {
  return (
    <ScrollView
      className="flex-1 bg-canvas"
      contentContainerClassName="gap-6 px-5 pt-10 pb-24"
      contentInsetAdjustmentBehavior="automatic">
      <View className="gap-4">
        <View className="gap-3">
          <AppPill className="self-start" label={pill} tone="accent" />
          <AppText variant="display">{title}</AppText>
          <AppText tone="muted">{description}</AppText>
        </View>

        <AppCard tone="muted" className="gap-3 border-accent/15">
          <AppText variant="subtitle">What this flow supports</AppText>
          {highlights.map((item) => (
            <AppListItem
              key={item.title}
              description={item.description}
              leading={<AppText tone="accent" variant="bodyStrong">{item.title.slice(0, 2)}</AppText>}
              title={item.title}
            />
          ))}
        </AppCard>
      </View>

      <AppCard className="gap-4 p-5">{children}</AppCard>

      {footer ? <View className="gap-4">{footer}</View> : null}
    </ScrollView>
  );
}
