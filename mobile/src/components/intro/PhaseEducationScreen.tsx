import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Button } from '../ui/Button';

type PhaseEducationScreenProps = {
  stepIndex: number;
  totalSteps: number;
  phaseName: string;
  tagline: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  nextHref?: string;
  nextLabel?: string;
  onNext?: () => void;
};

export function PhaseEducationScreen({
  stepIndex,
  totalSteps,
  phaseName,
  tagline,
  description,
  color,
  icon,
  nextHref,
  nextLabel = 'Next',
  onNext,
}: PhaseEducationScreenProps) {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-rove-cream">
      <View
        className="absolute top-0 left-0 right-0"
        style={{ height: 320, backgroundColor: `${color}18` }}
      />

      <View className="px-8 pt-4">
        <Text className="text-[10px] tracking-[3px] font-bold uppercase mb-2.5" style={{ color }}>
          Phase {stepIndex} of {totalSteps}
        </Text>
        <Text className="text-[38px] text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-SemiBold' }}>
          {phaseName}
        </Text>
        <Text className="text-[13px] text-rove-stone font-semibold mt-1.5">{tagline}</Text>
      </View>

      <View className="flex-1 items-center justify-center">{icon}</View>

      <View className="px-8 pb-5">
        <Text className="text-[14px] text-rove-charcoal font-medium leading-relaxed">{description}</Text>
      </View>

      <View className="flex-row justify-center gap-2 mb-6">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            style={{
              width: i === stepIndex - 1 ? 22 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: i === stepIndex - 1 ? color : '#E7DCC9',
            }}
          />
        ))}
      </View>

      <View className="flex-row items-center justify-between px-7 pb-11">
        {stepIndex > 1 ? (
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            hitSlop={12}
          >
            <Text className="text-xs font-semibold text-rove-stone/70">Back</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}
        <Button
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (onNext) {
              onNext();
            } else if (nextHref) {
              router.push(nextHref as any);
            }
          }}
          className="h-[54px] px-7 rounded"
        >
          <Text numberOfLines={1} className="text-rove-cream font-bold uppercase tracking-[1.5px] text-[13px]">{nextLabel}</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
