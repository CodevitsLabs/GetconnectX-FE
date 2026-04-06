import { Stack } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { AppCard, AppPill, AppStatCard, AppText } from '@shared/components';

import { SwipeDeck } from './swipe-deck';

const matches = [
  {
    name: 'Maya Chen',
    role: 'Product strategist',
    score: '92%',
    status: 'Warm lead',
    bio: 'Strong async communicator with marketplace experience and a calm leadership style.',
  },
  {
    name: 'Rafi Nandha',
    role: 'Operations partner',
    score: '88%',
    status: 'Needs review',
    bio: 'Great at coordinating teams across time zones and keeping execution detail sharp.',
  },
  {
    name: 'Jess Alvarez',
    role: 'Community builder',
    score: '95%',
    status: 'Ready to chat',
    bio: 'Brings fast trust-building, crisp writing, and a strong instinct for member onboarding.',
  },
] as const;

export function MatchesScreen() {
  const readyCount = matches.filter((match) => match.status === 'Ready to chat').length;
  const averageScore = Math.round(
    matches.reduce((sum, match) => sum + Number.parseInt(match.score, 10), 0) / matches.length
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Pipeline' }} />
      <ScrollView
        className="flex-1 bg-canvas"
        contentContainerClassName="gap-6 px-5 pt-4 pb-24"
        contentInsetAdjustmentBehavior="automatic">
        <View className="gap-3">
          <AppPill className="self-start" label="Pipeline" tone="accent" />
          <AppText variant="hero">Review high-fit members without losing context.</AppText>
          <AppText tone="muted">
            This queue is built to answer one question fast: who deserves the next step right now?
          </AppText>
        </View>

        <View className="flex-row gap-3">
          <AppStatCard
            className="flex-1"
            detail="Average fit"
            label="Score"
            tone="accent"
            value={`${averageScore}%`}
          />
          <AppStatCard
            className="flex-1"
            detail="Ready now"
            label="Hot Leads"
            tone="success"
            value={String(readyCount)}
          />
        </View>

        <SwipeDeck items={matches} />

        <AppCard tone="muted" className="gap-2">
          <AppText variant="subtitle">Decision rule</AppText>
          <AppText tone="muted">Pass when the timing is wrong. Advance when the fit is clear.</AppText>
        </AppCard>
      </ScrollView>
    </>
  );
}
