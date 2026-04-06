import React from 'react';
import { Pressable, View, type PressableProps, type ViewProps } from 'react-native';

import { cn } from '@shared/utils/cn';

import { AppText } from './app-text';

const toneStyles = {
  default: 'border-border bg-surface',
  accent: 'border-accent/25 bg-accent-tint',
  success: 'border-success/25 bg-success-tint',
  danger: 'border-danger/25 bg-danger-tint',
} as const;

type BaseProps = {
  className?: string;
  description?: string;
  leading?: React.ReactNode;
  meta?: string;
  title: string;
  tone?: keyof typeof toneStyles;
  trailing?: React.ReactNode;
  value?: string;
};

type AppListItemProps = BaseProps &
  (
    | ({ onPress?: undefined } & ViewProps)
    | ({ onPress: NonNullable<PressableProps['onPress']> } & Omit<PressableProps, 'children'>)
  );

function Content({
  className,
  description,
  leading,
  meta,
  title,
  tone = 'default',
  trailing,
  value,
}: BaseProps) {
  return (
    <View
      className={cn(
        'flex-row items-center gap-4 rounded-[20px] border px-4 py-4',
        toneStyles[tone],
        className
      )}>
      {leading ? (
        <View className="h-12 w-12 items-center justify-center rounded-[16px] bg-background">
          {leading}
        </View>
      ) : null}

      <View className="flex-1 gap-1">
        <AppText variant="bodyStrong">{title}</AppText>
        {description ? <AppText tone="muted">{description}</AppText> : null}
      </View>

      {value || meta || trailing ? (
        <View className="items-end gap-1">
          {value ? <AppText variant="subtitle">{value}</AppText> : null}
          {meta ? (
            <AppText align="right" tone="soft" variant="code">
              {meta}
            </AppText>
          ) : null}
          {trailing}
        </View>
      ) : null}
    </View>
  );
}

export function AppListItem(props: AppListItemProps) {
  if ('onPress' in props && props.onPress) {
    const { onPress, ...rest } = props;

    return (
      <Pressable android_ripple={{ color: 'rgba(255,255,255,0.08)' }} onPress={onPress}>
        <Content {...rest} />
      </Pressable>
    );
  }

  return <Content {...props} />;
}
