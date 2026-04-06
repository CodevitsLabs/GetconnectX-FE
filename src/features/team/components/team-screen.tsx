import { Stack } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { AppCard, AppListItem, AppPill, AppStatCard, AppText } from '@shared/components';

const teamMembers = [
  {
    name: 'Alya Hartono',
    role: 'Product lead',
    availability: 'online',
  },
  {
    name: 'Dimas Prasetyo',
    role: 'Community manager',
    availability: 'reviewing',
  },
  {
    name: 'Sarah Malik',
    role: 'Design systems',
    availability: 'available',
  },
] as const;

function getInitials(value: string) {
  return value
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function TeamScreen() {
  const onlineCount = teamMembers.filter((member) => member.availability === 'online').length;
  const availableCount = teamMembers.filter((member) => member.availability === 'available').length;

  return (
    <>
      <Stack.Screen options={{ title: 'Team' }} />
      <ScrollView
        className="flex-1 bg-canvas"
        contentContainerClassName="gap-6 px-5 pt-4 pb-24"
        contentInsetAdjustmentBehavior="automatic">
        <View className="gap-3">
          <AppPill className="self-start" label="Team" tone="accent" />
          <AppText variant="hero">Coverage stays visible at a glance.</AppText>
          <AppText tone="muted">
            Team status should answer who is free, who is reviewing, and where execution support is
            available right now.
          </AppText>
        </View>

        <View className="flex-row gap-3">
          <AppStatCard
            className="flex-1"
            detail="Currently online"
            label="Live"
            tone="accent"
            value={String(onlineCount)}
          />
          <AppStatCard
            className="flex-1"
            detail="Ready to help"
            label="Available"
            tone="success"
            value={String(availableCount)}
          />
        </View>

        <AppCard className="gap-3">
          <AppText variant="subtitle">People</AppText>
          {teamMembers.map((member) => (
            <AppListItem
              key={member.name}
              description={member.role}
              leading={<AppText variant="bodyStrong">{getInitials(member.name)}</AppText>}
              meta="Now"
              title={member.name}
              tone={member.availability === 'available' ? 'success' : member.availability === 'reviewing' ? 'danger' : 'accent'}
              trailing={
                <AppPill
                  label={member.availability}
                  tone={member.availability === 'available' ? 'success' : member.availability === 'reviewing' ? 'signal' : 'accent'}
                />
              }
            />
          ))}
        </AppCard>
      </ScrollView>
    </>
  );
}
