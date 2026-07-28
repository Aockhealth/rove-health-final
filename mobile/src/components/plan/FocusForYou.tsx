import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { GOAL_CONTENT } from '@shared/content/goal-content';
import { SectionHeader } from './SectionHeader';

interface FocusForYouProps {
  goals: string[];
  hasWeightGoal: boolean;
  themeColor: string;
}

export function FocusForYou({ goals, hasWeightGoal, themeColor }: FocusForYouProps) {
  const router = useRouter();

  const entries = goals
    .filter((id) => id !== 'weight_loss' || !hasWeightGoal)
    .map((id) => ({ id, content: GOAL_CONTENT[id] }))
    .filter((g): g is { id: string; content: NonNullable<(typeof g)['content']> } => !!g.content);

  if (entries.length === 0) return null;

  return (
    <Animated.View entering={FadeInUp.delay(350).duration(500)} className="mb-10">
      <SectionHeader icon="target" title="Focus For You" color={themeColor} />
      <View className="gap-3">
        {entries.map(({ id, content }) => (
          <View
            key={id}
            className="rounded-[24px] border border-white/60 bg-white/70 p-5"
            style={{
              shadowColor: '#000',
              shadowOpacity: 0.06,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 0,
            }}
          >
            <View className="flex-row items-start gap-3">
              <View
                className="h-9 w-9 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${themeColor}15` }}
              >
                <Feather name={content.icon as any} size={16} color={themeColor} />
              </View>
              <View className="flex-1">
                <Text className="text-base text-rove-charcoal" style={{ fontFamily: 'CormorantGaramond-SemiBold' }}>
                  {content.title}
                </Text>
                <Text className="mt-1 text-[13px] leading-5 text-rove-stone">{content.body}</Text>
                {content.cta ? (
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      if (content.cta!.target === 'learn') {
                        router.push('/(app)/learn' as any);
                      }
                    }}
                    className="mt-3 self-start"
                  >
                    <Text className="text-xs font-bold uppercase tracking-widest" style={{ color: themeColor }}>
                      {content.cta.label} →
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}
