import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { Plus, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { fetchMealsForDate, deleteMeal, sumMacroTotals, type MealEntry } from '../../lib/nutrition';
import { getLocalizedFontFamily } from '../../lib/fonts';
import { MealLogSheet } from './MealLogSheet';
import { giCategory, GI_CATEGORY_COLOR } from '@shared/content/glycemic-index';

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface Targets {
  /** The full ceiling for today, already including earnedCalories — this is what the progress bar measures against. */
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  /** Daily max, not a "reach this" target. Defaults to the WHO guideline
   * (free sugar <10% of total energy) when not supplied — see WHO_SUGAR_CALORIE_SHARE. */
  sugar?: number;
  /** How much of `calories` today's logged exercise earned back, if any — see calculateEarnedCalories. Shown as a breakdown, not a separate bar. */
  earnedCalories?: number;
}

// WHO's strong recommendation caps free sugar at <10% of total energy
// intake. Used as the default max whenever a personalized target isn't
// available (nutrition_guide.macro_fuel doesn't compute one today).
const WHO_SUGAR_CALORIE_SHARE = 0.1;
const CALORIES_PER_GRAM_SUGAR = 4;

function ProgressRow({
  label,
  logged,
  target,
  unit,
  color,
  warnOnExceed,
}: {
  label: string;
  logged: number;
  target: number;
  unit: string;
  color: string;
  /** Flags this as a "stay under" nutrient (e.g. sugar) rather than a "reach this" one — the bar and count turn warning-red past 100%. */
  warnOnExceed?: boolean;
}) {
  const exceeded = !!warnOnExceed && target > 0 && logged > target;
  const pct = target > 0 ? Math.min(1, logged / target) : 0;
  const barColor = exceeded ? GI_CATEGORY_COLOR.High : color;
  return (
    <View className="mb-2.5">
      <View className="mb-1 flex-row items-baseline justify-between">
        <Text className="text-[11px] font-semibold text-rove-stone">{label}</Text>
        <Text className="text-[11px] font-semibold text-rove-stone">
          <Text style={{ color: exceeded ? GI_CATEGORY_COLOR.High : '#2D2420', fontWeight: '700' }}>{logged}</Text> / {target}{unit}
        </Text>
      </View>
      <View className="h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
        <View style={{ width: `${pct * 100}%`, backgroundColor: barColor, height: '100%', borderRadius: 999 }} />
      </View>
    </View>
  );
}

/**
 * The tracking half of nutrition — logged intake vs. the phase-based targets
 * MacroFuelGauge already shows. Deliberately placed alongside it rather than
 * rewritten into it, since that component's animated orb isn't built to
 * carry a second data source.
 */
export function NutritionTrackerCard({ targets, theme }: { targets: Targets; theme: { color: string; gradientColors?: readonly [string, string, ...string[]] } }) {
  const { t, i18n } = useTranslation();
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const sheetRef = useRef<BottomSheetModal>(null);
  const dateKey = todayKey();

  const reload = useCallback(() => {
    fetchMealsForDate(dateKey).then(setMeals);
  }, [dateKey]);

  useEffect(() => {
    reload();
  }, [reload]);

  const totals = sumMacroTotals(meals);
  const sugarTarget = targets.sugar ?? Math.round((targets.calories * WHO_SUGAR_CALORIE_SHARE) / CALORIES_PER_GRAM_SUGAR);

  const handleDelete = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMeals((prev) => prev.filter((m) => m.id !== id));
    await deleteMeal(id);
  };

  const handleOpen = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sheetRef.current?.present();
  };

  return (
    <View
      className="relative mb-4 overflow-hidden rounded-[28px] border border-white/60 p-5"
      style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: Platform.OS === 'ios' ? 4 : 3 }}
    >
      {Platform.OS === 'ios' ? (
        <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFillObject} />
      ) : (
        <LinearGradient colors={theme.gradientColors ?? ['#FAF9F6', '#FFFFFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFillObject} />
      )}

      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-lg text-rove-charcoal" style={{ fontFamily: getLocalizedFontFamily('CormorantGaramond-SemiBold', i18n.language) }}>
          {t('plan.nutritionTrackerCard.todaysIntake')}
        </Text>
        <Pressable
          onPress={handleOpen}
          className="flex-row items-center gap-1 rounded-full px-3 py-1.5"
          style={{ backgroundColor: theme.color }}
        >
          <Plus size={13} color="#FFFFFF" />
          <Text className="text-[11px] font-bold text-white">{t('plan.mealLogSheet.logAMeal')}</Text>
        </Pressable>
      </View>

      <ProgressRow label={t('plan.mealLogSheet.fields.calories')} logged={totals.calories} target={targets.calories} unit="" color={theme.color} />
      {!!targets.earnedCalories && (
        <Text className="mb-2.5 -mt-1.5 text-[10px] font-semibold text-rove-stone">
          {t('plan.nutritionTrackerCard.earnedCalories', { count: targets.earnedCalories })}
        </Text>
      )}
      <ProgressRow label={t('plan.mealLogSheet.fields.protein')} logged={totals.proteinG} target={targets.protein} unit="g" color={theme.color} />
      <ProgressRow label={t('plan.mealLogSheet.fields.carbs')} logged={totals.carbsG} target={targets.carbs} unit="g" color={theme.color} />
      <ProgressRow label={t('plan.nutritionTrackerCard.fats')} logged={totals.fatG} target={targets.fats} unit="g" color={theme.color} />
      <ProgressRow label={t('plan.mealLogSheet.fields.sugar')} logged={totals.sugarG} target={sugarTarget} unit="g" color={theme.color} warnOnExceed />

      {meals.length > 0 ? (
        <View className="mt-3 gap-1.5 border-t border-black/[0.05] pt-3">
          {meals.map((m) => {
            const category = m.glycemicIndex !== null ? giCategory(m.glycemicIndex) : null;
            return (
              <View key={m.id} className="flex-row items-center justify-between">
                <Text className="flex-1 text-[12.5px] text-rove-charcoal" numberOfLines={1}>{m.name}</Text>
                {category ? (
                  <View
                    className="mr-2 px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: `${GI_CATEGORY_COLOR[category]}20` }}
                  >
                    <Text className="text-[9px] font-bold uppercase tracking-wide" style={{ color: GI_CATEGORY_COLOR[category] }}>
                      {t('plan.gi.pill')} {m.glycemicIndex}
                    </Text>
                  </View>
                ) : null}
                {m.calories !== null ? (
                  <Text className="mr-2 text-[11px] text-rove-stone">{t('plan.nutritionTrackerCard.kcal', { count: m.calories })}</Text>
                ) : null}
                <Pressable onPress={() => handleDelete(m.id)} hitSlop={8}>
                  <X size={13} color="#A8A29E" />
                </Pressable>
              </View>
            );
          })}
        </View>
      ) : (
        <Text className="mt-3 text-[11.5px] text-rove-stone">{t('plan.nutritionTrackerCard.nothingLoggedYet')}</Text>
      )}

      <MealLogSheet ref={sheetRef} dateKey={dateKey} onSaved={reload} />
    </View>
  );
}
