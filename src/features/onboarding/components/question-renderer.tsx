import React from 'react';
import { Pressable, View } from 'react-native';

import { AppCard, AppInput, AppText } from '@shared/components';
import { cn } from '@shared/utils/cn';

import type {
  CurrencyAmountValue,
  OnboardingAnswerValue,
  OnboardingOption,
  OnboardingQuestion,
} from '../types/onboarding.types';

type QuestionRendererProps = {
  error?: string;
  onChange: (value: OnboardingAnswerValue) => void;
  question: OnboardingQuestion;
  value: OnboardingAnswerValue | undefined;
};

function getStringValue(value: OnboardingAnswerValue | undefined) {
  return typeof value === 'string' ? value : '';
}

function getNumberValue(value: OnboardingAnswerValue | undefined) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return typeof value === 'string' ? value : '';
}

function getArrayValue(value: OnboardingAnswerValue | undefined) {
  return Array.isArray(value) ? value : [];
}

function getCurrencyValue(value: OnboardingAnswerValue | undefined): CurrencyAmountValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {
      amount: '',
      currency: '',
    };
  }

  const candidate = value as Partial<CurrencyAmountValue>;

  return {
    amount: typeof candidate.amount === 'string' ? candidate.amount : '',
    currency: typeof candidate.currency === 'string' ? candidate.currency : '',
  };
}

function getSelectedLabel(options: OnboardingOption[] | undefined, value: string) {
  return options?.find((option) => option.value === value)?.label ?? value;
}

function groupOptions(options: OnboardingOption[] | undefined) {
  const groupedOptions = new Map<string, OnboardingOption[]>();

  for (const option of options ?? []) {
    const groupName = option.group ?? 'Options';
    const currentGroup = groupedOptions.get(groupName) ?? [];
    currentGroup.push(option);
    groupedOptions.set(groupName, currentGroup);
  }

  return Array.from(groupedOptions.entries());
}

function iconBadgeLabel(option: OnboardingOption) {
  if (option.icon === 'team') {
    return 'B';
  }

  if (option.icon === 'rocket') {
    return 'S';
  }

  const parts = option.label.split(' ').filter(Boolean);

  if (parts.length === 0) {
    return '?';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }

  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

function QuestionHeader({
  error,
  question,
}: {
  error?: string;
  question: OnboardingQuestion;
}) {
  return (
    <View className="gap-2">
      <View className="gap-1">
        <AppText variant="subtitle">{question.label}</AppText>
        {question.sub_label ? (
          <AppText tone="muted">{question.sub_label}</AppText>
        ) : null}
      </View>
      {question.helper_text ? (
        <AppText tone="soft">{question.helper_text}</AppText>
      ) : null}
      {error ? (
        <AppText selectable tone="danger">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

function TextLikeQuestion({
  error,
  keyboardType,
  multiline = false,
  onChange,
  question,
  value,
}: Omit<QuestionRendererProps, 'value'> & {
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'url';
  multiline?: boolean;
  value: string;
}) {
  return (
    <View className="gap-3">
      <QuestionHeader error={error} question={question} />
      <AppInput
        autoCapitalize={question.type === 'email' || question.type === 'url' ? 'none' : 'sentences'}
        autoCorrect={question.type === 'email' || question.type === 'url' ? false : true}
        error={error}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 5 : 1}
        onChangeText={(nextValue) => onChange(nextValue)}
        placeholder={question.placeholder ?? undefined}
        textAlignVertical={multiline ? 'top' : 'center'}
        value={value}
        className={cn(multiline && 'min-h-[140px] py-4')}
      />
    </View>
  );
}

function SelectionCard({
  isSelected,
  onPress,
  option,
}: {
  isSelected: boolean;
  onPress: () => void;
  option: OnboardingOption;
}) {
  return (
    <Pressable onPress={onPress}>
      <View
        className={cn(
          'flex-row items-center gap-4 rounded-[24px] border px-4 py-4',
          isSelected
            ? 'border-[#FF9A3E] bg-[#2A2117]'
            : 'border-border bg-surface'
        )}>
        <View
          className={cn(
            'h-14 w-14 items-center justify-center rounded-[18px]',
            isSelected ? 'bg-[#5A4421]' : 'bg-surface-muted'
          )}>
          <AppText variant="bodyStrong">{iconBadgeLabel(option)}</AppText>
        </View>
        <View className="flex-1 gap-1">
          <AppText variant="subtitle">{option.label}</AppText>
          {option.sub_label ? (
            <AppText tone="muted">{option.sub_label}</AppText>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function SingleSelectCardQuestion({
  error,
  onChange,
  question,
  value,
}: QuestionRendererProps) {
  const currentValue = getStringValue(value);

  return (
    <View className="gap-3">
      <QuestionHeader error={error} question={question} />
      <View className="gap-3">
        {question.options?.map((option) => (
          <SelectionCard
            key={option.id}
            isSelected={currentValue === option.value}
            onPress={() => onChange(option.value)}
            option={option}
          />
        ))}
      </View>
    </View>
  );
}

function SingleSelectRadioQuestion({
  error,
  onChange,
  question,
  value,
}: QuestionRendererProps) {
  const currentValue = getStringValue(value);

  return (
    <View className="gap-3">
      <QuestionHeader error={error} question={question} />
      <View className="gap-2">
        {question.options?.map((option) => {
          const isSelected = currentValue === option.value;

          return (
            <Pressable
              key={option.id}
              className={cn(
                'flex-row items-center gap-3 rounded-[18px] border px-4 py-4',
                isSelected ? 'border-accent bg-accent-tint' : 'border-border bg-surface'
              )}
              onPress={() => onChange(option.value)}>
              <View
                className={cn(
                  'h-5 w-5 rounded-full border-2',
                  isSelected ? 'border-accent bg-accent' : 'border-border-strong bg-transparent'
                )}
              />
              <View className="flex-1 gap-1">
                <AppText variant="bodyStrong">{option.label}</AppText>
                {option.sub_label ? (
                  <AppText tone="muted">{option.sub_label}</AppText>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function MultiSelectCardQuestion({
  error,
  onChange,
  question,
  value,
}: QuestionRendererProps) {
  const currentValues = getArrayValue(value);

  return (
    <View className="gap-3">
      <QuestionHeader error={error} question={question} />
      <View className="flex-row flex-wrap gap-3">
        {question.options?.map((option) => {
          const isSelected = currentValues.includes(option.value);

          return (
            <Pressable
              key={option.id}
              className={cn(
                'min-h-[92px] w-[48%] rounded-[20px] border px-4 py-4',
                isSelected ? 'border-accent bg-accent-tint' : 'border-border bg-surface'
              )}
              onPress={() => {
                if (isSelected) {
                  onChange(currentValues.filter((item) => item !== option.value));
                  return;
                }

                onChange([...currentValues, option.value]);
              }}>
              <View className="gap-2">
                <AppText variant="bodyStrong">{option.label}</AppText>
                {option.sub_label ? (
                  <AppText tone="muted">{option.sub_label}</AppText>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function MultiSelectChipQuestion({
  error,
  onChange,
  question,
  value,
}: QuestionRendererProps) {
  const currentValues = getArrayValue(value);

  return (
    <View className="gap-3">
      <QuestionHeader error={error} question={question} />
      <View className="flex-row flex-wrap gap-2">
        {question.options?.map((option) => {
          const isSelected = currentValues.includes(option.value);

          return (
            <Pressable
              key={option.id}
              className={cn(
                'rounded-full border px-4 py-2',
                isSelected ? 'border-accent bg-accent-tint' : 'border-border bg-surface'
              )}
              onPress={() => {
                if (isSelected) {
                  onChange(currentValues.filter((item) => item !== option.value));
                  return;
                }

                onChange([...currentValues, option.value]);
              }}>
              <AppText className={cn(isSelected && 'text-accent')} variant="bodyStrong">
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function DropdownQuestion({
  error,
  onChange,
  question,
  value,
}: QuestionRendererProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const currentValue = getStringValue(value);
  const currentLabel = currentValue
    ? getSelectedLabel(question.options, currentValue)
    : question.placeholder ?? 'Select one';

  return (
    <View className="gap-3">
      <QuestionHeader error={error} question={question} />
      <View className="gap-2">
        <Pressable
          className="rounded-[18px] border border-border bg-background px-4 py-4"
          onPress={() => setIsOpen((currentState) => !currentState)}>
          <View className="flex-row items-center justify-between gap-3">
            <AppText className={cn(!currentValue && 'text-text-soft')}>
              {currentLabel}
            </AppText>
            <AppText tone="muted" variant="label">
              {isOpen ? 'Hide' : 'Choose'}
            </AppText>
          </View>
        </Pressable>

        {isOpen ? (
          <AppCard className="gap-2 p-2">
            {question.options?.map((option) => {
              const isSelected = currentValue === option.value;

              return (
                <Pressable
                  key={option.id}
                  className={cn(
                    'rounded-[14px] px-3 py-3',
                    isSelected ? 'bg-accent-tint' : 'bg-transparent'
                  )}
                  onPress={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}>
                  <AppText className={cn(isSelected && 'text-accent')} variant="bodyStrong">
                    {option.label}
                  </AppText>
                  {option.sub_label ? (
                    <AppText tone="muted">{option.sub_label}</AppText>
                  ) : null}
                </Pressable>
              );
            })}
          </AppCard>
        ) : null}
      </View>
    </View>
  );
}

function SearchableDropdownQuestion({
  error,
  onChange,
  question,
  value,
}: QuestionRendererProps) {
  const [query, setQuery] = React.useState('');
  const currentValue = getStringValue(value);
  const filteredOptions = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return question.options ?? [];
    }

    return (question.options ?? []).filter((option) => {
      const haystack = `${option.label} ${option.group ?? ''}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [query, question.options]);

  return (
    <View className="gap-3">
      <QuestionHeader error={error} question={question} />
      <View className="gap-3">
        <AppInput
          autoCapitalize="words"
          autoCorrect={false}
          onChangeText={setQuery}
          placeholder={question.placeholder ?? 'Search'}
          value={query}
        />
        <AppCard className="gap-2 p-2">
          {groupOptions(filteredOptions).map(([groupName, options]) => (
            <View key={groupName} className="gap-2">
              <AppText tone="muted" variant="label">
                {groupName}
              </AppText>
              {options.map((option) => {
                const isSelected = currentValue === option.value;

                return (
                  <Pressable
                    key={option.id}
                    className={cn(
                      'rounded-[14px] px-3 py-3',
                      isSelected ? 'bg-accent-tint' : 'bg-transparent'
                    )}
                    onPress={() => onChange(option.value)}>
                    <AppText className={cn(isSelected && 'text-accent')} variant="bodyStrong">
                      {option.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </AppCard>
      </View>
    </View>
  );
}

function GroupedListQuestion({
  error,
  onChange,
  question,
  value,
}: QuestionRendererProps) {
  const currentValue = getStringValue(value);

  return (
    <View className="gap-3">
      <QuestionHeader error={error} question={question} />
      <View className="gap-4">
        {groupOptions(question.options).map(([groupName, options]) => (
          <View key={groupName} className="gap-2">
            <AppText tone="muted" variant="label">
              {groupName}
            </AppText>
            <View className="gap-2">
              {options.map((option) => {
                const isSelected = currentValue === option.value;

                return (
                  <Pressable
                    key={option.id}
                    className={cn(
                      'rounded-[18px] border px-4 py-4',
                      isSelected ? 'border-accent bg-accent-tint' : 'border-border bg-surface'
                    )}
                    onPress={() => onChange(option.value)}>
                    <AppText className={cn(isSelected && 'text-accent')} variant="bodyStrong">
                      {option.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function SegmentedQuestion({
  error,
  onChange,
  question,
  value,
}: QuestionRendererProps) {
  const currentValue = getStringValue(value);

  return (
    <View className="gap-3">
      <QuestionHeader error={error} question={question} />
      <View className="flex-row rounded-[20px] bg-surface p-1">
        {question.options?.map((option) => {
          const isSelected = currentValue === option.value;

          return (
            <Pressable
              key={option.id}
              className={cn(
                'flex-1 rounded-[16px] px-3 py-3',
                isSelected ? 'bg-accent' : 'bg-transparent'
              )}
              onPress={() => onChange(option.value)}>
              <AppText
                align="center"
                className={cn(isSelected ? 'text-text' : 'text-text-muted')}
                variant="bodyStrong">
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function CurrencyAmountQuestion({
  error,
  onChange,
  question,
  value,
}: QuestionRendererProps) {
  const currentValue = getCurrencyValue(value);

  return (
    <View className="gap-3">
      <QuestionHeader error={error} question={question} />
      <View className="gap-3">
        <View className="gap-2">
          <AppText tone="muted" variant="label">
            {question.meta?.currency_label ?? 'Currency'}
          </AppText>
          <View className="flex-row gap-2">
            {question.options?.map((option) => {
              const isSelected = currentValue.currency === option.value;

              return (
                <Pressable
                  key={option.id}
                  className={cn(
                    'rounded-full border px-4 py-2',
                    isSelected ? 'border-accent bg-accent-tint' : 'border-border bg-surface'
                  )}
                  onPress={() =>
                    onChange({
                      ...currentValue,
                      currency: option.value,
                    })
                  }>
                  <AppText className={cn(isSelected && 'text-accent')} variant="bodyStrong">
                    {option.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View className="gap-2">
          <AppText tone="muted" variant="label">
            {question.meta?.amount_label ?? 'Amount'}
          </AppText>
          <AppInput
            keyboardType="numeric"
            onChangeText={(nextAmount) =>
              onChange({
                ...currentValue,
                amount: nextAmount,
              })
            }
            placeholder={question.meta?.amount_placeholder ?? '5000'}
            value={currentValue.amount}
          />
        </View>
      </View>
    </View>
  );
}

export function QuestionRenderer({
  error,
  onChange,
  question,
  value,
}: QuestionRendererProps) {
  switch (question.type) {
    case 'textarea':
      return (
        <TextLikeQuestion
          error={error}
          multiline
          onChange={onChange}
          question={question}
          value={getStringValue(value)}
        />
      );
    case 'number':
      return (
        <TextLikeQuestion
          error={error}
          keyboardType="numeric"
          onChange={(nextValue) => {
            if (!nextValue) {
              onChange('');
              return;
            }

            const parsedValue = Number(nextValue);
            onChange(Number.isNaN(parsedValue) ? nextValue : parsedValue);
          }}
          question={question}
          value={getNumberValue(value)}
        />
      );
    case 'date':
      return (
        <TextLikeQuestion
          error={error}
          onChange={onChange}
          question={question}
          value={getStringValue(value)}
        />
      );
    case 'email':
      return (
        <TextLikeQuestion
          error={error}
          keyboardType="email-address"
          onChange={onChange}
          question={question}
          value={getStringValue(value)}
        />
      );
    case 'url':
      return (
        <TextLikeQuestion
          error={error}
          keyboardType="url"
          onChange={onChange}
          question={question}
          value={getStringValue(value)}
        />
      );
    case 'phone':
      return (
        <TextLikeQuestion
          error={error}
          keyboardType="phone-pad"
          onChange={onChange}
          question={question}
          value={getStringValue(value)}
        />
      );
    case 'single_select_card':
      return (
        <SingleSelectCardQuestion
          error={error}
          onChange={onChange}
          question={question}
          value={value}
        />
      );
    case 'single_select_radio':
      return (
        <SingleSelectRadioQuestion
          error={error}
          onChange={onChange}
          question={question}
          value={value}
        />
      );
    case 'multi_select_card':
      return (
        <MultiSelectCardQuestion
          error={error}
          onChange={onChange}
          question={question}
          value={value}
        />
      );
    case 'multi_select_chip':
      return (
        <MultiSelectChipQuestion
          error={error}
          onChange={onChange}
          question={question}
          value={value}
        />
      );
    case 'dropdown':
      return (
        <DropdownQuestion
          error={error}
          onChange={onChange}
          question={question}
          value={value}
        />
      );
    case 'searchable_dropdown':
      return (
        <SearchableDropdownQuestion
          error={error}
          onChange={onChange}
          question={question}
          value={value}
        />
      );
    case 'grouped_list':
      return (
        <GroupedListQuestion
          error={error}
          onChange={onChange}
          question={question}
          value={value}
        />
      );
    case 'segmented':
      return (
        <SegmentedQuestion
          error={error}
          onChange={onChange}
          question={question}
          value={value}
        />
      );
    case 'currency_amount':
      return (
        <CurrencyAmountQuestion
          error={error}
          onChange={onChange}
          question={question}
          value={value}
        />
      );
    case 'text':
    default:
      return (
        <TextLikeQuestion
          error={error}
          onChange={onChange}
          question={question}
          value={getStringValue(value)}
        />
      );
  }
}
