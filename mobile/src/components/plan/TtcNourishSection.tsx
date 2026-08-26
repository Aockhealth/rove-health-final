import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { TTC_GUIDANCE, type TtcMealIdea } from '@shared/content/ttc-guidance';
import { Card, ACCENT } from './ttcCardKit';

const MEAL_ICONS: Record<TtcMealIdea['time'], keyof typeof Feather.glyphMap> = {
  Morning: 'sunrise',
  'Mid-Morning': 'coffee',
  Lunch: 'sun',
  Evening: 'cloud',
  Dinner: 'moon',
};

/**
 * TTC mode's Nourish tab — leads with concrete meal ideas (no cycle-sync
 * analog: sync's Nourish tab doesn't have a time-of-day meal list, so this
 * stays its own card), then the same MacroFuelGauge/NutritionTrackerCard/
 * RiverTrack/DietCheatSheet/RoveChef sequence cycle-sync uses, fed TTC data —
 * see plan/index.tsx's TTC diet branch for the rest of the tab.
 */
export function TtcNourishSection() {
  const g = TTC_GUIDANCE;

  return (
    <View className="mb-2">
      <Card icon="coffee" title="Meal Ideas">
        {g.mealIdeas.map((meal, i) => (
          <View
            key={`${meal.time}-${i}`}
            className={`flex-row gap-3 ${i === g.mealIdeas.length - 1 ? '' : 'mb-4 pb-4 border-b border-white/50'}`}
          >
            <View className="w-8 h-8 rounded-xl items-center justify-center" style={{ backgroundColor: `${ACCENT}18` }}>
              <Feather name={MEAL_ICONS[meal.time]} size={14} color={ACCENT} />
            </View>
            <View className="flex-1">
              <Text className="text-[9.5px] font-bold uppercase tracking-widest mb-1" style={{ color: ACCENT }}>
                {meal.time}
              </Text>
              <Text className="text-[13.5px] font-semibold text-rove-charcoal leading-[19px]">{meal.idea}</Text>
              <Text className="text-[11.5px] text-rove-stone leading-[16px] mt-1">{meal.why}</Text>
            </View>
          </View>
        ))}
      </Card>

      <Animated.View
        entering={FadeInUp.delay(100).duration(500)}
        className="rounded-[20px] p-4"
        style={{ backgroundColor: '#FBF3E4', borderWidth: 1, borderColor: 'rgba(181,143,82,0.25)' }}
      >
        <Text className="mb-1.5 text-[9.5px] font-extrabold uppercase tracking-wide text-[#8B6A2E]">
          No fertility-boosting claims here
        </Text>
        <Text className="text-xs font-medium leading-relaxed text-rove-charcoal">{g.noClaimsNote}</Text>
      </Animated.View>
    </View>
  );
}
