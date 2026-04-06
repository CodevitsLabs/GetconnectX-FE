import { ScrollView, View } from 'react-native';

import { AppCard, AppListItem, AppText } from '@shared/components';
import { DesignPrinciples } from '@shared/theme';

const implementationNotes = [
  'Use semantic token names so screens can change tone without rewriting component logic.',
  'Keep routes focused on composition; shared primitives should carry the visual system.',
  'Reserve bright blue for primary actions and meaningful state changes only.',
] as const;

export function DesignSystemModalScreen() {
  return (
    <ScrollView
      className="flex-1 bg-canvas"
      contentContainerClassName="gap-4 px-5 pt-4 pb-16"
      contentInsetAdjustmentBehavior="automatic">
      <AppCard className="gap-3">
        <AppText tone="accent" variant="label">
          System Summary
        </AppText>
        <AppText variant="hero">A dark-first system built for clarity, speed, and trust.</AppText>
        <AppText tone="muted">
          This sheet keeps future screens aligned to the same premium product language.
        </AppText>
      </AppCard>

      <View className="gap-3">
        {DesignPrinciples.map((principle) => (
          <AppCard key={principle.title} className="gap-2">
            <AppText variant="subtitle">{principle.title}</AppText>
            <AppText tone="muted">{principle.description}</AppText>
          </AppCard>
        ))}
      </View>

      <AppCard tone="muted" className="gap-3">
        <AppText variant="subtitle">Implementation Notes</AppText>
        {implementationNotes.map((note) => (
          <AppListItem
            key={note}
            description={note}
            leading={<AppText tone="accent" variant="bodyStrong">•</AppText>}
            title="Rule"
          />
        ))}
      </AppCard>
    </ScrollView>
  );
}
