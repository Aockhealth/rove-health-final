import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Brain, Wind } from 'lucide-react-native';
import { useRouter } from 'expo-router';

type MentalHealthCheckCardProps = {
  theme: any;
};

export function MentalHealthCheckCard({ theme }: MentalHealthCheckCardProps) {
  const router = useRouter();
  const themeColor = theme?.color || '#78716C';

  const goToAssessment = (type: 'phq9' | 'gad7') => {
    router.push({ pathname: '/wellbeing/intro', params: { type } });
  };

  return (
    <View
      className="relative rounded-[32px] p-6 flex flex-col mb-4 overflow-hidden border border-white/60"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.45)', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 4 }}
    >
      {/* Blob */}
      <View
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-30"
        style={{ backgroundColor: themeColor, transform: [{ scale: 1.5 }] }}
      />

      {/* Blur overlay to soften the blob */}
      <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFillObject} />

      <View className="relative z-10 flex flex-col gap-5">
        {/* Header */}
        <View>
          <Text className="text-xl text-rove-charcoal mb-1" style={{ fontFamily: 'CormorantGaramond-SemiBold' }}>
            How have you really been feeling lately?
          </Text>
          <Text className="text-[10px] font-bold uppercase tracking-widest text-rove-stone opacity-70">
            Reflects how you've felt over the past 2 weeks
          </Text>
        </View>

        {/* Assessment Links */}
        <View className="flex flex-col gap-3">
          <Pressable
            onPress={() => goToAssessment('phq9')}
            className="flex-row items-start gap-4 p-4 rounded-2xl border border-black/5 shadow-sm"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
          >
            <View
              className="w-10 h-10 rounded-full items-center justify-center shadow-sm bg-white"
              style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}
            >
              <Brain size={18} color={themeColor} />
            </View>
            <View className="flex-1">
              <Text className="text-base text-rove-charcoal mb-0.5" style={{ fontFamily: 'CormorantGaramond-SemiBold' }}>
                Mood check <Text style={{ color: themeColor }} className="text-sm">(PHQ-9)</Text>
              </Text>
              <Text className="text-xs text-rove-stone leading-relaxed">
                A widely used screening tool for low mood and depressive symptoms.
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => goToAssessment('gad7')}
            className="flex-row items-start gap-4 p-4 rounded-2xl border border-black/5 shadow-sm"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
          >
            <View
              className="w-10 h-10 rounded-full items-center justify-center shadow-sm bg-white"
              style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}
            >
              <Wind size={18} color={themeColor} />
            </View>
            <View className="flex-1">
              <Text className="text-base text-rove-charcoal mb-0.5" style={{ fontFamily: 'CormorantGaramond-SemiBold' }}>
                Anxiety check <Text style={{ color: themeColor }} className="text-sm">(GAD-7)</Text>
              </Text>
              <Text className="text-xs text-rove-stone leading-relaxed">
                A widely used screening tool for anxiety symptoms.
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Divider */}
        <View className="h-px w-full" style={{ backgroundColor: 'rgba(168, 162, 158, 0.2)' }} />

        {/* Footer Disclaimer */}
        <Text className="text-center text-[10px] font-bold uppercase tracking-widest text-rove-stone opacity-70">
          For self-reflection only. Not a diagnosis.
        </Text>
      </View>
    </View>
  );
}
