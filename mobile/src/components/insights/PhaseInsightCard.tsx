import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, FadeIn } from 'react-native-reanimated';

type PhaseInsightCardProps = {
  phase: string;
  day: number;
  insight?: { title?: string; insight: string } | null;
  theme: any;
  isGenerating?: boolean;
  hasError?: boolean;
  onGenerateInsight?: () => void;
};

// Simple typing effect component for React Native
function TypingText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setIsComplete(false);

    const timeout = setTimeout(() => {
      let i = 0;
      const intervalId = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(text.slice(0, i + 1));
          i++;
        } else {
          setIsComplete(true);
          clearInterval(intervalId);
        }
      }, 20);

      return () => clearInterval(intervalId);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, delay]);

  const cursorOpacity = useSharedValue(1);
  useEffect(() => {
    if (!isComplete) {
      cursorOpacity.value = withRepeat(
        withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      cursorOpacity.value = 0;
    }
  }, [isComplete]);

  const animatedCursorStyle = useAnimatedStyle(() => ({
    opacity: cursorOpacity.value,
  }));

  return (
    <Text className="text-sm leading-relaxed text-rove-stone">
      {displayedText}
      {!isComplete && (
        <Animated.Text style={[{ color: '#78716C', fontSize: 16, fontWeight: 'bold' }, animatedCursorStyle]}>|</Animated.Text>
      )}
    </Text>
  );
}

export function PhaseInsightCard({
  phase,
  day,
  insight,
  theme,
  isGenerating,
  hasError,
  onGenerateInsight
}: PhaseInsightCardProps) {
  const getPhaseIcon = (p: string) => {
    switch(p) {
      case 'Menstrual': return 'droplet';
      case 'Follicular': return 'star';
      case 'Ovulatory': return 'zap'; // Flame equivalent
      case 'Luteal': return 'moon';
      default: return 'activity';
    }
  };

  return (
    <View 
      className="relative rounded-[32px] p-6 flex flex-col mb-4 overflow-hidden border border-white/60"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.45)', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 4 }}
    >
      {/* Blob */}
      <View
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-30"
        style={{ backgroundColor: theme.color, transform: [{ scale: 1.5 }] }}
      />
      
      {/* Blur overlay to soften the blob */}
      <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFillObject} />

      <View className="relative z-10 flex flex-col gap-5">
        {/* Header */}
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-[10px] font-bold uppercase tracking-[3px]" style={{ color: theme.color }}>
              DAY {day} INSIGHT
            </Text>
            <Text className="text-2xl mt-1 text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-SemiBold' }}>
              {insight?.title || 'Personalized AI Analysis'}
            </Text>
          </View>

          <View className="w-12 h-12 rounded-full flex items-center justify-center border border-white/40" style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 }}>
            <Feather name={getPhaseIcon(phase) as any} size={20} color={theme.color} />
          </View>
        </View>

        {/* Insight Content Box */}
        <View className="relative mt-2 p-5 rounded-[24px] border border-white/60 shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.55)', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 }}>
          {/* Accent Line */}
          {(insight?.insight || isGenerating) ? (
            <Animated.View entering={FadeIn.delay(200).duration(800)} className="absolute left-0 top-5 bottom-5 w-1 rounded-r-full opacity-60" style={{ backgroundColor: theme.color }} />
          ) : null}

          <View className="pl-4 min-h-[64px] justify-center">
            {insight?.insight ? (
              <TypingText text={insight.insight} delay={300} />
            ) : isGenerating ? (
              <Text className="text-sm leading-relaxed text-rove-stone/60 italic">
                Rove AI is analyzing your specific symptoms...
              </Text>
            ) : (
              <View className="flex-col gap-4">
                <Text className="text-sm leading-relaxed text-rove-stone">
                  {hasError
                    ? "Couldn't generate an insight — log a few moods for this phase, then try again."
                    : 'No analysis available yet for this phase. Generate one based on your recent logs.'}
                </Text>
                <Pressable
                  onPress={onGenerateInsight}
                  className="self-start px-5 py-2.5 rounded-xl border border-white/60 flex-row items-center justify-center mt-1 bg-white/70 shadow-sm"
                  style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}
                >
                  <Feather name="aperture" size={14} color={theme.color} style={{ marginRight: 6 }} />
                  <Text className="text-xs font-bold uppercase tracking-wider text-rove-charcoal">
                    {hasError ? 'Try Again' : 'Generate Insight'}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
