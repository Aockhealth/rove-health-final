import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Path } from 'react-native-svg';
import { Button } from '../../components/ui/Button';
import { markIntroSeen } from '../../lib/introFlow';

export default function WhyMattersIntro() {
  const router = useRouter();

  const skip = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await markIntroSeen();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-rove-cream">
      <View className="flex-1 items-center justify-center pt-10">
        <Svg width={260} height={260} viewBox="0 0 260 260">
          <Circle cx={130} cy={130} r={104} fill="none" stroke="#E7DCC9" strokeWidth={1} />
          <Path d="M130 26 A104 104 0 0 1 234 130" fill="none" stroke="#AF6B6B" strokeWidth={10} strokeLinecap="round" />
          <Path d="M234 130 A104 104 0 0 1 130 234" fill="none" stroke="#D4A25F" strokeWidth={10} strokeLinecap="round" />
          <Path d="M130 234 A104 104 0 0 1 26 130" fill="none" stroke="#8DAA9D" strokeWidth={10} strokeLinecap="round" />
          <Path d="M26 130 A104 104 0 0 1 130 26" fill="none" stroke="#7B82A8" strokeWidth={10} strokeLinecap="round" />
          <Circle cx={130} cy={130} r={58} fill="#FFFFFF" />
          <Circle cx={130} cy={130} r={58} fill="none" stroke="#E7DCC9" strokeWidth={1} />
          <Path d="M130 130 C125.5 117 123 105 130 94 C137 105 134.5 117 130 130 Z" fill="#AF6B6B" opacity={0.92} transform="rotate(0 130 130)" />
          <Path d="M130 130 C125.5 117 123 105 130 94 C137 105 134.5 117 130 130 Z" fill="#D4A25F" opacity={0.9} transform="rotate(72 130 130)" />
          <Path d="M130 130 C125.5 117 123 105 130 94 C137 105 134.5 117 130 130 Z" fill="#AF6B6B" opacity={0.78} transform="rotate(144 130 130)" />
          <Path d="M130 130 C125.5 117 123 105 130 94 C137 105 134.5 117 130 130 Z" fill="#D4A25F" opacity={0.7} transform="rotate(216 130 130)" />
          <Path d="M130 130 C125.5 117 123 105 130 94 C137 105 134.5 117 130 130 Z" fill="#AF6B6B" opacity={0.6} transform="rotate(288 130 130)" />
          <Circle cx={130} cy={130} r={6} fill="#FFFFFF" />
          <Circle cx={130} cy={130} r={6} fill="none" stroke="#D4A25F" strokeWidth={1} />
        </Svg>
      </View>

      <View className="px-8 pb-5">
        <Text className="text-[34px] text-rove-charcoal mb-3.5" style={{ fontFamily: 'CormorantGaramond-SemiBold' }}>
          There's a reason some days feel different.
        </Text>
        <Text className="text-[14px] text-rove-stone font-medium leading-relaxed">
          Energy, mood, focus and appetite all shift with your cycle. Rove shows you the pattern, so nothing catches you off guard.
        </Text>
      </View>

      <View className="flex-row justify-center gap-2 mb-6">
        <View className="w-[22px] h-1.5 rounded-full bg-rove-charcoal" />
        <View className="w-1.5 h-1.5 rounded-full bg-rove-stone/20" />
      </View>

      <View className="flex-row items-center justify-between px-7 pb-11">
        <TouchableOpacity onPress={skip} hitSlop={12}>
          <Text className="text-xs font-semibold text-rove-stone/70">Skip</Text>
        </TouchableOpacity>
        <Button
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/intro/plan');
          }}
          className="h-[54px] w-40 rounded"
        >
          <Text className="text-rove-cream font-bold uppercase tracking-[2.5px] text-[13px]">Next</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
