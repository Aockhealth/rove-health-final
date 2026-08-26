import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Button } from '../../components/ui/Button';
import { markIntroSeen } from '../../lib/introFlow';

export default function PlanIntro() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-rove-cream">
      <View className="flex-1 items-center justify-center pt-10">
        <Svg width={280} height={220} viewBox="0 0 280 220">
          <Defs>
            <LinearGradient id="planWave" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor="#AF6B6B" />
              <Stop offset="38%" stopColor="#D4A25F" />
              <Stop offset="68%" stopColor="#8DAA9D" />
              <Stop offset="100%" stopColor="#7B82A8" />
            </LinearGradient>
          </Defs>
          <Path
            d="M20 150 C60 100 100 100 140 120 C180 140 220 60 260 40"
            fill="none"
            stroke="url(#planWave)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeDasharray="1 9"
          />

          <Circle cx={52} cy={128} r={26} fill="#FFFFFF" stroke="#AF6B6B" strokeWidth={1.4} />
          <Path d="M52 138 C46 138 41 133 41 126 C41 118 52 112 52 112 C52 112 63 118 63 126 C63 133 58 138 52 138 Z" fill="#AF6B6B" opacity={0.85} />

          <Circle cx={146} cy={114} r={26} fill="#FFFFFF" stroke="#8DAA9D" strokeWidth={1.4} />
          <Path d="M134 122 L142 108 L149 118 L157 100" fill="none" stroke="#8DAA9D" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />

          <Circle cx={242} cy={52} r={26} fill="#FFFFFF" stroke="#7B82A8" strokeWidth={1.4} />
          <Circle cx={242} cy={52} r={12} fill="#7B82A8" opacity={0.9} />
          <Circle cx={248} cy={47} r={10} fill="#FFFFFF" />
        </Svg>
      </View>

      <View className="px-8 pb-5">
        <Text className="text-[34px] text-rove-charcoal mb-3.5" style={{ fontFamily: 'CormorantGaramond-SemiBold' }}>
          Rove turns that pattern into a plan.
        </Text>
        <Text className="text-[14px] text-rove-stone font-medium leading-relaxed">
          Food, movement and rest, tuned to whichever phase you're in today. Not a generic reminder, a plan built around your own cycle.
        </Text>
      </View>

      <View className="flex-row justify-center gap-2 mb-6">
        <View className="w-1.5 h-1.5 rounded-full bg-rove-stone/20" />
        <View className="w-[22px] h-1.5 rounded-full bg-rove-charcoal" />
      </View>

      <View className="flex-row items-center justify-between px-7 pb-11">
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          hitSlop={12}
        >
          <Text className="text-xs font-semibold text-rove-stone/70">Back</Text>
        </TouchableOpacity>
        <Button
          onPress={async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            await markIntroSeen();
            router.replace('/(auth)/login');
          }}
          className="h-[54px] px-7 rounded"
        >
          <Text numberOfLines={1} className="text-rove-cream font-bold uppercase tracking-[1.5px] text-[13px]">Get Started</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
