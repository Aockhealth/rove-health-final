import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Input } from '../ui/Input';
import { DateSelect } from '../ui/DateSelect';
import { getLocalizedFontFamily } from '../../lib/fonts';

type StepWelcomeProps = {
  name: string;
  dateOfBirth: string;
  onNameChange: (value: string) => void;
  onDobChange: (value: string) => void;
  errors: Record<string, string>;
};

export function StepWelcome({ name, dateOfBirth, onNameChange, onDobChange, errors }: StepWelcomeProps) {
  const { t, i18n } = useTranslation();
  return (
    <View className="gap-8 px-1 pb-10">
      <Animated.View entering={FadeInDown.delay(100).duration(500)} className="gap-3">
        <Text
          className="text-3xl text-rove-charcoal"
          style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-SemiBold', i18n.language) }}
        >
          {t('onboarding.welcome.title')}
        </Text>
        <Text className="max-w-[320px] text-sm leading-relaxed text-rove-stone">
          {t('onboarding.welcome.subtitle')}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(250).duration(500)} className="gap-6">
        <View className="gap-2">
          <Text className="text-[11px] font-semibold uppercase tracking-widest text-rove-stone">
            {t('onboarding.welcome.nameLabel')}
          </Text>
          <Input
            className="border-0 border-b border-rove-stone/30 rounded-none bg-transparent px-0 pb-3 h-auto text-rove-charcoal"
            value={name}
            onChangeText={onNameChange}
            placeholder={t('onboarding.welcome.namePlaceholder')}
            placeholderTextColor="#A99B87"
            autoComplete="name"
            error={errors.name}
          />
        </View>

        <View className="gap-2">
          <Text className="text-[11px] font-semibold uppercase tracking-widest text-rove-stone">
            {t('onboarding.welcome.dobLabel')}
          </Text>
          <Text className="text-xs text-rove-stone mb-1">
            {t('onboarding.welcome.dobNote')}
          </Text>
          <DateSelect
            value={dateOfBirth}
            onValueChange={onDobChange}
            error={errors.dateOfBirth}
          />
          {errors.dateOfBirth ? (
            <Text className="text-sm text-rove-red mt-1">{errors.dateOfBirth}</Text>
          ) : null}
        </View>
      </Animated.View>
    </View>
  );
}
