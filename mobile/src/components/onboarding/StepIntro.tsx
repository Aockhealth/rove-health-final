import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { getLocalizedFontFamily } from '../../lib/fonts';

export function StepIntro() {
  const { t, i18n } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center px-1 py-10">
      <Animated.View entering={FadeIn.duration(500)}>
        <Text className="text-[13px] tracking-[5px] text-rove-stone uppercase" style={{ fontFamily: 'CormorantGaramond-Medium' }}>
          Rove
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(150).duration(600)} className="mt-8 items-center gap-4">
        <Text
          className="text-4xl text-rove-charcoal text-center"
          style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-SemiBold', i18n.language) }}
        >
          {t('onboarding.intro.title')}
        </Text>
        <Text className="max-w-[320px] text-center text-sm leading-relaxed text-rove-stone font-medium">
          {t('onboarding.intro.subtitle')}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(600)} className="mt-8 w-full max-w-[300px]">
        <View className="border-t border-b border-rove-stone/20 py-3">
          <Text className="text-center text-[11px] font-semibold uppercase tracking-wider text-rove-stone">
            {t('onboarding.intro.timeNote')}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}
