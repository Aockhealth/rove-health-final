import React from 'react';
import { View, Text, Image } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

export function StepIntro() {
  return (
    <View className="flex-1 items-center justify-center px-1 py-10">
      <Animated.View
        entering={ZoomIn.duration(600)}
        className="h-32 w-32 items-center justify-center rounded-full bg-white/80 shadow-sm"
      >
        <View className="absolute -inset-4 rounded-full border border-rove-charcoal/10" />
        <Image
          source={require('../../../assets/images/splash-mark.png')}
          className="h-16 w-16"
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(600)} className="mt-8 items-center gap-4">
        <Text
          className="text-4xl text-rove-charcoal text-center"
          style={{ fontFamily: 'CormorantGaramond-SemiBold' }}
        >
          Welcome to Rove
        </Text>
        <Text className="max-w-[320px] text-center text-base leading-relaxed text-rove-charcoal/80">
          Your personal health companion. We'll ask a few quick questions to tailor your experience to
          your unique biology.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(600)} className="mt-8 w-full max-w-[300px]">
        <View className="rounded-2xl border border-rove-charcoal/10 bg-white/60 p-4">
          <Text className="text-center text-xs font-semibold text-rove-charcoal/80">
            Takes about 2 minutes. All data is securely encrypted.
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}
