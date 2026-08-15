import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Input } from '../ui/Input';
import { DateSelect } from '../ui/DateSelect';

type StepWelcomeProps = {
  name: string;
  dateOfBirth: string;
  onNameChange: (value: string) => void;
  onDobChange: (value: string) => void;
  errors: Record<string, string>;
};

export function StepWelcome({ name, dateOfBirth, onNameChange, onDobChange, errors }: StepWelcomeProps) {
  return (
    <View className="gap-8 px-1 pb-10">
      <Animated.View entering={FadeInDown.delay(100).duration(500)} className="gap-3">
        <Text
          className="text-3xl text-rove-charcoal"
          style={{ fontFamily: 'CormorantGaramond-SemiBold' }}
        >
          Welcome to Rove
        </Text>
        <Text className="max-w-[320px] text-sm leading-relaxed text-rove-stone">
          Let's set up your profile. This takes about 2 minutes.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(250).duration(500)} className="gap-6">
        <View className="gap-2">
          <Text className="text-[11px] font-semibold uppercase tracking-widest text-rove-stone">
            What should we call you?
          </Text>
          <Input
            value={name}
            onChangeText={onNameChange}
            placeholder="Your name"
            autoComplete="name"
            error={errors.name}
          />
        </View>

        <View className="gap-2">
          <Text className="text-[11px] font-semibold uppercase tracking-widest text-rove-stone">
            Date of birth
          </Text>
          <Text className="text-xs text-rove-stone mb-1">
            Used to personalize your nutrition and calorie recommendations.
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
