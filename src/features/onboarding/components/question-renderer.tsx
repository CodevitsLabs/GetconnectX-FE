import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

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

type CardBadgeStyle = {
  bg: string;
  border: string;
  icon: string;
  iconColor: string;
  library?: 'ionicons' | 'mci';
};

const CARD_BADGE_STYLES: Record<string, CardBadgeStyle> = {
  team: {
    bg: '#3A2812',
    border: '#5A3C18',
    icon: 'people',
    iconColor: '#FF9A3E',
  },
  rocket: {
    bg: '#2C2712',
    border: '#4A4218',
    icon: 'albums',
    iconColor: '#D4B83A',
  },
  founder_rocket: {
    bg: '#3A2812',
    border: '#5A3C18',
    icon: 'rocket',
    iconColor: '#FF9A3E',
  },
  cofounder_handshake: {
    bg: '#2C2712',
    border: '#4A4218',
    icon: 'handshake',
    iconColor: '#D4B83A',
    library: 'mci',
  },
  team_member_group: {
    bg: '#1F242E',
    border: '#2E3547',
    icon: 'people-outline',
    iconColor: '#CBD4E0',
  },
  default: {
    bg: '#2A2117',
    border: '#3A2E1E',
    icon: 'ellipse',
    iconColor: '#FF9A3E',
  },
};

function getCardBadgeStyle(option: OnboardingOption): CardBadgeStyle {
  return CARD_BADGE_STYLES[option.icon ?? 'default'] ?? CARD_BADGE_STYLES.default;
}

function CardBadgeIcon({ badge }: { badge: CardBadgeStyle }) {
  if (badge.library === 'mci') {
    return (
      <MaterialCommunityIcons
        color={badge.iconColor}
        name={badge.icon as React.ComponentProps<typeof MaterialCommunityIcons>['name']}
        size={26}
      />
    );
  }

  return (
    <Ionicons
      color={badge.iconColor}
      name={badge.icon as React.ComponentProps<typeof Ionicons>['name']}
      size={26}
    />
  );
}

function QuestionHeader({
  error,
  question,
}: {
  error?: string;
  question: OnboardingQuestion;
}) {
  const hasLabel = Boolean(question.label);
  const hasSubLabel = Boolean(question.sub_label);
  const hasHelper = Boolean(question.helper_text);

  if (!hasLabel && !hasSubLabel && !hasHelper && !error) {
    return null;
  }

  return (
    <View className="gap-2">
      {hasLabel || hasSubLabel ? (
        <View className="gap-1">
          {hasLabel ? (
            <AppText variant="subtitle">{question.label}</AppText>
          ) : null}
          {hasSubLabel ? (
            <AppText tone="muted">{question.sub_label}</AppText>
          ) : null}
        </View>
      ) : null}
      {hasHelper ? (
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

const FIELD_BG = 'bg-[#292929]';
const FIELD_BORDER = 'border-[#383838]';
const FIELD_CLASS = `${FIELD_BG} ${FIELD_BORDER}`;

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
        className={cn(FIELD_CLASS, multiline && 'min-h-[140px] py-4')}
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
  const badge = getCardBadgeStyle(option);
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);
  const wasSelectedRef = React.useRef(isSelected);

  React.useEffect(() => {
    if (isSelected && !wasSelectedRef.current) {
      scale.value = withSequence(
        withTiming(0.96, { duration: 90 }),
        withSpring(1.03, { damping: 8, stiffness: 180 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );
      glow.value = withSequence(
        withTiming(1, { duration: 180 }),
        withTiming(0.55, { duration: 320 })
      );
    }
    if (!isSelected && wasSelectedRef.current) {
      glow.value = withTiming(0, { duration: 180 });
    }
    wasSelectedRef.current = isSelected;
  }, [isSelected, scale, glow]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: glow.value * 0.6,
    shadowRadius: 14 + glow.value * 10,
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.975, { duration: 90 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 220 });
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}>
      <Animated.View
        className={cn(
          'flex-row items-center gap-4 rounded-[22px] border px-4 py-4',
          isSelected
            ? 'border-[#FF9A3E] bg-[#292929]'
            : 'border-[#383838] bg-[#292929]'
        )}
        style={[
          {
            borderCurve: 'continuous',
            shadowColor: '#FF9A3E',
            shadowOffset: { width: 0, height: 0 },
          },
          animatedStyle,
        ]}>
        <View
          className="h-14 w-14 items-center justify-center rounded-[16px] border"
          style={{
            backgroundColor: badge.bg,
            borderColor: badge.border,
            borderCurve: 'continuous',
          }}>
          <CardBadgeIcon badge={badge} />
        </View>
        <View className="flex-1 gap-1">
          <AppText variant="subtitle" className="text-[18px] text-white">
            {option.label}
          </AppText>
          {option.sub_label ? (
            <AppText className="text-[13px] text-text-muted">
              {option.sub_label}
            </AppText>
          ) : null}
        </View>
      </Animated.View>
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
      <View className="flex-row flex-wrap justify-center gap-2.5">
        {question.options?.map((option) => {
          const isSelected = currentValues.includes(option.value);
          const showIcon = Boolean(option.icon);

          return (
            <Pressable
              key={option.id}
              className={cn(
                'flex-row items-center gap-2 rounded-full border px-4 py-3',
                isSelected
                  ? 'border-[#FF9A3E] bg-[#2A2117]'
                  : 'border-border bg-surface'
              )}
              onPress={() => {
                if (isSelected) {
                  onChange(currentValues.filter((item) => item !== option.value));
                  return;
                }

                onChange([...currentValues, option.value]);
              }}>
              {showIcon ? (
                <MaterialCommunityIcons
                  color={isSelected ? '#FF9A3E' : '#98A2B3'}
                  name="target"
                  size={18}
                />
              ) : null}
              <AppText
                variant="bodyStrong"
                className={cn(isSelected ? 'text-[#FF9A3E]' : 'text-white')}>
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function SingleSelectChipQuestion({
  error,
  onChange,
  question,
  value,
}: QuestionRendererProps) {
  const currentValue = getStringValue(value);

  return (
    <View className="gap-3">
      <QuestionHeader error={error} question={question} />
      <View className="flex-row flex-wrap gap-2.5">
        {question.options?.map((option) => {
          const isSelected = currentValue === option.value;
          const iconName = (option.icon ?? 'ellipse-outline') as React.ComponentProps<
            typeof Ionicons
          >['name'];

          return (
            <Pressable
              key={option.id}
              onPress={() => onChange(option.value)}
              className={cn(
                'flex-row items-center gap-2 rounded-full border px-4 py-3',
                isSelected
                  ? 'border-[#FF9A3E] bg-[#292929]'
                  : 'border-[#383838] bg-[#292929]'
              )}>
              <Ionicons
                color={isSelected ? '#FF9A3E' : '#98A2B3'}
                name={iconName}
                size={18}
              />
              <AppText
                variant="bodyStrong"
                className={cn(isSelected ? 'text-[#FF9A3E]' : 'text-white')}>
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
    <View
      className="gap-3"
      style={{ zIndex: isOpen ? 40 : 1, elevation: isOpen ? 12 : 0 }}>
      <QuestionHeader error={error} question={question} />
      <View>
        <Pressable
          style={{ height: 56 }}
          className={cn(
            'flex-row items-center justify-between rounded-[16px] border px-4',
            isOpen ? 'border-[#FF9A3E] bg-[#2A2117]' : FIELD_CLASS
          )}
          onPress={() => setIsOpen((currentState) => !currentState)}>
          <AppText
            className={cn(
              currentValue ? 'text-white' : 'text-text-soft',
              isOpen && 'text-[#FF9A3E]'
            )}>
            {currentLabel}
          </AppText>
          <AppText
            variant="label"
            className="text-[10px]"
            style={{ color: isOpen ? '#FF9A3E' : '#98A2B3' }}>
            {isOpen ? '▲' : '▼'}
          </AppText>
        </Pressable>

        {isOpen ? (
          <View
            className="absolute left-0 right-0"
            style={{ top: 64, zIndex: 40, elevation: 12 }}>
            <AppCard className="p-1" style={{ maxHeight: 280 }}>
              <ScrollView
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator>
                {question.options?.map((option) => {
                  const isSelected = currentValue === option.value;

                  return (
                    <Pressable
                      key={option.id}
                      className={cn(
                        'rounded-[12px] px-3 py-3',
                        isSelected ? 'bg-[#2A2117]' : 'bg-transparent'
                      )}
                      onPress={() => {
                        onChange(option.value);
                        setIsOpen(false);
                      }}>
                      <AppText
                        variant="bodyStrong"
                        className={cn(isSelected ? 'text-[#FF9A3E]' : 'text-white')}>
                        {option.label}
                      </AppText>
                      {option.sub_label ? (
                        <AppText tone="muted">{option.sub_label}</AppText>
                      ) : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </AppCard>
          </View>
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
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const inputRef = React.useRef<React.ComponentRef<typeof TextInput>>(null);
  const currentValue = getStringValue(value);
  const currentLabel = currentValue
    ? getSelectedLabel(question.options, currentValue)
    : '';

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

  const openDropdown = () => {
    setIsOpen(true);
    setQuery('');
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setQuery('');
    inputRef.current?.blur();
  };

  return (
    <View
      className="gap-3"
      style={{ zIndex: isOpen ? 40 : 1, elevation: isOpen ? 12 : 0 }}>
      <QuestionHeader error={error} question={question} />
      <View>
        <Pressable
          onPress={() => (isOpen ? closeDropdown() : openDropdown())}
          style={{ height: 56 }}
          className={cn(
            'flex-row items-center justify-between rounded-[16px] border px-4',
            isOpen ? 'border-[#FF9A3E] bg-[#2A2117]' : FIELD_CLASS
          )}>
          <View className="flex-1">
            {isOpen ? (
              <TextInput
                ref={inputRef}
                autoCapitalize="words"
                autoCorrect={false}
                onChangeText={setQuery}
                placeholder={question.placeholder ?? 'Search'}
                placeholderTextColor="#667085"
                value={query}
                className="font-body text-[15px] text-white"
                style={{ paddingVertical: 0 }}
              />
            ) : (
              <AppText
                className={cn(
                  currentLabel ? 'text-white' : 'text-text-soft'
                )}
                numberOfLines={1}>
                {currentLabel || question.placeholder || 'Select one'}
              </AppText>
            )}
          </View>
          <AppText
            variant="label"
            className="ml-2 text-[10px]"
            style={{ color: isOpen ? '#FF9A3E' : '#98A2B3' }}>
            {isOpen ? '▲' : '▼'}
          </AppText>
        </Pressable>

        {isOpen ? (
          <View
            className="absolute left-0 right-0"
            style={{ top: 64, zIndex: 40, elevation: 12 }}>
            <AppCard className="p-1" style={{ maxHeight: 320 }}>
              <ScrollView
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator>
                {groupOptions(filteredOptions).map(([groupName, options]) => (
                  <View key={groupName} className="gap-1 pb-2">
                    <AppText tone="muted" variant="label" className="px-3 pt-2 pb-1">
                      {groupName}
                    </AppText>
                    {options.map((option) => {
                      const isSelected = currentValue === option.value;

                      return (
                        <Pressable
                          key={option.id}
                          className={cn(
                            'rounded-[12px] px-3 py-3',
                            isSelected ? 'bg-[#2A2117]' : 'bg-transparent'
                          )}
                          onPress={() => {
                            onChange(option.value);
                            closeDropdown();
                          }}>
                          <AppText
                            variant="bodyStrong"
                            className={cn(isSelected ? 'text-[#FF9A3E]' : 'text-white')}>
                            {option.label}
                          </AppText>
                        </Pressable>
                      );
                    })}
                  </View>
                ))}
                {filteredOptions.length === 0 ? (
                  <View className="px-3 py-4">
                    <AppText tone="muted">No results</AppText>
                  </View>
                ) : null}
              </ScrollView>
            </AppCard>
          </View>
        ) : null}
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

const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function padTwo(value: number) {
  return value.toString().padStart(2, '0');
}

function daysInMonth(year: number, month: number) {
  if (!year || !month) {
    return 31;
  }

  return new Date(year, month, 0).getDate();
}

function parseDateParts(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return { day: '', month: '', year: '' };
  }

  return { year: match[1], month: match[2], day: match[3] };
}

function assembleDate(year: string, month: string, day: string) {
  if (!year || !month || !day) {
    return '';
  }

  return `${year}-${month}-${day}`;
}

type DatePart = 'day' | 'month' | 'year';

function DateDropdown({
  displayValue,
  isOpen,
  label,
  onSelect,
  onToggle,
  options,
  placeholder,
  selectedValue,
}: {
  displayValue: string;
  isOpen: boolean;
  label: string;
  onSelect: (value: string) => void;
  onToggle: () => void;
  options: { label: string; value: string }[];
  placeholder: string;
  selectedValue: string;
}) {
  return (
    <View className="flex-1 gap-2" style={{ zIndex: isOpen ? 30 : 1 }}>
      <AppText tone="muted" variant="label" className="text-[10px]">
        {label}
      </AppText>
      <Pressable
        onPress={onToggle}
        style={{ height: 56 }}
        className={cn(
          'flex-row items-center justify-between rounded-[16px] border px-4',
          isOpen ? 'border-[#FF9A3E] bg-[#2A2117]' : FIELD_CLASS
        )}>
        <AppText
          className={cn(
            displayValue ? 'text-white' : 'text-text-soft',
            isOpen && 'text-[#FF9A3E]'
          )}>
          {displayValue || placeholder}
        </AppText>
        <AppText
          variant="label"
          className="text-[10px]"
          style={{ color: isOpen ? '#FF9A3E' : '#98A2B3' }}>
          {isOpen ? '▲' : '▼'}
        </AppText>
      </Pressable>

      {isOpen ? (
        <View
          className="absolute left-0 right-0"
          style={{
            top: 84,
            zIndex: 30,
            elevation: 12,
          }}>
          <AppCard className="p-1" style={{ maxHeight: 240 }}>
            <ScrollView
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator>
              {options.map((option) => {
                const isSelected = option.value === selectedValue;

                return (
                  <Pressable
                    key={option.value}
                    className={cn(
                      'rounded-[12px] px-3 py-3',
                      isSelected ? 'bg-[#2A2117]' : 'bg-transparent'
                    )}
                    onPress={() => onSelect(option.value)}>
                    <AppText
                      variant="bodyStrong"
                      className={cn(isSelected ? 'text-[#FF9A3E]' : 'text-white')}>
                      {option.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </ScrollView>
          </AppCard>
        </View>
      ) : null}
    </View>
  );
}

function DateSelectQuestion({
  error,
  onChange,
  question,
  value,
}: QuestionRendererProps) {
  const externalValue = getStringValue(value);
  const [draftParts, setDraftParts] = React.useState(() =>
    parseDateParts(externalValue)
  );
  const [openPart, setOpenPart] = React.useState<DatePart | null>(null);

  React.useEffect(() => {
    if (!externalValue) {
      return;
    }

    const externalParts = parseDateParts(externalValue);

    setDraftParts((current) => {
      if (
        current.day === externalParts.day &&
        current.month === externalParts.month &&
        current.year === externalParts.year
      ) {
        return current;
      }

      return externalParts;
    });
  }, [externalValue]);

  const parts = draftParts;
  const currentYear = new Date().getFullYear();

  const yearOptions = React.useMemo(
    () =>
      Array.from({ length: 100 }).map((_, index) => {
        const year = currentYear - index;
        return { label: String(year), value: String(year) };
      }),
    [currentYear]
  );
  const monthOptions = React.useMemo(
    () =>
      MONTH_LABELS.map((label, index) => ({
        label,
        value: padTwo(index + 1),
      })),
    []
  );
  const dayCount = daysInMonth(Number(parts.year), Number(parts.month));
  const dayOptions = React.useMemo(
    () =>
      Array.from({ length: dayCount }).map((_, index) => ({
        label: String(index + 1),
        value: padTwo(index + 1),
      })),
    [dayCount]
  );

  const monthDisplay = React.useMemo(() => {
    if (!parts.month) return '';
    const found = monthOptions.find((option) => option.value === parts.month);
    return found ? found.label.slice(0, 3) : '';
  }, [parts.month, monthOptions]);

  const updatePart = (part: DatePart, nextValue: string) => {
    const nextParts = { ...parts, [part]: nextValue };

    if (part === 'month' || part === 'year') {
      const clampLimit = daysInMonth(
        Number(part === 'year' ? nextValue : nextParts.year),
        Number(part === 'month' ? nextValue : nextParts.month)
      );

      if (nextParts.day && Number(nextParts.day) > clampLimit) {
        nextParts.day = padTwo(clampLimit);
      }
    }

    setDraftParts(nextParts);
    onChange(assembleDate(nextParts.year, nextParts.month, nextParts.day));
    setOpenPart(null);
  };

  const togglePart = (part: DatePart) => {
    setOpenPart((current) => (current === part ? null : part));
  };

  return (
    <View
      className="gap-3"
      style={{ zIndex: openPart ? 30 : 1, elevation: openPart ? 12 : 0 }}>
      <QuestionHeader error={error} question={question} />
      <View className="flex-row items-start gap-3">
        <DateDropdown
          displayValue={parts.day}
          isOpen={openPart === 'day'}
          label="Day"
          onSelect={(nextValue) => updatePart('day', nextValue)}
          onToggle={() => togglePart('day')}
          options={dayOptions}
          placeholder="DD"
          selectedValue={parts.day}
        />
        <DateDropdown
          displayValue={monthDisplay}
          isOpen={openPart === 'month'}
          label="Month"
          onSelect={(nextValue) => updatePart('month', nextValue)}
          onToggle={() => togglePart('month')}
          options={monthOptions}
          placeholder="MMM"
          selectedValue={parts.month}
        />
        <DateDropdown
          displayValue={parts.year}
          isOpen={openPart === 'year'}
          label="Year"
          onSelect={(nextValue) => updatePart('year', nextValue)}
          onToggle={() => togglePart('year')}
          options={yearOptions}
          placeholder="YYYY"
          selectedValue={parts.year}
        />
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
        <DateSelectQuestion
          error={error}
          onChange={onChange}
          question={question}
          value={value}
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
    case 'single_select_chip':
      return (
        <SingleSelectChipQuestion
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
